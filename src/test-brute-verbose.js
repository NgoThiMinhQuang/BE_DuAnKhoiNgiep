import mysql from "mysql2/promise";

const passwords = [
  "", "root", "123456", "12345678", "admin", "admin123", "root123", 
  "password", "1234", "123456789", "Abc@123", "Abc123456", "123456a@", 
  "mysql80", "mysql", "12345678a@", "Admin@123", "Admin123"
];

const hosts = ["127.0.0.1", "localhost", "::1"];

async function run() {
  for (const host of hosts) {
    for (const p of passwords) {
      try {
        const connection = await mysql.createConnection({
          host,
          user: "root",
          password: p,
          ssl: { rejectUnauthorized: false }
        });
        console.log(`SUCCESS: Connected to ${host} with password '${p}'!`);
        await connection.end();
        return;
      } catch (err) {
        // Keep silent unless it's not a standard access denied error
        if (!err.message.includes("Access denied")) {
          console.log(`Special error for ${host} with password '${p}':`, err.message);
        }
      }
    }
  }
  console.log("No password matched.");
}

run();
