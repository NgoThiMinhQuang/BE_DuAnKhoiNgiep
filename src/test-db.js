import mysql from "mysql2/promise";

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Abc@123",
      database: "web_ban_my_pham_co_cay_hoa_la",
    });

    console.log("SUCCESS: Connected to database!");
    const [rows] = await connection.query("SHOW TABLES;");
    console.log("Tables in database:", rows);
    await connection.end();
  } catch (error) {
    console.error("ERROR connecting to database:", error.message);
  }
}

testConnection();
