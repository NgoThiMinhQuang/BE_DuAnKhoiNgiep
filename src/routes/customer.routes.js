import { Router } from "express";

import {
  addAddress, changePassword, login, makeAddressDefault, register,
  removeAddress, showMe, socialLogin, updateMe,
  forgotPassword, googleLogin, resetPassword,
  listSupportMessages, markSupportMessagesRead,
} from "../controllers/customer.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { cancelMyOrder, createMyOrder, listMyOrderReviews, listMyOrders, quoteMyCheckout, reviewMyOrder } from "../controllers/order.controller.js";
import {
  addMyCartItem, addMyWishlistItem, removeMyCartItem, removeMyWishlistItem,
  showMyCart, showMyWishlist, updateMyCartItem,
} from "../controllers/commerce.controller.js";
import { showMyOrderPayment } from "../controllers/payment.controller.js";

export const authRouter = Router();
export const customerRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/social", socialLogin);
authRouter.post("/google", googleLogin);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

customerRouter.use(authenticate);
customerRouter.get("/me", showMe);
customerRouter.put("/me", updateMe);
customerRouter.put("/me/password", changePassword);
customerRouter.post("/me/addresses", addAddress);
customerRouter.patch("/me/addresses/:id/default", makeAddressDefault);
customerRouter.delete("/me/addresses/:id", removeAddress);
customerRouter.get("/me/cart", showMyCart);
customerRouter.post("/me/cart/items", addMyCartItem);
customerRouter.patch("/me/cart/items/:productId", updateMyCartItem);
customerRouter.delete("/me/cart/items/:productId", removeMyCartItem);
customerRouter.get("/me/wishlist", showMyWishlist);
customerRouter.post("/me/wishlist/items", addMyWishlistItem);
customerRouter.delete("/me/wishlist/items/:productId", removeMyWishlistItem);
customerRouter.get("/me/orders", listMyOrders);
customerRouter.post("/me/checkout/quote", quoteMyCheckout);
customerRouter.post("/me/orders", createMyOrder);
customerRouter.get("/me/orders/:id/payment", showMyOrderPayment);
customerRouter.patch("/me/orders/:id/cancel", cancelMyOrder);
customerRouter.get("/me/orders/:id/reviews", listMyOrderReviews);
customerRouter.post("/me/orders/:id/reviews", reviewMyOrder);
customerRouter.get("/me/support-messages", listSupportMessages);
customerRouter.patch("/me/support-messages/read", markSupportMessagesRead);
