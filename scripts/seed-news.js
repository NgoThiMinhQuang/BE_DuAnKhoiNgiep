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
  const sql = await fs.readFile(new URL("../CSDL/seed_news.sql", import.meta.url), "utf8");
  await connection.query(sql);
  const [[summary]] = await connection.query("SELECT COUNT(*) AS articles FROM bai_viet WHERE trang_thai='DA_DANG'");
  console.log("Seed tin tức thành công:", summary);
} finally {
  await connection.end();
}
