import { database } from "../config/database.js";

const articleSelect = `
  SELECT bv.id, bv.tieu_de, bv.duong_dan, bv.tom_tat, bv.noi_dung,
    bv.anh_dai_dien_url, bv.chuyen_muc, bv.luot_xem,
    DATE_FORMAT(bv.ngay_dang, '%d/%m/%Y') AS ngay_dang,
    COALESCE(nd.ho_ten, ch.ten_cua_hang, 'Rubeanora') AS tac_gia
  FROM bai_viet bv
  LEFT JOIN nguoi_dung nd ON nd.id = bv.tac_gia_id
  LEFT JOIN (SELECT ten_cua_hang FROM cau_hinh_cua_hang ORDER BY id LIMIT 1) ch ON 1=1
`;

export async function findPublishedArticles() {
  const [rows] = await database.query(`${articleSelect}
    WHERE bv.trang_thai='DA_DANG'
    ORDER BY bv.ngay_dang DESC, bv.id DESC
  `);
  return rows;
}

export async function findPublishedArticleById(id) {
  const [rows] = await database.query(`${articleSelect}
    WHERE bv.id=? AND bv.trang_thai='DA_DANG'
    LIMIT 1
  `, [id]);
  return rows[0] ?? null;
}

export async function findRelatedArticles(id) {
  const [rows] = await database.query(`${articleSelect}
    WHERE bv.id<>? AND bv.trang_thai='DA_DANG'
    ORDER BY bv.la_noi_bat DESC, bv.ngay_dang DESC
    LIMIT 5
  `, [id]);
  return rows;
}

export async function increaseArticleViews(id) {
  await database.execute("UPDATE bai_viet SET luot_xem=luot_xem+1 WHERE id=?", [id]);
}

export async function findNewsStoreSettings() {
  const [rows] = await database.query(`
    SELECT ten_cua_hang, hotline, email
    FROM cau_hinh_cua_hang
    ORDER BY id
    LIMIT 1
  `);
  return rows[0] ?? { ten_cua_hang: "Rubeanora", hotline: "", email: "" };
}

export async function insertArticleComment({ articleId, name, email, content }) {
  const [result] = await database.execute(`
    INSERT INTO binh_luan_bai_viet (bai_viet_id, ho_ten, email, noi_dung)
    VALUES (?, ?, ?, ?)
  `, [articleId, name, email, content]);
  return result.insertId;
}
