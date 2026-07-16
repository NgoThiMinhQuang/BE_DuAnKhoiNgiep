import fs from "node:fs/promises";

import "dotenv/config";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8mb4",
  multipleStatements: true,
});

try {
  const [columns] = await connection.query(`
    SELECT COLUMN_NAME FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nguoi_dung' AND COLUMN_NAME='google_sub'
  `);
  if (!columns.length) {
    await connection.query("ALTER TABLE nguoi_dung ADD COLUMN google_sub VARCHAR(255) NULL, ADD UNIQUE KEY uk_nguoi_dung_google_sub (google_sub)");
  }
  const sql = await fs.readFile(new URL("../CSDL/seed_auth.sql", import.meta.url), "utf8");
  await connection.query(sql);
  console.log("Seed xác thực thành công");
} finally {
  await connection.end();
}
