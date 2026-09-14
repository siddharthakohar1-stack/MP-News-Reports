const express = require("express");
const db = require("../db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();
const CAN_MANAGE = requireRole("super_admin", "editor");

router.get("/", async (req, res) => {
  res.json(await db.query("SELECT * FROM cities ORDER BY name"));
});

router.post("/", CAN_MANAGE, async (req, res) => {
  const { slug, name } = req.body || {};
  if (!slug || !name) return res.status(400).json({ error: "slug और name आवश्यक है" });
  try {
    const info = await db.run("INSERT INTO cities (slug, name) VALUES (?, ?)", [slug.trim(), name.trim()]);
    res.status(201).json(await db.get("SELECT * FROM cities WHERE id = ?", [info.lastInsertRowid]));
  } catch (e) {
    res.status(400).json({ error: "यह slug पहले से मौजूद है" });
  }
});

router.put("/:id", CAN_MANAGE, async (req, res) => {
  const { slug, name } = req.body || {};
  const existing = await db.get("SELECT * FROM cities WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ error: "शहर नहीं मिला" });
  await db.run("UPDATE cities SET slug=?, name=? WHERE id=?", [
    slug || existing.slug,
    name || existing.name,
    req.params.id,
  ]);
  res.json(await db.get("SELECT * FROM cities WHERE id = ?", [req.params.id]));
});

router.delete("/:id", CAN_MANAGE, async (req, res) => {
  await db.run("UPDATE articles SET city_id = NULL WHERE city_id = ?", [req.params.id]);
  await db.run("DELETE FROM cities WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
