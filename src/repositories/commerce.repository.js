import { database } from "../config/database.js";

const productSelect = `
  SELECT sp.id, sp.ma_san_pham, sp.ma_sku, sp.ten_san_pham, sp.duong_dan,
    sp.loai_san_pham, sp.mo_ta_ngan, sp.mo_ta_chi_tiet, sp.thanh_phan,
    sp.cong_dung, sp.huong_dan_su_dung, sp.quy_cach, sp.xuat_xu,
    sp.anh_chinh_url, sp.gia_niem_yet, sp.gia_ban, sp.so_luong_ton,
    dm.ten_danh_muc, dm.duong_dan AS danh_muc_duong_dan
`;

export async function findCartByUserId(userId) {
  const [rows] = await database.execute(`
    ${productSelect}, ctgh.so_luong
    FROM gio_hang gh
    INNER JOIN chi_tiet_gio_hang ctgh ON ctgh.gio_hang_id=gh.id
    INNER JOIN san_pham sp ON sp.id=ctgh.san_pham_id
    INNER JOIN danh_muc_san_pham dm ON dm.id=sp.danh_muc_id
    WHERE gh.nguoi_dung_id=?
    ORDER BY ctgh.ngay_tao, ctgh.id
  `, [userId]);
  return rows;
}

export async function upsertCartItem(userId, productId, quantity) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [products] = await connection.execute(
      "SELECT id, so_luong_ton FROM san_pham WHERE id=? AND trang_thai='DANG_BAN' FOR UPDATE",
      [productId],
    );
    if (!products[0]) {
      await connection.rollback();
      return { status: "NOT_FOUND" };
    }
    await connection.execute("INSERT INTO gio_hang (nguoi_dung_id) VALUES (?) ON DUPLICATE KEY UPDATE ngay_cap_nhat=NOW()", [userId]);
    const [carts] = await connection.execute("SELECT id FROM gio_hang WHERE nguoi_dung_id=?", [userId]);
    const [current] = await connection.execute(
      "SELECT so_luong FROM chi_tiet_gio_hang WHERE gio_hang_id=? AND san_pham_id=? FOR UPDATE",
      [carts[0].id, productId],
    );
    const nextQuantity = (current[0]?.so_luong ?? 0) + quantity;
    if (nextQuantity > products[0].so_luong_ton) {
      await connection.rollback();
      return { status: "OUT_OF_STOCK", stock: products[0].so_luong_ton };
    }
    await connection.execute(`
      INSERT INTO chi_tiet_gio_hang (gio_hang_id, san_pham_id, so_luong) VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE so_luong=VALUES(so_luong), ngay_cap_nhat=NOW()
    `, [carts[0].id, productId, nextQuantity]);
    await connection.commit();
    return { status: "OK" };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function setCartItemQuantity(userId, productId, quantity) {
  const [result] = await database.execute(`
    UPDATE chi_tiet_gio_hang ctgh
    INNER JOIN gio_hang gh ON gh.id=ctgh.gio_hang_id
    INNER JOIN san_pham sp ON sp.id=ctgh.san_pham_id
    SET ctgh.so_luong=?, ctgh.ngay_cap_nhat=NOW()
    WHERE gh.nguoi_dung_id=? AND ctgh.san_pham_id=?
      AND sp.trang_thai='DANG_BAN' AND sp.so_luong_ton>=?
  `, [quantity, userId, productId, quantity]);
  return result.affectedRows > 0;
}

export async function deleteCartItem(userId, productId) {
  const [result] = await database.execute(`
    DELETE ctgh FROM chi_tiet_gio_hang ctgh
    INNER JOIN gio_hang gh ON gh.id=ctgh.gio_hang_id
    WHERE gh.nguoi_dung_id=? AND ctgh.san_pham_id=?
  `, [userId, productId]);
  return result.affectedRows > 0;
}

export async function findWishlistByUserId(userId) {
  const [rows] = await database.execute(`
    ${productSelect}
    FROM yeu_thich yt
    INNER JOIN san_pham sp ON sp.id=yt.san_pham_id
    INNER JOIN danh_muc_san_pham dm ON dm.id=sp.danh_muc_id
    WHERE yt.nguoi_dung_id=? AND sp.trang_thai='DANG_BAN'
    ORDER BY yt.ngay_tao DESC
  `, [userId]);
  return rows;
}

export async function insertWishlistItem(userId, productId) {
  const [products] = await database.execute("SELECT id FROM san_pham WHERE id=? AND trang_thai='DANG_BAN'", [productId]);
  if (!products[0]) return false;
  await database.execute("INSERT IGNORE INTO yeu_thich (nguoi_dung_id, san_pham_id) VALUES (?, ?)", [userId, productId]);
  return true;
}

export async function deleteWishlistItem(userId, productId) {
  const [result] = await database.execute("DELETE FROM yeu_thich WHERE nguoi_dung_id=? AND san_pham_id=?", [userId, productId]);
  return result.affectedRows > 0;
}
