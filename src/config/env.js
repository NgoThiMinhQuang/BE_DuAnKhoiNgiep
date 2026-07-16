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
});

