import {
  createAdminArticle,
  createAdminCategory,
  createAdminExport,
  createAdminImport,
  createAdminProduct,
  createAdminPromotion,
  createAdminSupplier,
  findAdminArticles,
  findAdminCategories,
  findAdminContacts,
  findAdminInventory,
  findAdminOrderById,
  findAdminOrders,
  findAdminProducts,
  findAdminPromotions,
  findAdminReviews,
  findAdminSettings,
  findAdminUsers,
  findDashboardData,
  hideAdminProduct,
  updateAdminArticle,
  updateAdminCategory,
  updateAdminContact,
  updateAdminOrderInTransaction,
  updateAdminProduct,
  updateAdminPromotion,
  updateAdminReview,
  updateAdminSettings,
  updateAdminSupplier,
  updateAdminUser,
} from "../repositories/admin.repository.js";

const badRequest = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

function pageOptions(query) {
  const page = Math.max(Number.parseInt(query.page ?? "1", 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit ?? "20", 10) || 20, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}

function paged(items, page, limit, total) {
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function requiredText(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw badRequest(`${label} là bắt buộc`);
  return text;
}

function numberValue(value, label, minimum = 0) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number) || number < minimum) throw badRequest(`${label} không hợp lệ`);
  return number;
}

function integerValue(value, label, minimum = 0) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum) throw badRequest(`${label} không hợp lệ`);
  return number;
}

function mapOrder(order) {
  return {
    id: String(order.id), orderCode: order.ma_don_hang,
    customerId: String(order.nguoi_dung_id), customerName: order.ten_khach_hang,
    recipientName: order.ten_nguoi_nhan, phone: order.so_dien_thoai, email: order.email,
    shippingAddress: [order.dia_chi_chi_tiet, order.phuong_xa, order.quan_huyen, order.tinh_thanh].filter(Boolean).join(", "),
    subtotal: Number(order.tong_tien_hang), discount: Number(order.tien_giam),
    shippingFee: Number(order.phi_van_chuyen), total: Number(order.tong_thanh_toan),
    paymentMethod: order.phuong_thuc_thanh_toan, paymentStatus: order.trang_thai_thanh_toan,
    orderStatus: order.trang_thai_don_hang, customerNote: order.ghi_chu_khach_hang,
    adminNote: order.ghi_chu_admin, cancelReason: order.ly_do_huy,
    shippingProvider: order.don_vi_van_chuyen, trackingCode: order.ma_van_don,
    lineCount: Number(order.so_dong_san_pham ?? 0), itemCount: Number(order.tong_so_luong ?? 0),
    createdAt: order.ngay_tao, updatedAt: order.ngay_cap_nhat,
  };
}

function numberFields(value) {
  return Object.fromEntries(Object.entries(value ?? {}).map(([key, item]) => [key, Number(item ?? 0)]));
}

function percentageChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function mapDashboardPeriod(period) {
  const current = numberFields(period.current);
  const previous = numberFields(period.previous);
  return {
    stats: current,
    changes: {
      revenue: percentageChange(current.revenue, previous.revenue),
      orders: percentageChange(current.orders, previous.orders),
      customers: percentageChange(current.customers, previous.customers),
      unitsSold: percentageChange(current.units_sold, previous.units_sold),
    },
    revenueSeries: period.revenueSeries.map((item) => ({
      bucket: Number(item.bucket),
      revenue: Number(item.revenue),
    })),
    orderStatus: numberFields(period.orderStatus),
    bestSellingProducts: period.bestSellingProducts.map((item) => ({
      id: item.id == null ? null : String(item.id),
      name: item.name,
      sold: Number(item.sold),
    })),
    recentOrders: period.recentOrders.map(mapOrder),
  };
}

export async function getAdminDashboard() {
  const data = await findDashboardData();
  return {
    summary: numberFields(data.summary),
    recentOrders: data.recentOrders.map(mapOrder),
    lowStock: data.lowStock.map((item) => ({
      id: String(item.id), productCode: item.ma_san_pham, sku: item.ma_sku,
      name: item.ten_san_pham, stock: Number(item.so_luong_ton), minimumStock: Number(item.ton_toi_thieu),
    })),
    periods: Object.fromEntries(Object.entries(data.periods).map(([key, period]) => [
      key,
      mapDashboardPeriod(period),
    ])),
  };
}

