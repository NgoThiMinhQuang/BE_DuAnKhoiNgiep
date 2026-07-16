import { database } from "../config/database.js";

export async function findFeaturedProducts() {
  const [rows] = await database.query(`
    SELECT
      sp.id, sp.duong_dan AS slug, sp.ten_san_pham AS name,
      sp.mo_ta_ngan AS subtitle, sp.anh_chinh_url AS image,
      sp.gia_ban AS price, NULLIF(sp.gia_niem_yet, sp.gia_ban) AS originalPrice,
      CASE
        WHEN sp.gia_niem_yet > sp.gia_ban THEN CONCAT('TIẾT KIỆM ', ROUND((sp.gia_niem_yet - sp.gia_ban) * 100 / sp.gia_niem_yet), '%')
        WHEN sp.duong_dan = 'combo-duong-da-dau-do-mini' THEN 'TIỆN LỢI - DU LỊCH'
        ELSE NULL
      END AS discountTag,
      COALESCE(ROUND(AVG(CASE WHEN dg.trang_thai = 'DA_DUYET' THEN dg.so_sao END), 1), 5) AS ratingNum,
      COUNT(CASE WHEN dg.trang_thai = 'DA_DUYET' THEN 1 END) AS reviews
    FROM san_pham sp
    LEFT JOIN danh_gia dg ON dg.san_pham_id = sp.id
    WHERE sp.trang_thai = 'DANG_BAN' AND sp.la_noi_bat = 1
    GROUP BY sp.id
    ORDER BY FIELD(sp.ma_san_pham, 'SRM-DD-150', 'MN-DD-150', 'TONER-DD-150', 'COMBO-DD-3', 'COMBO-DD-MINI'), sp.id
    LIMIT 5
  `);
  return rows;
}

export async function findLatestArticles() {
  const [rows] = await database.query(`
    SELECT id, duong_dan AS slug, tieu_de AS title, tom_tat AS excerpt,
      anh_dai_dien_url AS image, DATE_FORMAT(ngay_dang, '%d/%m/%Y') AS date
    FROM bai_viet
    WHERE trang_thai = 'DA_DANG'
    ORDER BY la_noi_bat DESC, ngay_dang DESC
    LIMIT 4
  `);
  return rows;
}

export async function findFeaturedTestimonials() {
  const [rows] = await database.query(`
    SELECT dg.id, nd.ho_ten AS userName, nd.anh_dai_dien_url AS avatar,
      dg.so_sao AS rating, dg.noi_dung AS comment, sp.ten_san_pham AS productName,
      sp.anh_chinh_url AS productImage, sp.duong_dan AS productSlug
    FROM danh_gia dg
    INNER JOIN nguoi_dung nd ON nd.id = dg.nguoi_dung_id
    INNER JOIN san_pham sp ON sp.id = dg.san_pham_id
    WHERE dg.trang_thai = 'DA_DUYET'
      AND nd.anh_dai_dien_url IS NOT NULL
      AND dg.noi_dung IS NOT NULL
      AND dg.noi_dung <> 'Sản phẩm tốt, dịu nhẹ và dễ sử dụng.'
    ORDER BY dg.ngay_cap_nhat DESC, dg.id DESC
    LIMIT 9
  `);
  return rows;
}
