
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "tasks.db"),
  (err) => {
    if (err) {
      console.error("Database connection failed:", err.message);
    } else {
      console.log("Connected to SQLite database.");
    }
  }
);

db.run("PRAGMA foreign_keys = ON", (err) => {
  if (err) {
    console.error("Foreign key setup failed:", err.message);
  } else {
    console.log("Foreign keys are enabled.");
  }
});

module.exports = db;