export async function getAdminOrders(query) {
  const options = pageOptions(query);
  const result = await findAdminOrders({
    status: query.status, paymentStatus: query.paymentStatus,
    search: query.search?.trim(), ...options,
  });
  return paged(result.rows.map(mapOrder), options.page, options.limit, result.total);
}

export async function getAdminOrder(orderId) {
  const result = await findAdminOrderById(orderId);
  if (!result) throw badRequest("Không tìm thấy đơn hàng", 404);
  return {
    ...mapOrder(result.order),
    items: result.items.map((item) => ({
      id: String(item.id), productId: item.san_pham_id == null ? null : String(item.san_pham_id),
      productCode: item.ma_san_pham, name: item.ten_san_pham, image: item.anh_san_pham_url,
      quantity: Number(item.so_luong), unitPrice: Number(item.don_gia), total: Number(item.thanh_tien),
    })),
    exports: result.exports.map((item) => ({
      id: String(item.id), code: item.ma_phieu_xuat, type: item.loai_xuat,
      status: item.trang_thai, exportedAt: item.ngay_xuat,
    })),
  };
}

const transitions = {
  CHO_XAC_NHAN: ["DA_XAC_NHAN", "DA_HUY"],
  DA_XAC_NHAN: ["DANG_CHUAN_BI", "DA_HUY"],
  DANG_CHUAN_BI: ["DANG_GIAO", "DA_HUY"],
  DANG_GIAO: ["DA_GIAO"],
  DA_GIAO: [],
  DA_HUY: [],
};

export async function changeAdminOrder(orderId, input) {
  const current = await getAdminOrder(orderId);
  const orderStatuses = Object.keys(transitions);
  const paymentStatuses = ["CHUA_THANH_TOAN", "DA_THANH_TOAN", "THAT_BAI", "DA_HOAN_TIEN"];
  if (input.orderStatus && !orderStatuses.includes(input.orderStatus)) throw badRequest("Trạng thái đơn hàng không hợp lệ");
  if (input.paymentStatus && !paymentStatuses.includes(input.paymentStatus)) throw badRequest("Trạng thái thanh toán không hợp lệ");
  if (input.orderStatus && input.orderStatus !== current.orderStatus
    && !transitions[current.orderStatus].includes(input.orderStatus)) {
    throw badRequest(`Không thể chuyển đơn từ ${current.orderStatus} sang ${input.orderStatus}`, 409);
  }
  if (input.orderStatus === "DA_HUY" && !input.cancelReason?.trim()) {
    throw badRequest("Vui lòng nhập lý do hủy đơn");
  }
  if (!await updateAdminOrderInTransaction(orderId, {
    orderStatus: input.orderStatus, paymentStatus: input.paymentStatus,
    adminNote: input.adminNote?.trim(), cancelReason: input.cancelReason?.trim(),
    shippingProvider: input.shippingProvider?.trim(), trackingCode: input.trackingCode?.trim(),
  })) throw badRequest("Không tìm thấy đơn hàng", 404);
  return getAdminOrder(orderId);
}

export async function getAdminUsers(query) {
  const options = pageOptions(query);
  const result = await findAdminUsers({
    role: query.role, status: query.status, search: query.search?.trim(), ...options,
  });
  return paged(result.rows.map((item) => ({
    id: String(item.id), fullName: item.ho_ten, email: item.email,
    phone: item.so_dien_thoai, avatar: item.anh_dai_dien_url,
    role: item.vai_tro, status: item.trang_thai,
    orderCount: Number(item.so_don_hang), spending: Number(item.tong_chi_tieu),
    createdAt: item.ngay_tao,
  })), options.page, options.limit, result.total);
}

