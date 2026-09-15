const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

let client;

function getClient() {
  if (client) return client;

  if (process.env.TURSO_DATABASE_URL) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  } else {
    // Local dev fallback: file-based libSQL (SQLite-compatible), no Turso account needed.
    const dataDir = path.join(__dirname, "data");
    fs.mkdirSync(dataDir, { recursive: true });
    client = createClient({
      url: "file:" + path.join(dataDir, "mpnews.db"),
    });
  }
  return client;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color_var TEXT NOT NULL DEFAULT '--blue'
);

CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  category_id INTEGER REFERENCES categories(id),
  city_id INTEGER REFERENCES cities(id),
  is_breaking INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  video_duration TEXT,
  author_id INTEGER REFERENCES users(id),
  views INTEGER NOT NULL DEFAULT 0,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_city ON articles(city_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at);
`;

let initPromise = null;

async function ensureSchema() {
  if (!initPromise) {
    const db = getClient();
    const statements = SCHEMA.split(";").map((s) => s.trim()).filter(Boolean);
    initPromise = (async () => {
      for (const sql of statements) {
        await db.execute(sql);
      }
    })();
  }
  return initPromise;
}

// Thin helper matching the shape we use across routes: query(sql, args) -> rows array
async function query(sql, args = []) {
  await ensureSchema();
  const db = getClient();
  const res = await db.execute({ sql, args });
  return res.rows;
}

// run(sql, args) -> {lastInsertRowid, changes}
async function run(sql, args = []) {
  await ensureSchema();
  const db = getClient();
  const res = await db.execute({ sql, args });
  return { lastInsertRowid: res.lastInsertRowid, changes: res.rowsAffected };
}

async function get(sql, args = []) {
  const rows = await query(sql, args);
  return rows[0] || null;
}

module.exports = { query, run, get, ensureSchema };
