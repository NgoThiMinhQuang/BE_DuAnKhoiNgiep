import {
  addAdminArticle,
  addAdminCategory,
  addAdminExport,
  addAdminImport,
  addAdminProduct,
  addAdminPromotion,
  addAdminSupplier,
  changeAdminArticle,
  changeAdminCategory,
  changeAdminContact,
  changeAdminOrder,
  changeAdminProduct,
  changeAdminPromotion,
  changeAdminReview,
  changeAdminSettings,
  changeAdminSupplier,
  changeAdminUser,
  getAdminArticles,
  getAdminCategories,
  getAdminContacts,
  getAdminDashboard,
  getAdminInventory,
  getAdminOrder,
  getAdminOrders,
  getAdminProducts,
  getAdminPromotions,
  getAdminReviews,
  getAdminSettings,
  getAdminUsers,
  permanentDeleteAdminProduct,
  removeAdminCategory,
  removeAdminProduct,
  removeAdminUser,
} from "../services/admin.service.js";

function action(service, { status = 200, input = "body", admin = false } = {}) {
  return async function adminAction(request, response, next) {
    try {
      const args = [];
      if (admin) args.push(request.auth.userId);
      if (request.params.id != null) args.push(request.params.id);
      if (input === "query") args.push(request.query);
      if (input === "body") args.push(request.body);
      const data = await service(...args);
      response.status(status).json({ success: true, ...(data === undefined ? {} : { data }) });
    } catch (error) {
      next(error);
    }
  };
}

export const showDashboard = action(getAdminDashboard, { input: null });
export const listOrders = action(getAdminOrders, { input: "query" });
export const showOrder = action(getAdminOrder, { input: null });
export const updateOrder = action(changeAdminOrder, { admin: true });
export const listUsers = action(getAdminUsers, { input: "query" });
export const updateUser = action(changeAdminUser, { admin: true });
export const deleteUser = action(removeAdminUser, { input: null, admin: true });
export const listReviews = action(getAdminReviews, { input: "query" });
export const updateReview = action(changeAdminReview);
export const listContacts = action(getAdminContacts, { input: "query" });
export const updateContact = action(changeAdminContact, { admin: true });
export const showSettings = action(getAdminSettings, { input: null });
export const updateSettings = action(changeAdminSettings);
export const listProducts = action(getAdminProducts, { input: null });
export const createProduct = action(addAdminProduct, { status: 201 });
export const updateProduct = action(changeAdminProduct);
export const deleteProduct = action(removeAdminProduct, { input: null });
export const forceDeleteProduct = action(permanentDeleteAdminProduct, { input: null });
export const listCategories = action(getAdminCategories, { input: null });
export const createCategory = action(addAdminCategory, { status: 201 });
export const updateCategory = action(changeAdminCategory);
export const deleteCategory = action(removeAdminCategory, { input: null });
export const listPromotions = action(getAdminPromotions, { input: null });
export const createPromotion = action(addAdminPromotion, { status: 201 });
export const updatePromotion = action(changeAdminPromotion);
export const listArticles = action(getAdminArticles, { input: null });
export const createArticle = action(addAdminArticle, { status: 201, admin: true });
export const updateArticle = action(changeAdminArticle);
export const showInventory = action(getAdminInventory, { input: null });
export const createSupplier = action(addAdminSupplier, { status: 201 });
export const updateSupplier = action(changeAdminSupplier);
export const createImport = action(addAdminImport, { status: 201, admin: true });
export const createExport = action(addAdminExport, { status: 201, admin: true });
