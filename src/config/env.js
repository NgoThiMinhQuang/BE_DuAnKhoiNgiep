import "dotenv/config";

const port = Number.parseInt(process.env.PORT ?? "5000", 10);

if (Number.isNaN(port) || port < 1 || port > 65535) {
  throw new Error("PORT phải là một số từ 1 đến 65535");
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
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
  authSecret: process.env.AUTH_SECRET ?? "rubeanora-development-secret-change-me",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number.parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER ?? "",
    password: process.env.SMTP_PASSWORD ?? "",
    from: process.env.SMTP_FROM ?? "Rubeanora <no-reply@rubeanora.local>",
  },
});

