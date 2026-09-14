const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const CAN_WRITE = requireRole("super_admin", "editor", "reporter", "video_editor", "photo_editor");
const CAN_PUBLISH = requireRole("super_admin", "editor");
const CAN_DELETE = requireRole("super_admin", "editor");

const SELECT_BASE = `
  SELECT a.*, c.slug AS category_slug, c.name AS category_name, c.color_var AS category_color,
         ci.slug AS city_slug, ci.name AS city_name,
         u.name AS author_name, u.role AS author_role
  FROM articles a
  LEFT JOIN categories c ON c.id = a.category_id
  LEFT JOIN cities ci ON ci.id = a.city_id
  LEFT JOIN users u ON u.id = a.author_id
`;

function timeAgoHi(iso) {
  const then = new Date(iso.replace(" ", "T") + "Z").getTime();
  const diffMin = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (diffMin < 1) return "अभी अभी";
  if (diffMin < 60) return `${diffMin} मिनट पहले`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} घंटे पहले`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay} दिन पहले`;
}

function serialize(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    body: row.body,
    image_url: row.image_url,
    is_breaking: !!row.is_breaking,
    is_featured: !!row.is_featured,
    is_published: !!row.is_published,
    video_duration: row.video_duration,
    views: row.views,
    published_at: row.published_at,
    time_ago: timeAgoHi(row.published_at),
    category: row.category_id ? { id: row.category_id, slug: row.category_slug, name: row.category_name, color_var: row.category_color } : null,
    city: row.city_id ? { id: row.city_id, slug: row.city_slug, name: row.city_name } : null,
    author: row.author_id ? { id: row.author_id, name: row.author_name, role: row.author_role } : null,
  };
}

// PUBLIC LIST (with admin override: ?all=1 requires auth to see drafts)
router.get("/", (req, res) => {
  const { category, city, breaking, featured, limit, all } = req.query;
  const clauses = [];
  const params = [];

  if (all === "1" && req.session.user) {
    // admin view: allow drafts
  } else {
    clauses.push("a.is_published = 1");
  }
  if (category) {
    clauses.push("c.slug = ?");
    params.push(category);
  }
  if (city) {
    clauses.push("ci.slug = ?");
    params.push(city);
  }
  if (breaking === "1") clauses.push("a.is_breaking = 1");
  if (featured === "1") clauses.push("a.is_featured = 1");

  let sql = SELECT_BASE;
  if (clauses.length) sql += " WHERE " + clauses.join(" AND ");
  sql += " ORDER BY a.published_at DESC";
  if (limit) {
    sql += " LIMIT ?";
    params.push(Number(limit));
  }

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(serialize));
});

router.get("/:id", (req, res) => {
  const row = db.prepare(SELECT_BASE + " WHERE a.id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "आर्टिकल नहीं मिला" });
  if (!row.is_published && !req.session.user) return res.status(404).json({ error: "आर्टिकल नहीं मिला" });
  db.prepare("UPDATE articles SET views = views + 1 WHERE id = ?").run(req.params.id);
  res.json(serialize(row));
});

router.post("/", CAN_WRITE, (req, res) => {
  const b = req.body || {};
  if (!b.title || !b.title.trim()) return res.status(400).json({ error: "शीर्षक आवश्यक है" });

  const role = req.session.user.role;
  const canPublish = role === "super_admin" || role === "editor";
  const isPublished = canPublish ? (b.is_published ? 1 : 0) : 0;
  const isBreaking = canPublish && b.is_breaking ? 1 : 0;
  const isFeatured = canPublish && b.is_featured ? 1 : 0;

  const info = db
    .prepare(
      `INSERT INTO articles (title, summary, body, image_url, category_id, city_id, is_breaking, is_featured, is_published, video_duration, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      b.title.trim(),
      b.summary || "",
      b.body || "",
      b.image_url || "",
      b.category_id || null,
      b.city_id || null,
      isBreaking,
      isFeatured,
      isPublished,
      b.video_duration || null,
      req.session.user.id
    );

  const row = db.prepare(SELECT_BASE + " WHERE a.id = ?").get(info.lastInsertRowid);
  res.status(201).json(serialize(row));
});

router.put("/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM articles WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "आर्टिकल नहीं मिला" });

  const role = req.session.user.role;
  const isOwner = existing.author_id === req.session.user.id;
  const canWrite = ["super_admin", "editor", "reporter", "video_editor", "photo_editor"].includes(role);
  const canPublish = role === "super_admin" || role === "editor";

  if (!canWrite) return res.status(403).json({ error: "अनुमति नहीं है" });
  if (role === "reporter" && !isOwner) return res.status(403).json({ error: "केवल अपना आर्टिकल संपादित कर सकते हैं" });

  const b = req.body || {};
  const next = {
    title: b.title !== undefined ? b.title : existing.title,
    summary: b.summary !== undefined ? b.summary : existing.summary,
    body: b.body !== undefined ? b.body : existing.body,
    image_url: b.image_url !== undefined ? b.image_url : existing.image_url,
    category_id: b.category_id !== undefined ? b.category_id : existing.category_id,
    city_id: b.city_id !== undefined ? b.city_id : existing.city_id,
    video_duration: b.video_duration !== undefined ? b.video_duration : existing.video_duration,
    is_breaking: canPublish && b.is_breaking !== undefined ? (b.is_breaking ? 1 : 0) : existing.is_breaking,
    is_featured: canPublish && b.is_featured !== undefined ? (b.is_featured ? 1 : 0) : existing.is_featured,
    is_published: canPublish && b.is_published !== undefined ? (b.is_published ? 1 : 0) : existing.is_published,
  };

  db.prepare(
    `UPDATE articles SET title=?, summary=?, body=?, image_url=?, category_id=?, city_id=?, video_duration=?, is_breaking=?, is_featured=?, is_published=?, updated_at=datetime('now')
     WHERE id=?`
  ).run(
    next.title,
    next.summary,
    next.body,
    next.image_url,
    next.category_id,
    next.city_id,
    next.video_duration,
    next.is_breaking,
    next.is_featured,
    next.is_published,
    req.params.id
  );

  const row = db.prepare(SELECT_BASE + " WHERE a.id = ?").get(req.params.id);
  res.json(serialize(row));
});

router.delete("/:id", CAN_DELETE, (req, res) => {
  db.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
