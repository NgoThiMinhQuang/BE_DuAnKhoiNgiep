import mysql from "mysql2/promise";

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
    });
    console.log("SUCCESS connecting with empty password!");
    const [rows] = await connection.query("SHOW DATABASES;");
    console.log("Databases:", rows);
    await connection.end();
  } catch (err) {
    console.error("ERROR connecting with empty password:", err.message);
  }
}

test();
