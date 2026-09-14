const express = require("express");
const db = require("../db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();
const CAN_MANAGE = requireRole("super_admin", "editor");

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM cities ORDER BY name").all());
});

router.post("/", CAN_MANAGE, (req, res) => {
  const { slug, name } = req.body || {};
  if (!slug || !name) return res.status(400).json({ error: "slug और name आवश्यक है" });
  try {
    const info = db.prepare("INSERT INTO cities (slug, name) VALUES (?, ?)").run(slug.trim(), name.trim());
    res.status(201).json(db.prepare("SELECT * FROM cities WHERE id = ?").get(info.lastInsertRowid));
  } catch (e) {
    res.status(400).json({ error: "यह slug पहले से मौजूद है" });
  }
});

router.put("/:id", CAN_MANAGE, (req, res) => {
  const { slug, name } = req.body || {};
  const existing = db.prepare("SELECT * FROM cities WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "शहर नहीं मिला" });
  db.prepare("UPDATE cities SET slug=?, name=? WHERE id=?").run(
    slug || existing.slug,
    name || existing.name,
    req.params.id
  );
  res.json(db.prepare("SELECT * FROM cities WHERE id = ?").get(req.params.id));
});

router.delete("/:id", CAN_MANAGE, (req, res) => {
  db.prepare("UPDATE articles SET city_id = NULL WHERE city_id = ?").run(req.params.id);
  db.prepare("DELETE FROM cities WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
