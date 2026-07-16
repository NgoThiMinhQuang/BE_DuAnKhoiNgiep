import {
  cancelUserOrder, findOrderDetails, findOrderForReview, findOrdersByUserId,
  findReviewsByOrder, insertOrderReviews,
} from "../repositories/order.repository.js";

const statusMap = {
  CHO_XAC_NHAN: "CHO_XAC_NHAN", DA_XAC_NHAN: "DA_XAC_NHAN", DANG_CHUAN_BI: "DANG_DONG_GOI",
  DANG_GIAO: "DANG_GIAO_HANG", DA_GIAO: "DA_GIAO_HANG", DA_HUY: "DA_HUY",
};
const badRequest = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

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
    throw badRequest("Chỉ có thể hủy đơn đang chờ xác nhận", 409);
  }
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
}

export async function getCustomerOrderReviews(userId, orderId) {
  return (await findReviewsByOrder(userId, orderId)).map((row) => ({
    id: String(row.id), productId: String(row.san_pham_id), rating: row.so_sao,
    comment: row.noi_dung ?? "", status: row.trang_thai,
  }));
}
