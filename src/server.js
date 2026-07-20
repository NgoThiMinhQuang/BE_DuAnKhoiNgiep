import { app } from "./app.js";
import { env } from "./config/env.js";
import { expirePendingBankTransfers } from "./services/payment-expiry.service.js";

const server = app.listen(env.port, () => {
  console.log(`API đang chạy tại http://localhost:${env.port}`);
});

const expirePayments = () => expirePendingBankTransfers().catch((error) => {
  console.error("Không thể xử lý giao dịch hết hạn", error);
});
void expirePayments();
const paymentExpiryTimer = setInterval(expirePayments, 30 * 1000);
paymentExpiryTimer.unref();

function shutdown(signal) {
  console.log(`${signal}: đang dừng máy chủ...`);
  clearInterval(paymentExpiryTimer);
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

