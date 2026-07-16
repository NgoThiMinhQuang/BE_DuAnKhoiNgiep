import { Router } from "express";

import { listProducts, showProduct } from "../controllers/product.controller.js";

export const productRouter = Router();

productRouter.get("/", listProducts);
productRouter.get("/:slug", showProduct);
