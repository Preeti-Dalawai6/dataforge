# ◈ DataForge — CRUD Dashboard

A professional, fully responsive CRUD Operations Dashboard using **HTML + CSS + Vanilla JavaScript** for the frontend and **Node.js + Express + SQLite** for the optional real backend.

---

## 📁 Project Structure

```
dataforge/
├── frontend/
│   ├── index.html        ← Main UI (Dashboard + Records views)
│   ├── style.css         ← Dark industrial theme, fully responsive
│   └── app.js            ← All CRUD logic, API calls, state management
│
├── backend/
│   ├── server.js         ← Express app entry point
│   ├── package.json      ← Dependencies
│   ├── routes/
│   │   └── users.js      ← GET / POST / PUT / DELETE /api/users
│   └── db/
│       └── database.js   ← SQLite setup + schema + seed data
│
└── README.md
```

---

## 🚀 Quick Start

### Option A — Frontend Only (Zero Setup, Uses Mock API)

Just open the file in your browser:

```bash
open frontend/index.html
# or drag-and-drop index.html into Chrome/Firefox
```

This mode uses **JSONPlaceholder** (free mock API). Data you create is saved to `localStorage`. GET/PUT/DELETE are fully functional API calls.

---

### Option B — Full Stack (Real Database)

**Requirements:** Node.js v18+

#### Step 1 — Install dependencies

```bash
cd backend
npm install
```

#### Step 2 — Start the server

```bash
npm start
# or for auto-reload during development:
npm run dev
```

You'll see:
```
✅  DataForge API running at http://localhost:3000
📁  Frontend served at   http://localhost:3000
🔌  API base:            http://localhost:3000/api/users
```

#### Step 3 — Switch frontend to real backend

Open `frontend/app.js` and change line 18:

```js
const USE_REAL_BACKEND = true;   // ← change false → true
```

Then open `http://localhost:3000` in your browser. All CRUD operations now hit your local SQLite database.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | Fetch all users |
| `GET` | `/api/users/:id` | Fetch single user |
| `POST` | `/api/users` | Create new user |
| `PUT` | `/api/users/:id` | Update existing user |
| `DELETE` | `/api/users/:id` | Delete user |

### Query Parameters (GET /api/users)
- `?search=john` — search by name, email, username, company
- `?company=Acme` — filter by company name

### Request Body (POST / PUT)
```json
{
  "name":     "Jane Doe",
  "username": "janedoe",
  "email":    "jane@example.com",
  "phone":    "+1 555-0100",
  "company":  "Acme Corp",
  "website":  "acme.com",
  "city":     "New York"
}
```

---

## 🗄️ Database

Uses **SQLite** via `better-sqlite3`. The database file `backend/db/dataforge.sqlite` is auto-created on first run with 10 seeded sample users.

**Schema:**
```sql
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  username   TEXT    NOT NULL UNIQUE,
  email      TEXT    NOT NULL UNIQUE,
  phone      TEXT,
  company    TEXT,
  website    TEXT,
  city       TEXT,
  created_at TEXT    DEFAULT (datetime('now')),
  updated_at TEXT    DEFAULT (datetime('now'))
);
```

---

## 🌐 Deployment Guide

### Frontend
Deploy the `/frontend` folder to any static host:
- **Netlify** — drag & drop the `frontend/` folder at netlify.com/drop
- **Vercel** — `vercel --cwd frontend`
- **GitHub Pages** — push `frontend/` to a repo, enable Pages

### Backend + Database
| Service | Notes |
|---------|-------|
| **Railway** | Connect GitHub repo, set start command to `node backend/server.js` |
| **Render** | Free tier, auto-deploy from GitHub |
| **Fly.io** | `fly launch` in the backend folder |

> For production, consider migrating from SQLite to **PostgreSQL** (use the `pg` package instead of `better-sqlite3`).

---

## 🔑 Upgrade Path

| Feature | How to Add |
|---------|-----------|
| Authentication | Add JWT: `npm i jsonwebtoken bcryptjs` |
| PostgreSQL | Replace `better-sqlite3` with `pg` + connection pool |
| File uploads | Add `multer` middleware |
| Rate limiting | Add `express-rate-limit` |
| Validation | Add `joi` or `zod` for schema validation |
| Logging | Add `morgan` middleware |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (custom, no framework), Vanilla JS (ES2022) |
| Backend | Node.js 18+, Express 4 |
| Database | SQLite via better-sqlite3 |
| Fonts | Syne, DM Mono, DM Sans (Google Fonts) |
| Mock API | JSONPlaceholder (fallback mode) |

---

## 📄 License

MIT — free to use, modify, and deploy.
