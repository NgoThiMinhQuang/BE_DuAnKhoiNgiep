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
  const sql = await fs.readFile(new URL("../CSDL/seed_commerce.sql", import.meta.url), "utf8");
  await connection.query(sql);
  const [[settings]] = await connection.query(`
    SELECT phi_van_chuyen, nguong_mien_phi_van_chuyen
    FROM cau_hinh_cua_hang ORDER BY id LIMIT 1
  `);
  console.log("Seed giỏ hàng và thanh toán thành công:", settings);
} finally {
  await connection.end();
}
