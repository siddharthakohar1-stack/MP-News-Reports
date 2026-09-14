const express = require("express");
const db = require("../db");
const { requireRole } = require("../middleware/auth");

const router = express.Router();
const CAN_MANAGE = requireRole("super_admin", "editor");

router.get("/", async (req, res) => {
  res.json(await db.query("SELECT * FROM categories ORDER BY name"));
});

router.post("/", CAN_MANAGE, async (req, res) => {
  const { slug, name, color_var } = req.body || {};
  if (!slug || !name) return res.status(400).json({ error: "slug और name आवश्यक है" });
  try {
    const info = await db.run(
      "INSERT INTO categories (slug, name, color_var) VALUES (?, ?, ?)",
      [slug.trim(), name.trim(), color_var || "--blue"]
    );
    res.status(201).json(await db.get("SELECT * FROM categories WHERE id = ?", [info.lastInsertRowid]));
  } catch (e) {
    res.status(400).json({ error: "यह slug पहले से मौजूद है" });
  }
});

router.put("/:id", CAN_MANAGE, async (req, res) => {
  const { slug, name, color_var } = req.body || {};
  const existing = await db.get("SELECT * FROM categories WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ error: "श्रेणी नहीं मिली" });
  await db.run("UPDATE categories SET slug=?, name=?, color_var=? WHERE id=?", [
    slug || existing.slug,
    name || existing.name,
    color_var || existing.color_var,
    req.params.id,
  ]);
  res.json(await db.get("SELECT * FROM categories WHERE id = ?", [req.params.id]));
});

router.delete("/:id", CAN_MANAGE, async (req, res) => {
  await db.run("DELETE FROM articles WHERE category_id = ?", [req.params.id]);
  await db.run("DELETE FROM categories WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
