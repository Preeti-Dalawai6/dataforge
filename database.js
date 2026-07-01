/**
 * DataForge — SQLite Database Setup
 * Auto-creates the database file and seeds sample data on first run.
 */

const Database = require("better-sqlite3");
const path     = require("path");

const DB_PATH = path.join(__dirname, "dataforge.sqlite");

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");   // better performance
    db.pragma("foreign_keys = ON");
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      username  TEXT    NOT NULL UNIQUE,
      email     TEXT    NOT NULL UNIQUE,
      phone     TEXT,
      company   TEXT,
      website   TEXT,
      city      TEXT,
      created_at TEXT   DEFAULT (datetime('now')),
      updated_at TEXT   DEFAULT (datetime('now'))
    );

    -- Auto-update updated_at on row change
    CREATE TRIGGER IF NOT EXISTS users_updated_at
    AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);

  // Seed data only if table is empty
  const count = db.prepare("SELECT COUNT(*) as c FROM users").get();
  if (count.c === 0) {
    console.log("🌱  Seeding database with sample users…");
    const insert = db.prepare(`
      INSERT INTO users (name, username, email, phone, company, website, city)
      VALUES (@name, @username, @email, @phone, @company, @website, @city)
    `);
    const seed = db.transaction((users) => users.forEach(u => insert.run(u)));
    seed([
      { name: "Leanne Graham",     username: "Bret",       email: "Sincere@april.biz",       phone: "1-770-736-8031", company: "Romaguera-Crona",  website: "hildegard.org",   city: "Gwenborough"  },
      { name: "Ervin Howell",      username: "Antonette",  email: "Shanna@melissa.tv",        phone: "010-692-6593",   company: "Deckow-Crist",     website: "anastasia.net",   city: "Wisokyburgh"  },
      { name: "Clementine Bauch",  username: "Samantha",   email: "Nathan@yesenia.net",       phone: "1-463-123-4447", company: "Romaguera-Jacobson", website: "ramiro.info",   city: "McKenziehaven"},
      { name: "Patricia Lebsack",  username: "Karianne",   email: "Julianne.OConner@kory.org",phone: "493-170-9623",   company: "Robel-Corkery",    website: "kale.biz",        city: "South Elvis"  },
      { name: "Chelsey Dietrich",  username: "Kamren",     email: "Lucio_Hettinger@annie.ca", phone: "254-954-1289",   company: "Keebler LLC",      website: "demarco.info",    city: "Roscoeview"   },
      { name: "Mrs. Dennis Water", username: "Leopoldo_Corkery", email: "Karley_Dach@jasper.info", phone: "1-477-935-8478", company: "Considine-Lockman", website: "ola.org", city: "South Christy" },
      { name: "Kurtis Weissnat",   username: "Elwyn.Skiles", email: "Telly.Hoeger@billy.biz", phone: "210.067.6132",   company: "Johns Group",      website: "elvis.io",        city: "Howemouth"    },
      { name: "Nicholas Runolfsdottir", username: "Maxime_Nienow", email: "Sherwood@rosamond.me", phone: "586.493.6943", company: "Abernathy Group", website: "jacynthe.com",  city: "Aliyaview"    },
      { name: "Glenna Reichert",   username: "Delphine",   email: "Chaim_McDermott@dana.io",  phone: "(775)976-6794",  company: "Yost and Sons",    website: "conrad.com",      city: "Bartholomebury"},
      { name: "Clementina DuBuque",username: "Moriah.Stanton", email: "Rey.Padberg@karina.biz", phone: "024-648-3804", company: "Hoeger LLC",       website: "ambrose.net",     city: "Lebsackbury"  },
    ]);
    console.log("✅  Database seeded.\n");
  }
}

module.exports = { getDb };
