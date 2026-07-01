/**
 * DataForge — Express REST API Backend
 * Stack: Node.js + Express + SQLite (via better-sqlite3)
 * Run:  npm install  →  npm start
 */

const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const usersRoute = require("./routes/users");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request Logger ──────────────────────────────────────
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}]  ${req.method.padEnd(7)} ${req.path}`);
  next();
});

// ── Serve Frontend Statically ───────────────────────────
app.use(express.static(path.join(__dirname, "../frontend")));

// ── API Routes ──────────────────────────────────────────
app.use("/api/users", usersRoute);

// ── Health Check ────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 Handler ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global Error Handler ────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ── Start ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  DataForge API running at http://localhost:${PORT}`);
  console.log(`📁  Frontend served at   http://localhost:${PORT}`);
  console.log(`🔌  API base:            http://localhost:${PORT}/api/users\n`);
});
