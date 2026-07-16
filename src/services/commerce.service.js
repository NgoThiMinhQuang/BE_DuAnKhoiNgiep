import {
  deleteCartItem, deleteWishlistItem, findCartByUserId, findWishlistByUserId,
  insertWishlistItem, setCartItemQuantity, upsertCartItem,
} from "../repositories/commerce.repository.js";

const badRequest = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const splitValues = (value) => value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

export function mapCommerceProduct(row) {
  const originalPrice = row.gia_niem_yet > row.gia_ban ? row.gia_niem_yet : undefined;
  return {
    id: String(row.id), sku: row.ma_sku, slug: row.duong_dan, name: row.ten_san_pham,
    nameEn: row.ma_san_pham, category: row.ten_danh_muc, categorySlug: row.danh_muc_duong_dan,
    image: row.anh_chinh_url, price: row.gia_ban, originalPrice,
    discount: originalPrice ? Math.round((originalPrice - row.gia_ban) * 100 / originalPrice) : undefined,
    weight: row.quy_cach ?? "", origin: row.xuat_xu ?? "",
    description: row.mo_ta_chi_tiet ?? row.mo_ta_ngan ?? "",
    mainIngredients: splitValues(row.thanh_phan), tags: splitValues(row.cong_dung),
    usageInstructions: row.huong_dan_su_dung ?? "", isCombo: row.loai_san_pham === "COMBO",
    stock: row.so_luong_ton,
  };
}

export async function getCart(userId) {
  return (await findCartByUserId(userId)).map((row) => ({
    productId: String(row.id), quantity: row.so_luong, product: mapCommerceProduct(row),
  }));
}

export async function addToCart(userId, productId, quantityInput) {
  const quantity = Math.floor(Number(quantityInput));
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw badRequest("Số lượng không hợp lệ");
  const result = await upsertCartItem(userId, productId, quantity);
  if (result.status === "NOT_FOUND") throw badRequest("Sản phẩm không tồn tại hoặc đã ngừng bán", 404);
  if (result.status === "OUT_OF_STOCK") throw badRequest(`Chỉ còn ${result.stock} sản phẩm trong kho`, 409);
  return getCart(userId);
}

export async function updateCartQuantity(userId, productId, quantityInput) {
  const quantity = Math.floor(Number(quantityInput));
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw badRequest("Số lượng không hợp lệ");
  if (!await setCartItemQuantity(userId, productId, quantity)) throw badRequest("Không thể cập nhật số lượng; vui lòng kiểm tra tồn kho", 409);
  return getCart(userId);
}

export async function removeFromCart(userId, productId) {
  await deleteCartItem(userId, productId);
  return getCart(userId);
}

export async function getWishlist(userId) {
  return (await findWishlistByUserId(userId)).map(mapCommerceProduct);
}

export async function addToWishlist(userId, productId) {
  if (!await insertWishlistItem(userId, productId)) throw badRequest("Sản phẩm không tồn tại hoặc đã ngừng bán", 404);
  return getWishlist(userId);
}

export async function removeFromWishlist(userId, productId) {
  await deleteWishlistItem(userId, productId);
  return getWishlist(userId);
}
