const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();
const ONLY_SUPER = requireRole("super_admin");

const ROLES = [
  "super_admin",
  "editor",
  "reporter",
  "video_editor",
  "photo_editor",
  "seo_manager",
  "ad_manager",
  "moderator",
];

router.get("/", ONLY_SUPER, (req, res) => {
  res.json(db.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").all());
});

router.get("/roles", ONLY_SUPER, (req, res) => {
  res.json(ROLES);
});

router.post("/", ONLY_SUPER, (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "सभी फील्ड आवश्यक हैं" });
  }
  if (!ROLES.includes(role)) return res.status(400).json({ error: "अमान्य role" });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const info = db
      .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
      .run(name.trim(), email.trim().toLowerCase(), hash, role);
    res.status(201).json(
      db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(info.lastInsertRowid)
    );
  } catch (e) {
    res.status(400).json({ error: "यह ईमेल पहले से मौजूद है" });
  }
});

router.put("/:id", ONLY_SUPER, (req, res) => {
  const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "यूज़र नहीं मिला" });
  const { name, role, password } = req.body || {};
  if (role && !ROLES.includes(role)) return res.status(400).json({ error: "अमान्य role" });

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("UPDATE users SET name=?, role=?, password_hash=? WHERE id=?").run(
      name || existing.name,
      role || existing.role,
      hash,
      req.params.id
    );
  } else {
    db.prepare("UPDATE users SET name=?, role=? WHERE id=?").run(
      name || existing.name,
      role || existing.role,
      req.params.id
    );
  }
  res.json(db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(req.params.id));
});

router.delete("/:id", ONLY_SUPER, (req, res) => {
  if (Number(req.params.id) === req.session.user.id) {
    return res.status(400).json({ error: "आप अपना ही अकाउंट डिलीट नहीं कर सकते" });
  }
  db.prepare("UPDATE articles SET author_id = NULL WHERE author_id = ?").run(req.params.id);
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
