import { Router } from "express";

import {
  createArticle,
  createCategory,
  createExport,
  createImport,
  createProduct,
  createPromotion,
  createSupplier,
  deleteProduct,
  listArticles,
  listCategories,
  listContacts,
  listOrders,
  listProducts,
  listPromotions,
  listReviews,
  listUsers,
  showDashboard,
  showInventory,
  showOrder,
  showSettings,
  updateArticle,
  updateCategory,
  updateContact,
  updateOrder,
  updateProduct,
  updatePromotion,
  updateReview,
  updateSettings,
  updateSupplier,
  updateUser,
} from "../controllers/admin.controller.js";
import { authenticate, requireAdmin } from "../middleware/authenticate.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get("/dashboard", showDashboard);
adminRouter.get("/orders", listOrders);
adminRouter.get("/orders/:id", showOrder);
adminRouter.patch("/orders/:id", updateOrder);
adminRouter.get("/users", listUsers);
adminRouter.patch("/users/:id", updateUser);
adminRouter.get("/reviews", listReviews);
adminRouter.patch("/reviews/:id", updateReview);
adminRouter.get("/contacts", listContacts);
adminRouter.patch("/contacts/:id", updateContact);
adminRouter.get("/settings", showSettings);
adminRouter.put("/settings", updateSettings);
adminRouter.get("/products", listProducts);
adminRouter.post("/products", createProduct);
adminRouter.put("/products/:id", updateProduct);
adminRouter.delete("/products/:id", deleteProduct);
adminRouter.get("/categories", listCategories);
adminRouter.post("/categories", createCategory);
adminRouter.put("/categories/:id", updateCategory);
adminRouter.get("/promotions", listPromotions);
adminRouter.post("/promotions", createPromotion);
adminRouter.put("/promotions/:id", updatePromotion);
adminRouter.get("/articles", listArticles);
adminRouter.post("/articles", createArticle);
adminRouter.put("/articles/:id", updateArticle);
adminRouter.get("/inventory", showInventory);
adminRouter.post("/suppliers", createSupplier);
adminRouter.put("/suppliers/:id", updateSupplier);
adminRouter.post("/imports", createImport);
adminRouter.post("/exports", createExport);