export async function changeAdminUser(adminId, userId, input) {
  if (input.role && !["ADMIN", "KHACH_HANG"].includes(input.role)) throw badRequest("Vai trò không hợp lệ");
  if (input.status && !["HOAT_DONG", "BI_KHOA"].includes(input.status)) throw badRequest("Trạng thái không hợp lệ");
  if (Number(adminId) === Number(userId) && input.status === "BI_KHOA") throw badRequest("Bạn không thể tự khóa tài khoản");
  if (!await updateAdminUser(userId, input)) throw badRequest("Không tìm thấy tài khoản", 404);
}

export async function getAdminReviews(query) {
  const options = pageOptions(query);
  const result = await findAdminReviews({ status: query.status, ...options });
  return paged(result.rows.map((item) => ({
    id: String(item.id), userId: String(item.nguoi_dung_id), userName: item.ho_ten,
    email: item.email, productId: String(item.san_pham_id), productName: item.ten_san_pham,
    productCode: item.ma_san_pham, rating: Number(item.so_sao), content: item.noi_dung,
    reply: item.phan_hoi_admin, status: item.trang_thai, createdAt: item.ngay_tao,
  })), options.page, options.limit, result.total);
}

export async function changeAdminReview(reviewId, input) {
  if (input.status && !["CHO_DUYET", "DA_DUYET", "TU_CHOI"].includes(input.status)) throw badRequest("Trạng thái đánh giá không hợp lệ");
  if (!await updateAdminReview(reviewId, { status: input.status, reply: input.reply?.trim() })) {
    throw badRequest("Không tìm thấy đánh giá", 404);
  }
}

export async function getAdminContacts(query) {
  const options = pageOptions(query);
  const result = await findAdminContacts({ status: query.status, ...options });
  return paged(result.rows.map((item) => ({
    id: String(item.id), fullName: item.ho_ten, email: item.email,
    phone: item.so_dien_thoai, subject: item.tieu_de, content: item.noi_dung,
    status: item.trang_thai, adminNote: item.ghi_chu_admin,
    handledBy: item.nguoi_xu_ly, createdAt: item.ngay_tao,
  })), options.page, options.limit, result.total);
}

export async function changeAdminContact(adminId, contactId, input) {
  if (input.status && !["MOI", "DANG_XU_LY", "DA_XU_LY"].includes(input.status)) throw badRequest("Trạng thái liên hệ không hợp lệ");
  if (!await updateAdminContact(contactId, adminId, { status: input.status, adminNote: input.adminNote?.trim() })) {
    throw badRequest("Không tìm thấy liên hệ", 404);
  }
}

export async function getAdminSettings() {
  const item = await findAdminSettings();
  if (!item) throw badRequest("Chưa có cấu hình cửa hàng", 404);
  return {
    id: String(item.id), storeName: item.ten_cua_hang, logoUrl: item.logo_url,
    description: item.mo_ta, hotline: item.hotline, email: item.email,
    address: item.dia_chi, workingHours: item.gio_lam_viec,
    shippingFee: Number(item.phi_van_chuyen),
    freeShippingThreshold: Number(item.nguong_mien_phi_van_chuyen),
    facebookUrl: item.facebook_url, instagramUrl: item.instagram_url, tiktokUrl: item.tiktok_url,
  };
}

export async function changeAdminSettings(input) {
  if (input.shippingFee != null) input.shippingFee = numberValue(input.shippingFee, "Phí vận chuyển");
  if (input.freeShippingThreshold != null) input.freeShippingThreshold = numberValue(input.freeShippingThreshold, "Ngưỡng miễn phí vận chuyển");
  if (!await updateAdminSettings(input)) throw badRequest("Chưa có cấu hình cửa hàng", 404);
  return getAdminSettings();
}

function normalizeImages(images, fallback) {
  const values = Array.isArray(images) ? images : [];
  const normalized = values.map((item, index) => ({
    url: requiredText(typeof item === "string" ? item : item.url, "Đường dẫn ảnh"),
    altText: typeof item === "string" ? "" : item.altText?.trim() || "",
    order: typeof item === "string" ? index + 1 : integerValue(item.order ?? index + 1, "Thứ tự ảnh", 0),
  }));
  if (!normalized.length && fallback) normalized.push({ url: fallback, altText: "", order: 1 });
  return normalized;
}

