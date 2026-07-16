import { database } from "../config/database.js";

export async function findOrdersByUserId(userId) {
  const [orders] = await database.execute(`
    SELECT * FROM don_hang WHERE nguoi_dung_id=? ORDER BY ngay_tao DESC
  `, [userId]);
  if (!orders.length) return { orders, items: [] };
  const ids = orders.map((order) => order.id);
  const [items] = await database.query(`
    SELECT ctdh.*, sp.quy_cach,
      EXISTS(SELECT 1 FROM danh_gia dg WHERE dg.chi_tiet_don_hang_id=ctdh.id) AS da_danh_gia
    FROM chi_tiet_don_hang ctdh
    LEFT JOIN san_pham sp ON sp.id=ctdh.san_pham_id
    WHERE ctdh.don_hang_id IN (?) ORDER BY ctdh.id
  `, [ids]);
  return { orders, items };
}

export async function cancelUserOrder(userId, orderId, reason) {
  const [result] = await database.execute(`
    UPDATE don_hang SET trang_thai_don_hang='DA_HUY', ly_do_huy=?
    WHERE id=? AND nguoi_dung_id=? AND trang_thai_don_hang='CHO_XAC_NHAN'
  `, [reason, orderId, userId]);
  return result.affectedRows > 0;
}

export async function findOrderForReview(userId, orderId) {
  const [rows] = await database.execute(`
    SELECT id FROM don_hang WHERE id=? AND nguoi_dung_id=? AND trang_thai_don_hang='DA_GIAO'
  `, [orderId, userId]);
  return rows[0] ?? null;
}

export async function findOrderDetails(orderId) {
  const [rows] = await database.execute("SELECT * FROM chi_tiet_don_hang WHERE don_hang_id=?", [orderId]);
  return rows;
}

export async function insertOrderReviews(userId, reviews) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    for (const review of reviews) {
      await connection.execute(`
        INSERT INTO danh_gia (nguoi_dung_id, san_pham_id, chi_tiet_don_hang_id, so_sao, noi_dung, trang_thai)
        VALUES (?, ?, ?, ?, ?, 'CHO_DUYET')
      `, [userId, review.productId, review.orderDetailId, review.rating, review.comment]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

export async function findReviewsByOrder(userId, orderId) {
  const [rows] = await database.execute(`
    SELECT dg.*, ctdh.don_hang_id
    FROM danh_gia dg
    INNER JOIN chi_tiet_don_hang ctdh ON ctdh.id=dg.chi_tiet_don_hang_id
    INNER JOIN don_hang dh ON dh.id=ctdh.don_hang_id
    WHERE dh.id=? AND dh.nguoi_dung_id=? AND dg.nguoi_dung_id=?
  `, [orderId, userId, userId]);
  return rows;
}
