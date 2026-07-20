import {
  findActiveCategories,
  findActivePromotions,
  findApplicablePromotions,
  findApprovedReviews,
  findPublishedProducts,
  findStoreSettings,
} from "../repositories/product.repository.js";

function splitValues(value, separator = ",") {
  return value ? value.split(separator).map((item) => item.trim()).filter(Boolean) : [];
}

function mapProduct(row) {
  const gallery = splitValues(row.gallery, "||");
  const originalPrice = row.gia_niem_yet > row.gia_ban ? row.gia_niem_yet : undefined;

  return {
    id: String(row.id),
    sku: row.ma_sku,
    slug: row.duong_dan,
    name: row.ten_san_pham,
    nameEn: row.ma_san_pham,
    category: row.ten_danh_muc,
    categorySlug: row.danh_muc_duong_dan,
    image: gallery[0] ?? row.anh_chinh_url,
    gallery: gallery.length ? gallery : [row.anh_chinh_url].filter(Boolean),
    price: row.gia_ban,
    originalPrice,
    discount: originalPrice ? Math.round((originalPrice - row.gia_ban) * 100 / originalPrice) : undefined,
    weight: row.quy_cach ?? "",
    origin: row.xuat_xu ?? "",
    description: row.mo_ta_chi_tiet ?? row.mo_ta_ngan ?? "",
    mainIngredients: splitValues(row.thanh_phan),
    tags: splitValues(row.cong_dung),
    usageInstructions: row.huong_dan_su_dung ?? "",
    isCombo: row.loai_san_pham === "COMBO",
    stock: Number(row.so_luong_kha_dung),
    inStock: Number(row.so_luong_kha_dung) > 0,
  };
}

function mapPromotion(row) {
  return {
    code: row.ma_khuyen_mai,
    title: `NHẬP MÃ: ${row.ma_khuyen_mai}`,
    description: row.ten_khuyen_mai,
    conditions: splitValues(row.mo_ta, "\n"),
  };
}

export async function getProductCatalog() {
  const [productRows, categoryRows, promotionRows, storeSettings] = await Promise.all([
    findPublishedProducts(),
    findActiveCategories(),
    findActivePromotions(),
    findStoreSettings(),
  ]);

  return {
    storeName: storeSettings.ten_cua_hang,
    store: {
      name: storeSettings.ten_cua_hang,
      description: storeSettings.mo_ta ?? "",
      hotline: storeSettings.hotline ?? "",
      email: storeSettings.email ?? "",
      legalName: storeSettings.ten_phap_ly ?? "",
      supportEmail: storeSettings.email_ho_tro ?? "",
      mapEmbedUrl: storeSettings.google_maps_url ?? "",
      orderPrefix: storeSettings.tien_to_don_hang ?? "RBB",
      codEnabled: Boolean(storeSettings.bat_cod), bankTransferEnabled: Boolean(storeSettings.bat_chuyen_khoan),
      youtubeUrl: storeSettings.youtube_url ?? "", notificationEmail: storeSettings.email_thong_bao ?? "",
      lowStockThreshold: Number(storeSettings.nguong_canh_bao_kho ?? 5),
      sendOrderConfirmation: Boolean(storeSettings.gui_email_xac_nhan),
      maintenanceMode: Boolean(storeSettings.che_do_bao_tri),
    },
    categories: [
      { name: "Tất cả sản phẩm", slug: "tat-ca" },
      ...categoryRows.map((row) => ({ id: row.id, name: row.ten_danh_muc, slug: row.duong_dan })),
    ],
    products: productRows.map(mapProduct),
    promotions: promotionRows.map(mapPromotion),
  };
}

export async function getProductDetails(slug) {
  const catalog = await getProductCatalog();
  const product = catalog.products.find((item) => item.slug === slug);

  if (!product) {
    const error = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const [reviewRows, promotionRows] = await Promise.all([
    findApprovedReviews(product.id),
    findApplicablePromotions(product.id),
  ]);
  const reviews = reviewRows.map((row) => ({
    id: String(row.id),
    productId: product.id,
    userId: String(row.nguoi_dung_id),
    userName: row.ho_ten,
    rating: row.so_sao,
    comment: row.noi_dung ?? "",
    createdAt: row.ngay_tao,
    status: "approved",
    reply: row.phan_hoi_admin ?? undefined,
    replyAt: row.phan_hoi_admin ? row.ngay_cap_nhat : undefined,
    verifiedPurchase: Boolean(row.chi_tiet_don_hang_id),
  }));

  return {
    product,
    reviews,
    promotions: promotionRows.map(mapPromotion),
    similarProducts: catalog.products.filter((item) => item.id !== product.id).slice(0, 4),
    store: catalog.store,
  };
}
