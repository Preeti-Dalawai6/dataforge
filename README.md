# ◈ DataForge — CRUD Dashboard

A professional, fully responsive CRUD Operations Dashboard using **HTML + CSS + Vanilla JavaScript** for the frontend and **Node.js + Express + SQLite** for the optional real backend.

Quick Start
Option A — Frontend Only (Zero Setup, Uses Mock API)
Just open the file in your browser:
open frontend/index.html
or drag and drop index.html into Chrome or Firefox.
This mode uses JSONPlaceholder, a free mock API. Data you create is saved to localStorage. GET, PUT, and DELETE are fully functional API calls.

Option B — Full Stack (Real Database)
Requirements: Node.js version 18 or higher.

Step 1 — Install dependencies
cd backend
npm install

Step 2 — Start the server
npm start
or for auto-reload during development:
npm run dev
You will see:
DataForge API running at http://localhost:3000
Frontend served at http://localhost:3000
API base: http://localhost:3000/api/users

Step 3 — Switch frontend to real backend
Open frontend/app.js and change line 18:
const USE_REAL_BACKEND = true;   // change false to true
Then open http://localhost:3000 in your browser. All CRUD operations now hit your local SQLite database.

API Endpoints
MethodEndpointDescriptionGET/api/usersFetch all usersGET/api/users/:idFetch single userPOST/api/usersCreate new userPUT/api/users/:idUpdate existing userDELETE/api/users/:idDelete user
Query Parameters (GET /api/users):

search=john — search by name, email, username, company
company=Acme — filter by company name

Request Body (POST / PUT):
{
  "name":     "Jane Doe",
  "username": "janedoe",
  "email":    "jane@example.com",
  "phone":    "+1 555-0100",
  "company":  "Acme Corp",
  "website":  "acme.com",
  "city":     "New York"
}

Database
Uses SQLite via better-sqlite3. The database file backend/db/dataforge.sqlite is auto-created on first run with 10 seeded sample users.
Schema:
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

Deployment Guide
Frontend:
Deploy the frontend folder to any static host.

Netlify — drag and drop the frontend folder at netlify.com/drop
Vercel — vercel --cwd frontend
GitHub Pages — push frontend folder to a repo, enable Pages

Backend and Database:
ServiceNotesRailwayConnect GitHub repo, set start command to node backend/server.jsRenderFree tier, auto-deploy from GitHubFly.iofly launch in the backend folder
For production, consider migrating from SQLite to PostgreSQL by using the pg package instead of better-sqlite3.

Upgrade Path
FeatureHow to AddAuthenticationAdd JWT: npm install jsonwebtoken bcryptjsPostgreSQLReplace better-sqlite3 with pg and a connection poolFile uploadsAdd multer middlewareRate limitingAdd express-rate-limitValidationAdd joi or zod for schema validationLoggingAdd morgan middleware

Tech Stack
LayerTechnologyFrontendHTML5, CSS3 (custom, no framework), Vanilla JS (ES2022)BackendNode.js 18+, Express 4DatabaseSQLite via better-sqlite3FontsSyne, DM Mono, DM Sans (Google Fonts)Mock APIJSONPlaceholder (fallback mode)

License
MIT — free to use, modify, and deploy.
