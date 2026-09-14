const path = require("path");
const express = require("express");
const session = require("express-session");

require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mp-news-network-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/articles", require("./routes/articles"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/cities", require("./routes/cities"));
app.use("/api/users", require("./routes/users"));

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`MP News Network server running at http://localhost:${PORT}`);
  console.log(`  Public site : http://localhost:${PORT}/`);
  console.log(`  Login page  : http://localhost:${PORT}/login.html`);
  console.log(`  Admin panel : http://localhost:${PORT}/admin.html`);
});
