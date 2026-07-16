import { getProductCatalog, getProductDetails } from "../services/product.service.js";

export async function listProducts(_request, response, next) {
  try {
    response.json({ success: true, data: await getProductCatalog() });
  } catch (error) {
    next(error);
  }
}

export async function showProduct(request, response, next) {
  try {
    response.json({ success: true, data: await getProductDetails(request.params.slug) });
  } catch (error) {
    next(error);
  }
}
