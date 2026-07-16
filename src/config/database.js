import mysql from "mysql2/promise";

import { env } from "./env.js";

export const database = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  charset: "utf8mb4",
});
