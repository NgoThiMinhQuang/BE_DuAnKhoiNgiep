import express, { Router } from "express";

import {
  createArticle,
  createCategory,
  createExport,
  createImport,
  createProduct,
  createPromotion,
  createSupplier,
  deleteCategory,
  deleteArticle,
  deleteArticleComment,
  deleteProduct,
  deletePromotion,
  deleteReview,
  deleteUser,
  forceDeleteProduct,
  listArticles,
  listArticleComments,
  listCategories,
  listContacts,
  listOrders,
  listProducts,
  listPromotions,
  listReviews,
  listUsers,
  recordDocumentPrint,
  showDashboard,
  showInventory,
  showOrder,
  showSettings,
  showUser,
  updateArticle,
  updateArticleComment,
  updateCategory,
  updateContact,
  updateOrder,
  updateProduct,
  updatePromotion,
  updateReview,
  updateSettings,
  updateSupplier,
  updateUser,
  createLoyaltyTier,
  deleteLoyaltyTier,
  listLoyaltyTiers,
  recalculateCustomerRanks,
  updateLoyaltyTier,
} from "../controllers/admin.controller.js";
import { uploadImage } from "../controllers/media.controller.js";
import { authenticate, requireAdmin } from "../middleware/authenticate.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get("/dashboard", showDashboard);
adminRouter.post("/document-prints", recordDocumentPrint);
adminRouter.get("/orders", listOrders);
adminRouter.get("/orders/:id", showOrder);
adminRouter.patch("/orders/:id", updateOrder);
adminRouter.get("/users", listUsers);
adminRouter.get("/users/:id", showUser);
adminRouter.patch("/users/:id", updateUser);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.get("/reviews", listReviews);
adminRouter.patch("/reviews/:id", updateReview);
adminRouter.delete("/reviews/:id", deleteReview);
adminRouter.get("/contacts", listContacts);
adminRouter.patch("/contacts/:id", updateContact);
adminRouter.get("/settings", showSettings);
adminRouter.put("/settings", updateSettings);
adminRouter.get("/products", listProducts);
adminRouter.post("/products", createProduct);
adminRouter.put("/products/:id", updateProduct);
adminRouter.delete("/products/:id", deleteProduct);
adminRouter.delete("/products/:id/force", forceDeleteProduct);
adminRouter.get("/categories", listCategories);
adminRouter.post("/categories", createCategory);
adminRouter.put("/categories/:id", updateCategory);
adminRouter.delete("/categories/:id", deleteCategory);
adminRouter.get("/promotions", listPromotions);
adminRouter.post("/promotions", createPromotion);
adminRouter.put("/promotions/:id", updatePromotion);
adminRouter.delete("/promotions/:id", deletePromotion);
adminRouter.get("/articles", listArticles);
adminRouter.post("/articles", createArticle);
adminRouter.put("/articles/:id", updateArticle);
adminRouter.delete("/articles/:id", deleteArticle);
adminRouter.get("/article-comments", listArticleComments);
adminRouter.patch("/article-comments/:id", updateArticleComment);
adminRouter.delete("/article-comments/:id", deleteArticleComment);
adminRouter.post(
  "/uploads/images",
  express.raw({ type: ["image/jpeg", "image/png", "image/webp", "image/gif"], limit: "5mb" }),
  uploadImage,
);
adminRouter.get("/inventory", showInventory);
adminRouter.post("/suppliers", createSupplier);
adminRouter.put("/suppliers/:id", updateSupplier);
adminRouter.post("/imports", createImport);
adminRouter.post("/exports", createExport);
adminRouter.get("/loyalty-tiers", listLoyaltyTiers);
adminRouter.post("/loyalty-tiers", createLoyaltyTier);
adminRouter.put("/loyalty-tiers/:id", updateLoyaltyTier);
adminRouter.delete("/loyalty-tiers/:id", deleteLoyaltyTier);
adminRouter.post("/loyalty-tiers/recalculate", recalculateCustomerRanks);
