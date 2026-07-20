import { database } from "../config/database.js";

export async function findPublishedProducts() {
  const [rows] = await database.query(`
    SELECT
      sp.id, sp.ma_san_pham, sp.ma_sku, sp.ten_san_pham, sp.duong_dan,
      sp.loai_san_pham, sp.mo_ta_ngan, sp.mo_ta_chi_tiet, sp.thanh_phan,
      sp.cong_dung, sp.huong_dan_su_dung, sp.quy_cach, sp.xuat_xu, sp.anh_chinh_url,
      sp.gia_niem_yet, sp.gia_ban, (sp.so_luong_ton-sp.so_luong_giu_cho) AS so_luong_kha_dung,
      dm.ten_danh_muc, dm.duong_dan AS danh_muc_duong_dan,
      GROUP_CONCAT(asp.duong_dan_anh ORDER BY asp.thu_tu_hien_thi, asp.id SEPARATOR '||') AS gallery
    FROM san_pham sp
    INNER JOIN danh_muc_san_pham dm ON dm.id = sp.danh_muc_id
    LEFT JOIN anh_san_pham asp ON asp.san_pham_id = sp.id
    WHERE sp.trang_thai = 'DANG_BAN' AND dm.trang_thai = 'HOAT_DONG'
    GROUP BY sp.id, dm.id
    ORDER BY FIELD(
      sp.ma_san_pham,
      'COMBO-DD-3', 'SRM-DD-150', 'MN-DD-150', 'TONER-DD-150',
      'COMBO-DD-MINI', 'SERUM-DD-30', 'KEM-DD-50', 'TTRANG-DD-200'
    ), sp.id
  `);
  return rows;
}

export async function findActiveCategories() {
  const [rows] = await database.query(`
    SELECT id, ten_danh_muc, duong_dan
    FROM danh_muc_san_pham
    WHERE trang_thai = 'HOAT_DONG'
    ORDER BY thu_tu_hien_thi, id
  `);
  return rows;
}

export async function findActivePromotions() {
  const [rows] = await database.query(`
    SELECT ma_khuyen_mai, ten_khuyen_mai, mo_ta
    FROM khuyen_mai
    WHERE trang_thai = 'HOAT_DONG'
      AND ngay_bat_dau <= NOW()
      AND ngay_ket_thuc >= NOW()
    ORDER BY id
    LIMIT 4
  `);
  return rows;
}

export async function findApplicablePromotions(productId) {
  const [rows] = await database.query(`
    SELECT km.ma_khuyen_mai, km.ten_khuyen_mai, km.mo_ta
    FROM khuyen_mai km
    WHERE km.trang_thai = 'HOAT_DONG'
      AND km.ngay_bat_dau <= NOW()
      AND km.ngay_ket_thuc >= NOW()
      AND (
        NOT EXISTS (SELECT 1 FROM khuyen_mai_san_pham kmsp WHERE kmsp.khuyen_mai_id = km.id)
        OR EXISTS (
          SELECT 1 FROM khuyen_mai_san_pham kmsp
          WHERE kmsp.khuyen_mai_id = km.id AND kmsp.san_pham_id = ?
        )
      )
    ORDER BY km.id
    LIMIT 3
  `, [productId]);
  return rows;
}

export async function findStoreSettings() {
  const [rows] = await database.query(`
    SELECT ten_cua_hang, mo_ta, hotline, email, ten_phap_ly, email_ho_tro,
      google_maps_url, tien_to_don_hang, bat_cod, bat_chuyen_khoan, youtube_url,
      email_thong_bao, nguong_canh_bao_kho, gui_email_xac_nhan, che_do_bao_tri
    FROM cau_hinh_cua_hang
    ORDER BY id
    LIMIT 1
  `);
  return rows[0] ?? { ten_cua_hang: "Rubeanora", mo_ta: "", hotline: "", email: "" };
}

export async function findApprovedReviews(productId) {
  const [rows] = await database.query(`
    SELECT
      dg.id, dg.nguoi_dung_id, nd.ho_ten, dg.so_sao, dg.noi_dung,
      dg.phan_hoi_admin, dg.ngay_tao, dg.ngay_cap_nhat,
      dg.chi_tiet_don_hang_id
    FROM danh_gia dg
    INNER JOIN nguoi_dung nd ON nd.id = dg.nguoi_dung_id
    WHERE dg.san_pham_id = ? AND dg.trang_thai = 'DA_DUYET'
    ORDER BY dg.ngay_tao DESC, dg.id DESC
  `, [productId]);
  return rows;
}
