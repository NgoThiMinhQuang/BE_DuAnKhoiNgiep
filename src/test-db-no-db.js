import mysql from "mysql2/promise";

const passwords = [
  "", "root", "123456", "12345678", "admin", "admin123", "root123", 
  "password", "1234", "123456789", "Abc@123", "Abc123456", "123456a@", 
  "mysql80", "mysql", "12345678a@", "Admin@123", "Admin123"
];

async function findPassword() {
  for (const p of passwords) {
    try {
      const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: p,
      });
      console.log(`SUCCESS: Connected with password: '${p}'`);
      await connection.end();
      return;
    } catch (error) {
      console.log(`Failed for '${p}':`, error.message);
    }
  }
  console.log("No password matched.");
}

findPassword();