function normalizeProduct(input, current = null) {
  const name = requiredText(input.name ?? current?.name, "Tên sản phẩm");
  const mainImage = input.mainImage ?? current?.mainImage ?? null;
  const product = {
    categoryId: integerValue(input.categoryId ?? current?.categoryId, "Danh mục", 1),
    productCode: requiredText(input.productCode ?? current?.productCode, "Mã sản phẩm"),
    sku: requiredText(input.sku ?? current?.sku, "SKU"), name,
    slug: requiredText(input.slug ?? current?.slug ?? slugify(name), "Đường dẫn"),
    productType: input.productType ?? current?.productType ?? "DON",
    shortDescription: input.shortDescription ?? current?.shortDescription ?? null,
    description: input.description ?? current?.description ?? null,
    ingredients: input.ingredients ?? current?.ingredients ?? null,
    benefits: input.benefits ?? current?.benefits ?? null,
    usageInstructions: input.usageInstructions ?? current?.usageInstructions ?? null,
    specification: input.specification ?? current?.specification ?? null,
    origin: input.origin ?? current?.origin ?? null, mainImage,
    listPrice: numberValue(input.listPrice ?? current?.listPrice, "Giá niêm yết"),
    salePrice: numberValue(input.salePrice ?? current?.salePrice, "Giá bán"),
    costPrice: numberValue(input.costPrice ?? current?.costPrice, "Giá vốn"),
    stock: integerValue(input.stock ?? current?.stock ?? 0, "Tồn kho", 0),
    minimumStock: integerValue(input.minimumStock ?? current?.minimumStock ?? 0, "Tồn tối thiểu", 0),
    featured: Boolean(input.featured ?? current?.featured),
    status: input.status ?? current?.status ?? "NHAP",
  };
  if (!['DON', 'COMBO'].includes(product.productType)) throw badRequest("Loại sản phẩm không hợp lệ");
  if (!['NHAP', 'DANG_BAN', 'TAM_AN', 'NGUNG_BAN'].includes(product.status)) throw badRequest("Trạng thái sản phẩm không hợp lệ");
  if (product.salePrice > product.listPrice && product.listPrice > 0) throw badRequest("Giá bán không được lớn hơn giá niêm yết");
  product.images = input.images == null && current ? null : normalizeImages(input.images, mainImage);
  return product;
}

function mapAdminProduct(item) {
  return {
    id: String(item.id), categoryId: String(item.danh_muc_id), categoryName: item.ten_danh_muc,
    productCode: item.ma_san_pham, sku: item.ma_sku, name: item.ten_san_pham,
    slug: item.duong_dan, productType: item.loai_san_pham,
    shortDescription: item.mo_ta_ngan, description: item.mo_ta_chi_tiet,
    ingredients: item.thanh_phan, benefits: item.cong_dung,
    usageInstructions: item.huong_dan_su_dung, specification: item.quy_cach,
    origin: item.xuat_xu, mainImage: item.anh_chinh_url,
    images: item.gallery ? item.gallery.split("||") : [],
    listPrice: Number(item.gia_niem_yet), salePrice: Number(item.gia_ban),
    costPrice: Number(item.gia_von), stock: Number(item.so_luong_ton),
    minimumStock: Number(item.ton_toi_thieu), featured: Boolean(item.la_noi_bat),
    status: item.trang_thai, createdAt: item.ngay_tao, updatedAt: item.ngay_cap_nhat,
  };
}

export async function getAdminProducts() {
  return (await findAdminProducts()).map(mapAdminProduct);
}

export async function addAdminProduct(input) {
  const product = normalizeProduct(input);
  return { id: String(await createAdminProduct(product)) };
}

export async function changeAdminProduct(productId, input) {
  const current = (await getAdminProducts()).find((item) => item.id === String(productId));
  if (!current) throw badRequest("Không tìm thấy sản phẩm", 404);
  const product = normalizeProduct(input, current);
  if (!await updateAdminProduct(productId, product)) throw badRequest("Không tìm thấy sản phẩm", 404);
}

