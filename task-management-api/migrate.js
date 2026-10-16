
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  path.join(__dirname, "tasks.db")
);

const migrationsDir = path.join(__dirname, "migrations");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function migrate() {
  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const existing = await all(
      "SELECT migration_name FROM schema_migrations WHERE migration_name = ?",
      [file]
    );

    if (existing.length > 0) {
      console.log(`Skipping ${file}: already applied.`);
      continue;
    }

    const sql = fs.readFileSync(
      path.join(migrationsDir, file),
      "utf8"
    );

    try {
      await exec("BEGIN TRANSACTION");
      await exec(sql);

      await run(
        "INSERT INTO schema_migrations (migration_name) VALUES (?)",
        [file]
      );

      await exec("COMMIT");
      console.log(`Applied ${file}`);
    } catch (err) {
      try {
        await exec("ROLLBACK");
      } catch (_) {}

      throw err;
    }
  }

  console.log("Migrations completed.");
}

migrate()
  .catch(err => {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    db.close();
  });
