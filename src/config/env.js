import "dotenv/config";

const port = Number.parseInt(process.env.PORT ?? "5000", 10);
const sepayPaymentPrefix = (process.env.SEPAY_PAYMENT_PREFIX ?? "RBB").trim().toUpperCase();
const nodeEnv = process.env.NODE_ENV ?? "development";
const authSecret = process.env.AUTH_SECRET?.trim();

if (Number.isNaN(port) || port < 1 || port > 65535) {
  throw new Error("PORT phải là một số từ 1 đến 65535");
}

if (nodeEnv === "production" && !authSecret) {
  throw new Error("AUTH_SECRET is required in production");
}

export const env = Object.freeze({
  nodeEnv,
  port,
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  database: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number.parseInt(process.env.DB_PORT ?? "3306", 10),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    name: process.env.DB_NAME ?? "rubeanora_store",
  },
  authSecret: authSecret || "rubeanora-development-secret-change-me",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  push: {
    publicKey: process.env.VAPID_PUBLIC_KEY ?? "",
    privateKey: process.env.VAPID_PRIVATE_KEY ?? "",
    subject: process.env.VAPID_SUBJECT ?? "",
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.RESEND_FROM ?? "Rubeanora <no-reply@mail.gnaryx.online>",
  },
  sepay: {
    webhookSecret: process.env.SEPAY_WEBHOOK_SECRET ?? "",
    bankCode: process.env.SEPAY_BANK_CODE ?? "",
    bankName: process.env.SEPAY_BANK_NAME ?? process.env.SEPAY_BANK_CODE ?? "",
    accountNumber: process.env.SEPAY_ACCOUNT_NUMBER ?? "",
    accountHolder: process.env.SEPAY_ACCOUNT_HOLDER ?? "",
    paymentPrefix: sepayPaymentPrefix,
    transferContentPrefix: (process.env.SEPAY_TRANSFER_CONTENT_PREFIX ?? "").trim(),
  },
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number.parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER ?? "",
    password: process.env.SMTP_PASSWORD ?? "",
    from: process.env.SMTP_FROM ?? "Rubeanora <no-reply@rubeanora.local>",
  },
});

