import {
  cancelUserOrder, findOrderDetails, findOrderForReview, findOrdersByUserId,
  findReviewsByOrder, insertOrderReviews,
  createOrderInTransaction, findCheckoutContext,
} from "../repositories/order.repository.js";
import { createSePayPaymentCode } from "./payment.service.js";
import { notifyAdmins, notifyUser } from "./notification.service.js";

const statusMap = {
  CHO_XAC_NHAN: "CHO_XAC_NHAN", DA_XAC_NHAN: "DA_XAC_NHAN", DANG_CHUAN_BI: "DANG_DONG_GOI",
  DANG_GIAO: "DANG_GIAO_HANG", DA_GIAO: "DA_GIAO_HANG", DA_HUY: "DA_HUY",
};
const badRequest = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const paymentMethods = new Set(["COD", "CHUYEN_KHOAN"]);

function normalizeProductIds(values) {
  if (!Array.isArray(values)) throw badRequest("Danh sách sản phẩm không hợp lệ");
  const ids = [...new Set(values.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (!ids.length) throw badRequest("Vui lòng chọn ít nhất một sản phẩm");
  return ids;
}

function calculateCheckout(productIds, promotionCode, context) {
  if (context.items.length !== productIds.length) throw badRequest("Một số sản phẩm không còn trong giỏ hàng", 409);
  for (const item of context.items) {
    if (item.trang_thai !== "DANG_BAN") throw badRequest(`${item.ten_san_pham} đã ngừng bán`, 409);
    if (item.so_luong > item.so_luong_ton) throw badRequest(`${item.ten_san_pham} chỉ còn ${item.so_luong_ton} sản phẩm`, 409);
  }
  const subtotal = context.items.reduce((sum, item) => sum + item.gia_ban * item.so_luong, 0);
  const threshold = Number(context.settings.nguong_mien_phi_van_chuyen) || 0;
  const standardShippingFee = Number(context.settings.phi_van_chuyen) || 0;
  let shippingFee = threshold > 0 && subtotal >= threshold ? 0 : standardShippingFee;
  let discountAmount = 0;
  let promotion = null;
  const normalizedCode = promotionCode?.trim().toUpperCase();
  if (normalizedCode) {
    promotion = context.promotions.find((item) => item.ma_khuyen_mai.toUpperCase() === normalizedCode);
    if (!promotion) throw badRequest("Mã giảm giá không tồn tại hoặc đã hết hạn", 404);
    if (subtotal < promotion.gia_tri_don_toi_thieu) throw badRequest(`Đơn hàng chưa đạt giá trị tối thiểu ${Number(promotion.gia_tri_don_toi_thieu).toLocaleString("vi-VN")}đ`);
    const applicableIds = promotion.san_pham_ids ? promotion.san_pham_ids.split(",").map(Number) : null;
    const eligibleSubtotal = applicableIds
      ? context.items.filter((item) => applicableIds.includes(item.id)).reduce((sum, item) => sum + item.gia_ban * item.so_luong, 0)
      : subtotal;
    if (applicableIds && eligibleSubtotal === 0) throw badRequest("Mã giảm giá không áp dụng cho sản phẩm đã chọn");
    if (promotion.loai_khuyen_mai === "PHAN_TRAM") {
      discountAmount = eligibleSubtotal * Number(promotion.gia_tri) / 100;
      if (promotion.giam_toi_da != null) discountAmount = Math.min(discountAmount, Number(promotion.giam_toi_da));
    } else if (promotion.loai_khuyen_mai === "SO_TIEN") {
      discountAmount = Math.min(eligibleSubtotal, Number(promotion.gia_tri));
    } else if (promotion.loai_khuyen_mai === "MIEN_PHI_VAN_CHUYEN") {
      shippingFee = 0;
    }
  }
  discountAmount = Math.round(discountAmount);
  return {
    subtotal, discountAmount, shippingFee, totalPayment: Math.max(0, subtotal - discountAmount + shippingFee),
    promotion,
  };
}

function mapSuggestedPromotion(promotion, items, subtotal, baseShippingFee) {
  const minimumOrder = Number(promotion.gia_tri_don_toi_thieu) || 0;
  if (subtotal < minimumOrder) return null;
  const productIds = promotion.san_pham_ids
    ? promotion.san_pham_ids.split(",").map(Number)
    : null;
  const eligibleSubtotal = productIds
    ? items.filter((item) => productIds.includes(item.id)).reduce((sum, item) => sum + item.gia_ban * item.so_luong, 0)
    : subtotal;
  if (productIds && eligibleSubtotal === 0) return null;

  let estimatedSavings = 0;
  if (promotion.loai_khuyen_mai === "PHAN_TRAM") {
    estimatedSavings = eligibleSubtotal * Number(promotion.gia_tri) / 100;
    if (promotion.giam_toi_da != null) estimatedSavings = Math.min(estimatedSavings, Number(promotion.giam_toi_da));
  } else if (promotion.loai_khuyen_mai === "SO_TIEN") {
    estimatedSavings = Math.min(eligibleSubtotal, Number(promotion.gia_tri));
  } else if (promotion.loai_khuyen_mai === "MIEN_PHI_VAN_CHUYEN") {
    estimatedSavings = baseShippingFee;
  }
  estimatedSavings = Math.round(estimatedSavings);
  if (estimatedSavings <= 0) return null;

  return {
    code: promotion.ma_khuyen_mai,
    title: promotion.ten_khuyen_mai,
    description: promotion.mo_ta,
    minimumOrder,
    type: promotion.loai_khuyen_mai,
    estimatedSavings,
  };
}

function mapCheckoutSummary(summary, context) {
  const { items, promotions, settings } = context;
  const threshold = Number(settings.nguong_mien_phi_van_chuyen) || 0;
  const standardShippingFee = Number(settings.phi_van_chuyen) || 0;
  const baseShippingFee = threshold > 0 && summary.subtotal >= threshold ? 0 : standardShippingFee;
  const suggestedPromotions = promotions
    .map((item) => mapSuggestedPromotion(item, items, summary.subtotal, baseShippingFee))
    .filter(Boolean)
    .sort((first, second) => second.estimatedSavings - first.estimatedSavings || first.code.localeCompare(second.code));

  return {
    items: items.map((item) => ({
      productId: String(item.id), productName: item.ten_san_pham, productImage: item.anh_chinh_url,
      price: item.gia_ban, quantity: item.so_luong, weight: item.quy_cach ?? "",
    })),
    subtotal: summary.subtotal, discountAmount: summary.discountAmount,
    shippingFee: summary.shippingFee, totalPayment: summary.totalPayment,
    appliedPromotion: summary.promotion ? { code: summary.promotion.ma_khuyen_mai, description: summary.promotion.ten_khuyen_mai } : null,
    promotions: suggestedPromotions,
  };
}

export async function getCheckoutQuote(userId, input) {
  const productIds = normalizeProductIds(input.productIds);
  const context = await findCheckoutContext(userId, productIds);
  return mapCheckoutSummary(calculateCheckout(productIds, input.promotionCode, context), context);
}

export async function createCustomerOrder(userId, input) {
  const productIds = normalizeProductIds(input.productIds);
  if (!paymentMethods.has(input.paymentMethod)) throw badRequest("Phương thức thanh toán không hợp lệ");
  if (!input.addressId && (!input.recipientName?.trim() || !input.phone?.trim() || !input.shippingAddress?.trim())) {
    throw badRequest("Vui lòng nhập đầy đủ thông tin giao hàng");
  }
  const paymentCode = input.paymentMethod === "CHUYEN_KHOAN" ? createSePayPaymentCode() : null;
  const result = await createOrderInTransaction(
    userId, productIds, { ...input, paymentCode },
    (context) => calculateCheckout(productIds, input.promotionCode, context),
  );
  await Promise.all([
    notifyUser(userId, {
      type: "DON_HANG_MOI",
      title: "Đặt hàng thành công",
      content: `Đơn ${result.orderCode} đã được tạo và đang chờ xác nhận.`,
      path: "/tai-khoan/don-hang",
      tag: `order-${result.id}`,
    }),
    notifyAdmins({
      type: "DON_HANG_MOI",
      title: "Có đơn hàng mới",
      content: `Đơn ${result.orderCode} trị giá ${Number(result.summary.totalPayment).toLocaleString("vi-VN")}đ đang chờ xác nhận.`,
      path: "/admin/don-hang",
      tag: `admin-order-${result.id}`,
    }),
  ]);
  return {
    id: String(result.id),
    orderCode: result.orderCode,
    paymentRequired: input.paymentMethod === "CHUYEN_KHOAN",
  };
}

export async function getCustomerOrders(userId) {
  const { orders, items } = await findOrdersByUserId(userId);
  return orders.map((order) => {
    const orderItems = items.filter((item) => item.don_hang_id === order.id);
    return {
      id: String(order.id), orderCode: order.ma_don_hang, userId: String(order.nguoi_dung_id),
      recipientName: order.ten_nguoi_nhan, phone: order.so_dien_thoai,
      shippingAddress: [order.dia_chi_chi_tiet, order.phuong_xa, order.quan_huyen, order.tinh_thanh].filter(Boolean).join(', '),
      customerNote: order.ghi_chu_khach_hang ?? undefined,
      totalProductPrice: order.tong_tien_hang, discountAmount: order.tien_giam,
      shippingFee: order.phi_van_chuyen, totalPayment: order.tong_thanh_toan,
      paymentMethod: order.phuong_thuc_thanh_toan, orderStatus: statusMap[order.trang_thai_don_hang],
      paymentStatus: order.trang_thai_thanh_toan, createdAt: order.ngay_tao,
      cancelReason: order.ly_do_huy ?? undefined,
      isReviewed: orderItems.length > 0 && orderItems.every((item) => Boolean(item.da_danh_gia)),
      items: orderItems.map((item) => ({
        productId: String(item.san_pham_id), productName: item.ten_san_pham,
        productImage: item.anh_san_pham_url, price: item.don_gia,
        quantity: item.so_luong, weight: item.quy_cach ?? "",
      })),
    };
  });
}

export async function cancelCustomerOrder(userId, orderId, reason) {
  if (!await cancelUserOrder(userId, orderId, reason?.trim() || "Người dùng yêu cầu hủy")) {
    throw badRequest("Chỉ có thể hủy đơn chưa thanh toán đang chờ xác nhận", 409);
  }
  await notifyAdmins({
    type: "DON_HANG_DA_HUY",
    title: "Khách hàng đã hủy đơn",
    content: `Đơn hàng #${orderId} vừa được khách hàng hủy.`,
    path: "/admin/don-hang",
    tag: `admin-order-cancelled-${orderId}`,
  });
}

export async function submitCustomerOrderReviews(userId, orderId, inputReviews) {
  if (!await findOrderForReview(userId, orderId)) throw badRequest("Đơn hàng chưa đủ điều kiện đánh giá", 409);
  const details = await findOrderDetails(orderId);
  const reviews = details.map((detail) => {
    const input = inputReviews.find((item) => String(item.productId) === String(detail.san_pham_id));
    if (!input || input.rating < 1 || input.rating > 5) throw badRequest("Vui lòng đánh giá đầy đủ sản phẩm");
    return { productId: detail.san_pham_id, orderDetailId: detail.id, rating: input.rating, comment: input.comment?.trim() ?? "" };
  });
  try { await insertOrderReviews(userId, reviews); }
  catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw badRequest("Đơn hàng đã được đánh giá", 409);
    throw error;
  }
  await notifyAdmins({
    type: "DANH_GIA_MOI",
    title: "Có đánh giá sản phẩm mới",
    content: `Khách hàng vừa gửi ${reviews.length} đánh giá từ đơn hàng #${orderId}.`,
    path: "/admin/danh-gia",
    tag: `admin-review-${orderId}`,
  });
}

export async function getCustomerOrderReviews(userId, orderId) {
  return (await findReviewsByOrder(userId, orderId)).map((row) => ({
    id: String(row.id), productId: String(row.san_pham_id), rating: row.so_sao,
    comment: row.noi_dung ?? "", status: row.trang_thai,
  }));
}
