/**
 * DataForge — /api/users Route
 * Full CRUD: GET all, GET one, POST, PUT, DELETE
 */

const express = require("express");
const router  = express.Router();
const { getDb } = require("../db/database");

// ── Validation Helper ────────────────────────────────────
function validateUser(body, requireAll = true) {
  const errors = [];
  const { name, username, email, company } = body;

  if (requireAll || name      !== undefined) {
    if (!name || name.trim().length < 2)
      errors.push("name: must be at least 2 characters.");
  }
  if (requireAll || username  !== undefined) {
    if (!username || username.trim().length < 2)
      errors.push("username: must be at least 2 characters.");
  }
  if (requireAll || email     !== undefined) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.push("email: must be a valid email address.");
  }
  if (requireAll || company   !== undefined) {
    if (!company || company.trim().length < 1)
      errors.push("company: is required.");
  }
  return errors;
}

// ── GET /api/users ───────────────────────────────────────
// Returns all users. Supports ?search= and ?company= query params.
router.get("/", (req, res) => {
  try {
    const db = getDb();
    let query  = "SELECT * FROM users WHERE 1=1";
    const params = [];

    if (req.query.search) {
      const s = `%${req.query.search}%`;
      query += " AND (name LIKE ? OR email LIKE ? OR username LIKE ? OR company LIKE ?)";
      params.push(s, s, s, s);
    }
    if (req.query.company) {
      query += " AND company = ?";
      params.push(req.query.company);
    }

    query += " ORDER BY id DESC";
    const users = db.prepare(query).all(...params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/users/:id ───────────────────────────────────
router.get("/:id", (req, res) => {
  try {
    const db   = getDb();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/users ──────────────────────────────────────
router.post("/", (req, res) => {
  try {
    const errors = validateUser(req.body, true);
    if (errors.length) return res.status(422).json({ errors });

    const db = getDb();
    const { name, username, email, phone, company, website, city } = req.body;

    // Check uniqueness
    if (db.prepare("SELECT id FROM users WHERE email = ?").get(email))
      return res.status(409).json({ error: "Email already exists." });
    if (db.prepare("SELECT id FROM users WHERE username = ?").get(username))
      return res.status(409).json({ error: "Username already taken." });

    const result = db.prepare(`
      INSERT INTO users (name, username, email, phone, company, website, city)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(), username.trim(), email.trim(),
      phone || null, company.trim(), website || null, city || null
    );

    const created = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE")
      return res.status(409).json({ error: "Email or username already exists." });
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/users/:id ───────────────────────────────────
router.put("/:id", (req, res) => {
  try {
    const db   = getDb();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const errors = validateUser(req.body, false);
    if (errors.length) return res.status(422).json({ errors });

    const fields  = ["name","username","email","phone","company","website","city"];
    const updates = [];
    const vals    = [];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        vals.push(req.body[f] === "" ? null : String(req.body[f]).trim());
      }
    });

    if (!updates.length)
      return res.status(400).json({ error: "No fields provided to update." });

    vals.push(req.params.id);
    db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...vals);
    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE")
      return res.status(409).json({ error: "Email or username already exists." });
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/users/:id ────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const db   = getDb();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true, deleted: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