export async function removeAdminProduct(productId) {
  if (!await hideAdminProduct(productId)) throw badRequest("Không tìm thấy sản phẩm", 404);
}

function normalizeCategory(input, current = null) {
  const name = requiredText(input.name ?? current?.name, "Tên danh mục");
  const status = input.status ?? current?.status ?? "HOAT_DONG";
  if (!['HOAT_DONG', 'DANG_AN'].includes(status)) throw badRequest("Trạng thái danh mục không hợp lệ");
  return {
    name, slug: requiredText(input.slug ?? current?.slug ?? slugify(name), "Đường dẫn"),
    description: input.description ?? current?.description ?? null,
    imageUrl: input.imageUrl ?? current?.imageUrl ?? null,
    displayOrder: integerValue(input.displayOrder ?? current?.displayOrder ?? 0, "Thứ tự hiển thị", 0),
    status,
  };
}

export async function getAdminCategories() {
  return (await findAdminCategories()).map((item) => ({
    id: String(item.id), name: item.ten_danh_muc, slug: item.duong_dan,
    description: item.mo_ta, imageUrl: item.hinh_anh_url,
    displayOrder: Number(item.thu_tu_hien_thi), status: item.trang_thai,
    productCount: Number(item.so_san_pham),
  }));
}

export async function addAdminCategory(input) {
  return { id: String(await createAdminCategory(normalizeCategory(input))) };
}

export async function changeAdminCategory(categoryId, input) {
  const current = (await getAdminCategories()).find((item) => item.id === String(categoryId));
  if (!current) throw badRequest("Không tìm thấy danh mục", 404);
  if (!await updateAdminCategory(categoryId, normalizeCategory(input, current))) throw badRequest("Không tìm thấy danh mục", 404);
}

function normalizePromotion(input, current = null) {
  const type = input.type ?? current?.type;
  const status = input.status ?? current?.status ?? "HOAT_DONG";
  if (!['PHAN_TRAM', 'SO_TIEN', 'MIEN_PHI_VAN_CHUYEN'].includes(type)) throw badRequest("Loại khuyến mãi không hợp lệ");
  if (!['HOAT_DONG', 'TAM_DUNG', 'HET_HAN'].includes(status)) throw badRequest("Trạng thái khuyến mãi không hợp lệ");
  const startsAt = input.startsAt ?? current?.startsAt;
  const endsAt = input.endsAt ?? current?.endsAt;
  if (!startsAt || !endsAt || new Date(startsAt) >= new Date(endsAt)) throw badRequest("Thời gian khuyến mãi không hợp lệ");
  const productIds = [...new Set((input.productIds ?? current?.productIds ?? []).map(Number))];
  if (productIds.some((id) => !Number.isInteger(id) || id < 1)) throw badRequest("Sản phẩm áp dụng không hợp lệ");
  return {
    code: requiredText(input.code ?? current?.code, "Mã khuyến mãi").toUpperCase(),
    name: requiredText(input.name ?? current?.name, "Tên khuyến mãi"),
    description: input.description ?? current?.description ?? null, type,
    value: numberValue(input.value ?? current?.value ?? 0, "Giá trị khuyến mãi"),
    maximumDiscount: input.maximumDiscount == null && current?.maximumDiscount == null
      ? null : numberValue(input.maximumDiscount ?? current.maximumDiscount, "Giảm tối đa"),
    minimumOrder: numberValue(input.minimumOrder ?? current?.minimumOrder ?? 0, "Đơn tối thiểu"),
    maximumUses: input.maximumUses == null && current?.maximumUses == null
      ? null : integerValue(input.maximumUses ?? current.maximumUses, "Lượt dùng tối đa", 1),
    startsAt, endsAt, status, productIds,
  };
}

