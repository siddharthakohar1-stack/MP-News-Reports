const express = require("express");
const { seedDatabase } = require("../seed");

const router = express.Router();

router.post("/", async (req, res) => {
  const configured = process.env.SEED_SECRET;
  if (!configured) {
    return res.status(500).json({ error: "SEED_SECRET सेट नहीं है — Vercel env vars में जोड़ें" });
  }
  const given = req.headers["x-seed-secret"] || (req.body && req.body.secret);
  if (given !== configured) {
    return res.status(401).json({ error: "गलत secret" });
  }

  try {
    const result = await seedDatabase();
    if (!result.seeded) {
      return res.json({ ok: true, message: "डेटाबेस पहले से seed हो चुका है, कुछ नहीं बदला" });
    }
    res.json({ ok: true, message: "Seed सफल", users: result.users });
  } catch (e) {
    res.status(500).json({ error: e.message || "Seed विफल" });
  }
});

module.exports = router;
