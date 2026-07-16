import mysql from "mysql2/promise";

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "Abc@123",
    });
    console.log("Connected successfully!");
    const [rows] = await conn.query("SHOW DATABASES;");
    console.log(rows);
    await conn.end();
  } catch (err) {
    console.error("Connection error:", err);
  }
}

run();