export async function getAdminPromotions() {
  return (await findAdminPromotions()).map((item) => ({
    id: String(item.id), code: item.ma_khuyen_mai, name: item.ten_khuyen_mai,
    description: item.mo_ta, type: item.loai_khuyen_mai,
    value: Number(item.gia_tri), maximumDiscount: item.giam_toi_da == null ? null : Number(item.giam_toi_da),
    minimumOrder: Number(item.gia_tri_don_toi_thieu),
    maximumUses: item.so_luot_su_dung_toi_da == null ? null : Number(item.so_luot_su_dung_toi_da),
    usedCount: Number(item.so_luot_da_su_dung), startsAt: item.ngay_bat_dau,
    endsAt: item.ngay_ket_thuc, status: item.trang_thai,
    productIds: item.san_pham_ids ? item.san_pham_ids.split(",").map(String) : [],
  }));
}

export async function addAdminPromotion(input) {
  return { id: String(await createAdminPromotion(normalizePromotion(input))) };
}

export async function changeAdminPromotion(promotionId, input) {
  const current = (await getAdminPromotions()).find((item) => item.id === String(promotionId));
  if (!current) throw badRequest("Không tìm thấy khuyến mãi", 404);
  if (!await updateAdminPromotion(promotionId, normalizePromotion(input, current))) throw badRequest("Không tìm thấy khuyến mãi", 404);
}

function normalizeArticle(input, current = null) {
  const title = requiredText(input.title ?? current?.title, "Tiêu đề");
  const status = input.status ?? current?.status ?? "NHAP";
  if (!['NHAP', 'DA_DANG', 'DANG_AN'].includes(status)) throw badRequest("Trạng thái bài viết không hợp lệ");
  let content = input.content ?? current?.content;
  if (typeof content !== "string") content = JSON.stringify(content ?? {});
  if (!content.trim()) throw badRequest("Nội dung bài viết là bắt buộc");
  return {
    category: input.category ?? current?.category ?? null,
    title, slug: requiredText(input.slug ?? current?.slug ?? slugify(title), "Đường dẫn"),
    summary: input.summary ?? current?.summary ?? null, content,
    imageUrl: input.imageUrl ?? current?.imageUrl ?? null,
    featured: Boolean(input.featured ?? current?.featured), status,
    publishedAt: status === "DA_DANG"
      ? (input.publishedAt ?? current?.publishedAt ?? new Date())
      : (input.publishedAt ?? current?.publishedAt ?? null),
  };
}

export async function getAdminArticles() {
  return (await findAdminArticles()).map((item) => ({
    id: String(item.id), authorId: item.tac_gia_id == null ? null : String(item.tac_gia_id),
    authorName: item.ten_tac_gia, category: item.chuyen_muc,
    title: item.tieu_de, slug: item.duong_dan, summary: item.tom_tat,
    content: item.noi_dung, imageUrl: item.anh_dai_dien_url,
    featured: Boolean(item.la_noi_bat), views: Number(item.luot_xem),
    status: item.trang_thai, publishedAt: item.ngay_dang,
    createdAt: item.ngay_tao, updatedAt: item.ngay_cap_nhat,
  }));
}

export async function addAdminArticle(adminId, input) {
  return { id: String(await createAdminArticle(adminId, normalizeArticle(input))) };
}

export async function changeAdminArticle(articleId, input) {
  const current = (await getAdminArticles()).find((item) => item.id === String(articleId));
  if (!current) throw badRequest("Không tìm thấy bài viết", 404);
  if (!await updateAdminArticle(articleId, normalizeArticle(input, current))) throw badRequest("Không tìm thấy bài viết", 404);
}

function normalizeSupplier(input, current = null) {
  const status = input.status ?? current?.status ?? "HOAT_DONG";
  if (!['HOAT_DONG', 'NGUNG_HOP_TAC'].includes(status)) throw badRequest("Trạng thái nhà cung cấp không hợp lệ");
  return {
    code: requiredText(input.code ?? current?.code, "Mã nhà cung cấp"),
    name: requiredText(input.name ?? current?.name, "Tên nhà cung cấp"),
    contactName: input.contactName ?? current?.contactName ?? null,
    phone: input.phone ?? current?.phone ?? null, email: input.email ?? current?.email ?? null,
    address: input.address ?? current?.address ?? null, note: input.note ?? current?.note ?? null,
    status,
  };
}

