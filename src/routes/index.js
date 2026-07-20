import { Router } from "express";

import { healthRouter } from "./health.routes.js";
import { homeRouter } from "./home.routes.js";
import { productRouter } from "./product.routes.js";
import { newsRouter } from "./news.routes.js";
import { authRouter, customerRouter } from "./customer.routes.js";
import { adminRouter } from "./admin.routes.js";
import { contactRouter } from "./contact.routes.js";
import { paymentRouter } from "./payment.routes.js";
import { mediaRouter } from "./media.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/home", homeRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/news", newsRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/customers", customerRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/contact", contactRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/media", mediaRouter);

