const express = require("express");
const db = require("../db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();
const CAN_MANAGE = requireRole("super_admin", "editor");

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM categories ORDER BY name").all());
});

router.post("/", CAN_MANAGE, (req, res) => {
  const { slug, name, color_var } = req.body || {};
  if (!slug || !name) return res.status(400).json({ error: "slug और name आवश्यक है" });
  try {
    const info = db
      .prepare("INSERT INTO categories (slug, name, color_var) VALUES (?, ?, ?)")
      .run(slug.trim(), name.trim(), color_var || "--blue");
    res.status(201).json(db.prepare("SELECT * FROM categories WHERE id = ?").get(info.lastInsertRowid));
  } catch (e) {
    res.status(400).json({ error: "यह slug पहले से मौजूद है" });
  }
});

router.put("/:id", CAN_MANAGE, (req, res) => {
  const { slug, name, color_var } = req.body || {};
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "श्रेणी नहीं मिली" });
  db.prepare("UPDATE categories SET slug=?, name=?, color_var=? WHERE id=?").run(
    slug || existing.slug,
    name || existing.name,
    color_var || existing.color_var,
    req.params.id
  );
  res.json(db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id));
});

router.delete("/:id", CAN_MANAGE, (req, res) => {
  db.prepare("DELETE FROM articles WHERE category_id = ?").run(req.params.id);
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