function normalizeVoucherItems(items, allowUnitPriceOptional = false) {
  if (!Array.isArray(items) || !items.length) throw badRequest("Phiếu kho phải có ít nhất một sản phẩm");
  const normalized = items.map((item) => ({
    productId: integerValue(item.productId, "Sản phẩm", 1),
    quantity: integerValue(item.quantity, "Số lượng", 1),
    unitPrice: allowUnitPriceOptional && item.unitPrice == null
      ? null : numberValue(item.unitPrice, "Đơn giá"),
  }));
  if (new Set(normalized.map((item) => item.productId)).size !== normalized.length) {
    throw badRequest("Một sản phẩm không được lặp lại trong cùng phiếu kho");
  }
  return normalized;
}

function createVoucherCode(prefix) {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `${prefix}-${date}-${String(Date.now()).slice(-6)}`;
}

export async function getAdminInventory() {
  const data = await findAdminInventory();
  return {
    products: data.products.map((item) => ({
      id: String(item.id), productCode: item.ma_san_pham, sku: item.ma_sku,
      name: item.ten_san_pham, image: item.anh_chinh_url,
      stock: Number(item.so_luong_ton), minimumStock: Number(item.ton_toi_thieu),
      costPrice: Number(item.gia_von), status: item.trang_thai,
    })),
    suppliers: data.suppliers.map((item) => ({
      id: String(item.id), code: item.ma_nha_cung_cap, name: item.ten_nha_cung_cap,
      contactName: item.nguoi_lien_he, phone: item.so_dien_thoai,
      email: item.email, address: item.dia_chi, note: item.ghi_chu,
      status: item.trang_thai,
    })),
    imports: data.imports.map((item) => ({
      id: String(item.id), code: item.ma_phieu_nhap,
      supplierId: String(item.nha_cung_cap_id), supplierName: item.ten_nha_cung_cap,
      createdBy: item.nguoi_tao, date: item.ngay_nhap, total: Number(item.tong_tien),
      quantity: Number(item.tong_so_luong), note: item.ghi_chu, status: item.trang_thai,
    })),
    exports: data.exports.map((item) => ({
      id: String(item.id), code: item.ma_phieu_xuat,
      orderId: item.don_hang_id == null ? null : String(item.don_hang_id),
      type: item.loai_xuat, recipient: item.nguoi_nhan, createdBy: item.nguoi_tao,
      date: item.ngay_xuat, total: Number(item.tong_gia_tri),
      quantity: Number(item.tong_so_luong), note: item.ghi_chu, status: item.trang_thai,
    })),
  };
}

export async function addAdminSupplier(input) {
  return { id: String(await createAdminSupplier(normalizeSupplier(input))) };
}

export async function changeAdminSupplier(supplierId, input) {
  const current = (await getAdminInventory()).suppliers.find((item) => item.id === String(supplierId));
  if (!current) throw badRequest("Không tìm thấy nhà cung cấp", 404);
  if (!await updateAdminSupplier(supplierId, normalizeSupplier(input, current))) throw badRequest("Không tìm thấy nhà cung cấp", 404);
}

export async function addAdminImport(adminId, input) {
  const normalized = {
    code: input.code?.trim() || createVoucherCode("PN"),
    supplierId: integerValue(input.supplierId, "Nhà cung cấp", 1),
    date: input.date ?? new Date(), note: input.note?.trim() || null,
    items: normalizeVoucherItems(input.items),
  };
  const result = await createAdminImport(adminId, normalized);
  return { id: String(result.id), code: normalized.code, total: result.total };
}

export async function addAdminExport(adminId, input) {
  const type = input.type ?? "XUAT_KHAC";
  if (!['XUAT_HUY', 'XUAT_KHAC'].includes(type)) throw badRequest("Loại phiếu xuất thủ công không hợp lệ");
  const normalized = {
    code: input.code?.trim() || createVoucherCode("PX"), type,
    date: input.date ?? new Date(), recipient: input.recipient?.trim() || null,
    note: input.note?.trim() || null,
    items: normalizeVoucherItems(input.items, true),
  };
  const result = await createAdminExport(adminId, normalized);
  return { id: String(result.id), code: normalized.code, total: result.total };
}
