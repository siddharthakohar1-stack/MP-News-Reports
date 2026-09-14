function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "लॉगिन आवश्यक है" });
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "लॉगिन आवश्यक है" });
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: "अनुमति नहीं है" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
