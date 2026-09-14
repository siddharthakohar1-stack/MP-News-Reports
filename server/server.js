const path = require("path");
const express = require("express");
const { attachUser } = require("./middleware/auth");

const app = express();

app.use(express.json());
app.use(attachUser);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/articles", require("./routes/articles"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/cities", require("./routes/cities"));
app.use("/api/users", require("./routes/users"));
app.use("/api/seed", require("./routes/seed"));

app.use(express.static(path.join(__dirname, "public")));

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`MP News Network server running at http://localhost:${PORT}`);
    console.log(`  Public site : http://localhost:${PORT}/`);
    console.log(`  Login page  : http://localhost:${PORT}/login.html`);
    console.log(`  Admin panel : http://localhost:${PORT}/admin.html`);
  });
}

module.exports = app;
