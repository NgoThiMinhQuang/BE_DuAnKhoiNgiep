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

export async function findCheckoutContext(userId, productIds) {
  if (!productIds.length) return { items: [], promotions: [], settings: null };
  const [items] = await database.query(`
    SELECT sp.id, sp.ma_san_pham, sp.ten_san_pham, sp.anh_chinh_url, sp.quy_cach,
      sp.gia_ban, sp.so_luong_ton, sp.trang_thai, ctgh.so_luong
    FROM gio_hang gh
    INNER JOIN chi_tiet_gio_hang ctgh ON ctgh.gio_hang_id=gh.id
    INNER JOIN san_pham sp ON sp.id=ctgh.san_pham_id
    WHERE gh.nguoi_dung_id=? AND ctgh.san_pham_id IN (?)
    ORDER BY ctgh.id
  `, [userId, productIds]);
  const [promotions] = await database.query(`
    SELECT km.*,
      GROUP_CONCAT(kmsp.san_pham_id ORDER BY kmsp.san_pham_id) AS san_pham_ids
    FROM khuyen_mai km
    LEFT JOIN khuyen_mai_san_pham kmsp ON kmsp.khuyen_mai_id=km.id
    WHERE km.trang_thai='HOAT_DONG' AND km.ngay_bat_dau<=NOW() AND km.ngay_ket_thuc>=NOW()
      AND (km.so_luot_su_dung_toi_da IS NULL OR km.so_luot_da_su_dung<km.so_luot_su_dung_toi_da)
    GROUP BY km.id ORDER BY km.id
  `);
  const [settings] = await database.query("SELECT phi_van_chuyen, nguong_mien_phi_van_chuyen FROM cau_hinh_cua_hang ORDER BY id LIMIT 1");
  return { items, promotions, settings: settings[0] ?? { phi_van_chuyen: 0, nguong_mien_phi_van_chuyen: 0 } };
}

export async function createOrderInTransaction(userId, productIds, input, calculate) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [items] = await connection.query(`
      SELECT sp.id, sp.ma_san_pham, sp.ten_san_pham, sp.anh_chinh_url, sp.quy_cach,
        sp.gia_ban, sp.so_luong_ton, sp.trang_thai, ctgh.so_luong, gh.id AS gio_hang_id
      FROM gio_hang gh
      INNER JOIN chi_tiet_gio_hang ctgh ON ctgh.gio_hang_id=gh.id
      INNER JOIN san_pham sp ON sp.id=ctgh.san_pham_id
      WHERE gh.nguoi_dung_id=? AND ctgh.san_pham_id IN (?) FOR UPDATE
    `, [userId, productIds]);
    const [promotions] = await connection.query(`
      SELECT km.*, GROUP_CONCAT(kmsp.san_pham_id ORDER BY kmsp.san_pham_id) AS san_pham_ids
      FROM khuyen_mai km LEFT JOIN khuyen_mai_san_pham kmsp ON kmsp.khuyen_mai_id=km.id
      WHERE km.trang_thai='HOAT_DONG' AND km.ngay_bat_dau<=NOW() AND km.ngay_ket_thuc>=NOW()
        AND (km.so_luot_su_dung_toi_da IS NULL OR km.so_luot_da_su_dung<km.so_luot_su_dung_toi_da)
      GROUP BY km.id FOR UPDATE
    `);
    const [settings] = await connection.query("SELECT phi_van_chuyen, nguong_mien_phi_van_chuyen FROM cau_hinh_cua_hang ORDER BY id LIMIT 1");
    const summary = calculate({ items, promotions, settings: settings[0] ?? { phi_van_chuyen: 0, nguong_mien_phi_van_chuyen: 0 } });

    let address = null;
    if (input.addressId) {
      const [addresses] = await connection.execute("SELECT * FROM dia_chi_nguoi_dung WHERE id=? AND nguoi_dung_id=?", [input.addressId, userId]);
      address = addresses[0] ?? null;
    }
    const shipping = address ? {
      name: address.ten_nguoi_nhan, phone: address.so_dien_thoai,
      province: address.tinh_thanh, district: address.quan_huyen, ward: address.phuong_xa, detail: address.dia_chi_chi_tiet,
    } : {
      name: input.recipientName, phone: input.phone, province: "", district: "", ward: "", detail: input.shippingAddress,
    };
    const orderCode = `RBB-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const [orderResult] = await connection.execute(`
      INSERT INTO don_hang (
        ma_don_hang, nguoi_dung_id, khuyen_mai_id, ten_nguoi_nhan, so_dien_thoai, email,
        tinh_thanh, quan_huyen, phuong_xa, dia_chi_chi_tiet,
        tong_tien_hang, tien_giam, phi_van_chuyen, tong_thanh_toan,
        phuong_thuc_thanh_toan, trang_thai_thanh_toan, trang_thai_don_hang, ghi_chu_khach_hang
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CHUA_THANH_TOAN', 'CHO_XAC_NHAN', ?)
    `, [
      orderCode, userId, summary.promotion?.id ?? null, shipping.name, shipping.phone, input.email ?? null,
      shipping.province, shipping.district, shipping.ward, shipping.detail,
      summary.subtotal, summary.discountAmount, summary.shippingFee, summary.totalPayment,
      input.paymentMethod, input.customerNote || null,
    ]);
    for (const item of items) {
      await connection.execute(`
        INSERT INTO chi_tiet_don_hang (
          don_hang_id, san_pham_id, ma_san_pham, ten_san_pham, anh_san_pham_url, so_luong, don_gia, thanh_tien
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [orderResult.insertId, item.id, item.ma_san_pham, item.ten_san_pham, item.anh_chinh_url, item.so_luong, item.gia_ban, item.gia_ban * item.so_luong]);
      await connection.execute("UPDATE san_pham SET so_luong_ton=so_luong_ton-? WHERE id=?", [item.so_luong, item.id]);
    }
    await connection.query(`
      DELETE ctgh FROM chi_tiet_gio_hang ctgh
      INNER JOIN gio_hang gh ON gh.id=ctgh.gio_hang_id
      WHERE gh.nguoi_dung_id=? AND ctgh.san_pham_id IN (?)
    `, [userId, productIds]);
    if (summary.promotion) await connection.execute("UPDATE khuyen_mai SET so_luot_da_su_dung=so_luot_da_su_dung+1 WHERE id=?", [summary.promotion.id]);
    await connection.commit();
    return { id: orderResult.insertId, orderCode, summary };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
