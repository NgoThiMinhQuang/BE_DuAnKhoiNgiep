import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { database } from "../src/config/database.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(scriptDirectory, "../CSDL/migrations");

function splitStatements(sql) {
  return sql
    .split(";")
    .map((statement) => statement
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("--"))
      .join("\n")
      .trim())
    .filter(Boolean);
}

async function runMigrations() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      file_name VARCHAR(255) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_schema_migrations_file_name (file_name)
    ) ENGINE=InnoDB
  `);

  const files = (await fs.readdir(migrationsDirectory))
    .filter((file) => /^\d{4}_[a-z0-9_-]+\.sql$/i.test(file))
    .sort((first, second) => first.localeCompare(second));

  for (const fileName of files) {
    const [appliedRows] = await database.execute(
      "SELECT id FROM schema_migrations WHERE file_name=? LIMIT 1",
      [fileName],
    );
    if (appliedRows.length) continue;

    const sql = await fs.readFile(path.join(migrationsDirectory, fileName), "utf8");
    const statements = splitStatements(sql);
    const connection = await database.getConnection();

    try {
      await connection.beginTransaction();
      for (const statement of statements) await connection.query(statement);
      await connection.execute("INSERT INTO schema_migrations (file_name) VALUES (?)", [fileName]);
      await connection.commit();
      console.log(`Da chay migration: ${fileName}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

runMigrations()
  .then(() => {
    console.log("Migration hoan tat.");
  })
  .finally(async () => {
    await database.end();
  });
