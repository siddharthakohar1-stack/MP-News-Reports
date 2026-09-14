const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

const ROLE_LABELS = {
  super_admin: "सुपर एडमिन",
  editor: "एडिटर",
  reporter: "रिपोर्टर",
  video_editor: "वीडियो एडिटर",
  photo_editor: "फोटो एडिटर",
  seo_manager: "SEO मैनेजर",
  ad_manager: "विज्ञापन मैनेजर",
  moderator: "मॉडरेटर",
};

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "ईमेल और पासवर्ड आवश्यक है" });
  }
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "गलत ईमेल या पासवर्ड" });
  }
  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role] || user.role,
  };
  res.json({ user: req.session.user });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "लॉगिन नहीं है" });
  res.json({ user: req.session.user });
});

module.exports = router;
