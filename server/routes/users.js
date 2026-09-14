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

router.get("/", ONLY_SUPER, async (req, res) => {
  res.json(await db.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"));
});

router.get("/roles", ONLY_SUPER, (req, res) => {
  res.json(ROLES);
});

router.post("/", ONLY_SUPER, async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "सभी फील्ड आवश्यक हैं" });
  }
  if (!ROLES.includes(role)) return res.status(400).json({ error: "अमान्य role" });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const info = await db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [
      name.trim(),
      email.trim().toLowerCase(),
      hash,
      role,
    ]);
    res.status(201).json(
      await db.get("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [info.lastInsertRowid])
    );
  } catch (e) {
    res.status(400).json({ error: "यह ईमेल पहले से मौजूद है" });
  }
});

router.put("/:id", ONLY_SUPER, async (req, res) => {
  const existing = await db.get("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ error: "यूज़र नहीं मिला" });
  const { name, role, password } = req.body || {};
  if (role && !ROLES.includes(role)) return res.status(400).json({ error: "अमान्य role" });

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    await db.run("UPDATE users SET name=?, role=?, password_hash=? WHERE id=?", [
      name || existing.name,
      role || existing.role,
      hash,
      req.params.id,
    ]);
  } else {
    await db.run("UPDATE users SET name=?, role=? WHERE id=?", [
      name || existing.name,
      role || existing.role,
      req.params.id,
    ]);
  }
  res.json(await db.get("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.params.id]));
});

router.delete("/:id", ONLY_SUPER, async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: "आप अपना ही अकाउंट डिलीट नहीं कर सकते" });
  }
  await db.run("UPDATE articles SET author_id = NULL WHERE author_id = ?", [req.params.id]);
  await db.run("DELETE FROM users WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
