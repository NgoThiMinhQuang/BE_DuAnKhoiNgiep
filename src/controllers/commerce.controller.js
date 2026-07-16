import {
  addToCart, addToWishlist, getCart, getWishlist, removeFromCart,
  removeFromWishlist, updateCartQuantity,
} from "../services/commerce.service.js";

export async function showMyCart(request, response, next) {
  try { response.json({ success: true, data: { items: await getCart(request.auth.userId) } }); } catch (error) { next(error); }
}
export async function addMyCartItem(request, response, next) {
  try { response.status(201).json({ success: true, data: { items: await addToCart(request.auth.userId, request.body.productId, request.body.quantity) } }); } catch (error) { next(error); }
}
export async function updateMyCartItem(request, response, next) {
  try { response.json({ success: true, data: { items: await updateCartQuantity(request.auth.userId, request.params.productId, request.body.quantity) } }); } catch (error) { next(error); }
}
export async function removeMyCartItem(request, response, next) {
  try { response.json({ success: true, data: { items: await removeFromCart(request.auth.userId, request.params.productId) } }); } catch (error) { next(error); }
}
export async function showMyWishlist(request, response, next) {
  try { response.json({ success: true, data: { products: await getWishlist(request.auth.userId) } }); } catch (error) { next(error); }
}
export async function addMyWishlistItem(request, response, next) {
  try { response.status(201).json({ success: true, data: { products: await addToWishlist(request.auth.userId, request.body.productId) } }); } catch (error) { next(error); }
}
export async function removeMyWishlistItem(request, response, next) {
  try { response.json({ success: true, data: { products: await removeFromWishlist(request.auth.userId, request.params.productId) } }); } catch (error) { next(error); }
}
