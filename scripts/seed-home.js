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
  const sql = await fs.readFile(new URL("../CSDL/seed_home.sql", import.meta.url), "utf8");
  await connection.query(sql);

  const [[summary]] = await connection.query(`
    SELECT
      (SELECT COUNT(*) FROM san_pham WHERE la_noi_bat = 1 AND trang_thai = 'DANG_BAN') AS products,
      (SELECT COUNT(*) FROM bai_viet WHERE trang_thai = 'DA_DANG') AS articles,
      (SELECT COUNT(*) FROM danh_gia WHERE trang_thai = 'DA_DUYET') AS reviews
  `);

  const [reviewCounts] = await connection.query(`
    SELECT sp.ma_san_pham AS productCode, COUNT(dg.id) AS reviews
    FROM san_pham sp
    LEFT JOIN danh_gia dg ON dg.san_pham_id = sp.id AND dg.trang_thai = 'DA_DUYET'
    WHERE sp.la_noi_bat = 1
    GROUP BY sp.id
    ORDER BY sp.id
  `);

  console.log("Seed trang chủ thành công:", summary);
  console.table(reviewCounts);
} finally {
  await connection.end();
}
