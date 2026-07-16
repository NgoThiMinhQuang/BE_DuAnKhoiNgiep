import { Router } from "express";

import {
  addAddress, changePassword, login, makeAddressDefault, register,
  removeAddress, showMe, socialLogin, updateMe,
} from "../controllers/customer.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { cancelMyOrder, listMyOrderReviews, listMyOrders, reviewMyOrder } from "../controllers/order.controller.js";

export const authRouter = Router();
export const customerRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/social", socialLogin);

customerRouter.use(authenticate);
customerRouter.get("/me", showMe);
customerRouter.put("/me", updateMe);
customerRouter.put("/me/password", changePassword);
customerRouter.post("/me/addresses", addAddress);
customerRouter.patch("/me/addresses/:id/default", makeAddressDefault);
customerRouter.delete("/me/addresses/:id", removeAddress);
customerRouter.get("/me/orders", listMyOrders);
customerRouter.patch("/me/orders/:id/cancel", cancelMyOrder);
customerRouter.get("/me/orders/:id/reviews", listMyOrderReviews);
customerRouter.post("/me/orders/:id/reviews", reviewMyOrder);
