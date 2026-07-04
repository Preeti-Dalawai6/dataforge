# DataForge — CRUD Operations Dashboard
A full-stack CRUD dashboard for managing user records, built with vanilla JavaScript on the frontend and Node.js, Express, and SQLite on the backend.

## Overview
DataForge is a web-based dashboard that allows users to create, read, update, and delete records through a clean, responsive interface. It is designed to work in two modes: a zero-setup frontend-only mode using a mock API, and a full-stack mode backed by a real SQLite database. The project demonstrates a complete, production-style CRUD workflow, from UI design to REST API implementation to database persistence.

## Project Statement
Most CRUD tutorials either stop at the frontend or require a heavy framework and complex setup to see real functionality. DataForge solves this by providing a project that runs instantly in a browser with no installation, while also including a fully working backend that can be switched on with a single configuration change. The goal is to give a realistic, end-to-end example of how a modern data management dashboard is structured, from user interface to API to database.

## Dataset
The project does not use an external dataset. Instead, it manages user records with the following fields: name, username, email, phone, company, website, and city.

In frontend-only mode, initial records are fetched from JSONPlaceholder, a free mock REST API, and any changes are stored in the browser's local storage.

In full-stack mode, the SQLite database is automatically created and seeded with 10 sample user records on first run, so the application is immediately usable without manual data entry.

## Tools and Technologies
Frontend: HTML5, CSS3, Vanilla JavaScript (ES2022)
Backend: Node.js (version 18 or higher), Express 4
Database: SQLite, accessed through the better-sqlite3 library
Mock API: JSONPlaceholder, used in frontend-only mode
Fonts: Syne, DM Mono, and DM Sans, loaded from Google Fonts
Development tools: nodemon for auto-reload during backend development

## Methods
The project follows a standard client-server architecture with a clear separation between frontend and backend.
Frontend: The interface is organized into two main views, a Dashboard view and a Records view. Application state, API calls, search and filter logic, pagination, and modal windows for create, edit, delete, and detail actions are all handled in a single JavaScript file. A configuration flag determines whether the frontend talks to the mock API or the real backend.
Backend: The Express server exposes a REST API under the /api/users route. Each endpoint performs validation, checks for duplicate usernames or emails, and returns appropriate HTTP status codes, including 404 for records not found, 409 for conflicts, and 422 for validation errors.

Database: SQLite is used for lightweight, file-based persistence. The database file is created automatically on first run, and an update trigger keeps the updated_at field current whenever a record is modified.

## Key Insights
The project shows that a fully functional CRUD application does not require a complex framework or a hosted database to be usable and demonstrable. By supporting both a mock-API mode and a real-backend mode from the same codebase, the project makes it easy to demonstrate frontend behavior instantly, while still providing a genuine, persistent backend for real-world use. The clear separation between frontend, API routes, and database logic also makes the codebase easy to extend, for example by adding authentication or switching to a different database.

## Dashboard and Output
The application has two main screens.

Dashboard view: Displays summary statistics, quick action buttons, and a preview of recently added records.

Records view: Displays a full, searchable, and filterable table of all user records, with pagination and modal windows for creating, editing, viewing, and deleting individual records.

All actions provide immediate visual feedback through toast notifications and loading states, and the layout is fully responsive across desktop and mobile screens.

## How to Run This Project
Option A, Frontend Only, No Setup Required

Open the file frontend/index.html directly in a browser, either by double-clicking it or dragging it into Chrome or Firefox. This mode uses the JSONPlaceholder mock API for reading data, and stores any created or edited records in the browser's local storage.

Option B, Full Stack With Real Database

Requirements: Node.js version 18 or higher.

Step 1: Install dependencies
cd backend
npm install

Step 2: Start the server
npm start

For automatic reload during development, use:
npm run dev

Once running, the server will display confirmation messages showing that the API is running at http://localhost:3000 and that the API base is available at http://localhost:3000/api/users.

Step 3: Switch the frontend to use the real backend

Open frontend/app.js and change the configuration flag on line 18 from false to true:

const USE_REAL_BACKEND = true;

Then open http://localhost:3000 in a browser. All create, read, update, and delete actions will now use the local SQLite database instead of the mock API.

## API Reference
| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | /api/users | Fetch all users |
| GET | /api/users/:id | Fetch a single user |
| POST | /api/users | Create a new user |
| PUT | /api/users/:id | Update an existing user |
| DELETE | /api/users/:id | Delete a user |

Query parameters available on GET /api/users:
search, for searching by name, email, username, or company
company, for filtering by company name

Example request body for POST and PUT:
{
  "name": "Jane Doe",
  "username": "janedoe",
  "email": "jane@example.com",
  "phone": "+1 555-0100",
  "company": "Acme Corp",
  "website": "acme.com",
  "city": "New York"
}


## Database Schema
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

## Results and Conclusion
DataForge successfully delivers a working CRUD application that can be demonstrated instantly with no setup, while also supporting a genuine, persistent backend when needed. All create, read, update, and delete operations function correctly in both modes, with proper validation and error handling on the backend. The project confirms that a well-structured, framework-free frontend combined with a lightweight Express and SQLite backend is sufficient to build a professional-quality data management tool.

## Future Work
Add user authentication using JSON Web Tokens
Migrate from SQLite to PostgreSQL for production-scale deployment
Add file upload support for user profile images
Add rate limiting to protect the API from abuse
Add schema-based validation using a library such as Joi or Zod
Add request logging for easier debugging and monitoring
Deploy the frontend and backend separately using services such as Netlify, Vercel, Railway, or Render

## Author and Contact
Author: [Preeti Dalawai]
Email: [preetidalawai2004@gmail.com]

## License
This project is licensed under the MIT License. You are free to use, modify, and deploy it.
