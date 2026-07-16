import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(`API đang chạy tại http://localhost:${env.port}`);
});

function shutdown(signal) {
  console.log(`${signal}: đang dừng máy chủ...`);
  server.close((error) => {
    if (error) {
      console.error("Không thể dừng máy chủ an toàn", error);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

