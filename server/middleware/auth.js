const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const JWT_SECRET = process.env.JWT_SECRET || "mp-news-network-dev-secret-change-me";
const COOKIE_NAME = "mpnews_token";
const MAX_AGE_SEC = 60 * 60 * 8; // 8 hours

function issueToken(res, user) {
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: MAX_AGE_SEC });
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SEC,
    })
  );
}

function clearToken(res) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  );
}

function readUser(req) {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const parsed = cookie.parse(raw);
  const token = parsed[COOKIE_NAME];
  if (!token) return null;
  try {
    const { iat, exp, ...user } = jwt.verify(token, JWT_SECRET);
    return user;
  } catch (e) {
    return null;
  }
}

function attachUser(req, res, next) {
  req.user = readUser(req);
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "लॉगिन आवश्यक है" });
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "लॉगिन आवश्यक है" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "अनुमति नहीं है" });
    next();
  };
}

module.exports = { attachUser, requireAuth, requireRole, issueToken, clearToken };
