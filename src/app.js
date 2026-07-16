import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error("Origin không được CORS cho phép");
      error.statusCode = 403;
      return callback(error);
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
}

app.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Chào mừng đến với API Dự Án Khởi Nghiệp",
  });
});

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

