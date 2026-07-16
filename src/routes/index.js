import { Router } from "express";

import { healthRouter } from "./health.routes.js";
import { homeRouter } from "./home.routes.js";
import { productRouter } from "./product.routes.js";
import { newsRouter } from "./news.routes.js";
import { authRouter, customerRouter } from "./customer.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/home", homeRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/news", newsRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/customers", customerRouter);

