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
  const sql = await fs.readFile(new URL("../CSDL/seed_catalog.sql", import.meta.url), "utf8");
  await connection.query(sql);

  const [[summary]] = await connection.query(`
    SELECT
      (SELECT COUNT(*) FROM san_pham WHERE trang_thai='DANG_BAN') AS products,
      (SELECT COUNT(*) FROM danh_muc_san_pham WHERE trang_thai='HOAT_DONG') AS categories,
      (SELECT COUNT(*) FROM khuyen_mai WHERE trang_thai='HOAT_DONG') AS promotions
  `);
  console.log("Seed trang sản phẩm thành công:", summary);
} finally {
  await connection.end();
}
