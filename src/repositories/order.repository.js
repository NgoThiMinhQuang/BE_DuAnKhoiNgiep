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
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.execute(`
      SELECT id, khuyen_mai_id
      FROM don_hang
      WHERE id=? AND nguoi_dung_id=?
        AND trang_thai_don_hang='CHO_XAC_NHAN'
        AND trang_thai_thanh_toan='CHUA_THANH_TOAN'
      FOR UPDATE
    `, [orderId, userId]);
    const order = orders[0];
    if (!order) {
      await connection.rollback();
      return false;
    }

    const [items] = await connection.execute(`
      SELECT san_pham_id, so_luong
      FROM chi_tiet_don_hang
      WHERE don_hang_id=? AND san_pham_id IS NOT NULL
      FOR UPDATE
    `, [order.id]);

    await connection.execute(`
      UPDATE don_hang
      SET trang_thai_don_hang='DA_HUY', ly_do_huy=?
      WHERE id=?
    `, [reason, order.id]);

    await connection.execute(`
      UPDATE giao_dich_thanh_toan
      SET trang_thai='DA_HUY'
      WHERE don_hang_id=? AND trang_thai='CHO_THANH_TOAN'
    `, [order.id]);

    for (const item of items) {
      await connection.execute(
        "UPDATE san_pham SET so_luong_giu_cho=GREATEST(so_luong_giu_cho-?, 0) WHERE id=?",
        [item.so_luong, item.san_pham_id],
      );
    }

    await connection.execute(`
      UPDATE phieu_xuat
      SET trang_thai='DA_HUY', ghi_chu=CONCAT_WS('\n', ghi_chu, ?)
      WHERE don_hang_id=? AND loai_xuat='BAN_HANG' AND trang_thai<>'DA_HUY'
    `, [`Hủy theo đơn hàng: ${reason}`, order.id]);

      if (order.khuyen_mai_id) {
        await connection.execute("DELETE FROM lich_su_su_dung_khuyen_mai WHERE don_hang_id=?", [order.id]);
      await connection.execute(`
        UPDATE khuyen_mai
        SET so_luot_da_su_dung=GREATEST(so_luot_da_su_dung-1, 0)
        WHERE id=?
      `, [order.khuyen_mai_id]);
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
      sp.gia_ban, (sp.so_luong_ton-sp.so_luong_giu_cho) AS so_luong_ton, sp.trang_thai, ctgh.so_luong
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
      AND (SELECT COUNT(*) FROM lich_su_su_dung_khuyen_mai ls WHERE ls.khuyen_mai_id=km.id AND ls.nguoi_dung_id=?) < km.so_luot_toi_da_moi_khach
    GROUP BY km.id ORDER BY km.id
  `, [userId]);
  const [settings] = await database.query("SELECT phi_van_chuyen, nguong_mien_phi_van_chuyen FROM cau_hinh_cua_hang ORDER BY id LIMIT 1");
  return { items, promotions, settings: settings[0] ?? { phi_van_chuyen: 0, nguong_mien_phi_van_chuyen: 0 } };
}

export async function createOrderInTransaction(userId, productIds, input, calculate) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [customers] = await connection.execute(
      "SELECT ho_ten, email FROM nguoi_dung WHERE id=? LIMIT 1",
      [userId],
    );
    const customer = customers[0] ?? null;
    const [items] = await connection.query(`
      SELECT sp.id, sp.ma_san_pham, sp.ten_san_pham, sp.anh_chinh_url, sp.quy_cach,
        sp.gia_ban, (sp.so_luong_ton-sp.so_luong_giu_cho) AS so_luong_ton, sp.trang_thai, ctgh.so_luong, gh.id AS gio_hang_id
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
        AND (SELECT COUNT(*) FROM lich_su_su_dung_khuyen_mai ls WHERE ls.khuyen_mai_id=km.id AND ls.nguoi_dung_id=?) < km.so_luot_toi_da_moi_khach
      GROUP BY km.id FOR UPDATE
    `, [userId]);
    const [settings] = await connection.query("SELECT * FROM cau_hinh_cua_hang ORDER BY id LIMIT 1 FOR UPDATE");
    const storeSettings = settings[0] ?? { phi_van_chuyen: 0, nguong_mien_phi_van_chuyen: 0, tien_to_don_hang: "RBB", bat_cod: 1, bat_chuyen_khoan: 1, che_do_bao_tri: 0 };
    if (storeSettings.che_do_bao_tri) { const error = new Error("Cửa hàng đang bảo trì"); error.statusCode = 503; throw error; }
    if ((input.paymentMethod === "COD" && !storeSettings.bat_cod) || (input.paymentMethod === "CHUYEN_KHOAN" && !storeSettings.bat_chuyen_khoan)) {
      const error = new Error("Phương thức thanh toán hiện đang tạm tắt"); error.statusCode = 409; throw error;
    }
    const summary = calculate({ items, promotions, settings: storeSettings });

    let address = null;
    if (input.addressId) {
      const [addresses] = await connection.execute("SELECT * FROM dia_chi_nguoi_dung WHERE id=? AND nguoi_dung_id=?", [input.addressId, userId]);
      address = addresses[0] ?? null;
    }
    const shipping = address ? {
      name: address.ten_nguoi_nhan, phone: address.so_dien_thoai,
      province: address.tinh_thanh, district: address.quan_huyen, ward: address.phuong_xa, detail: address.dia_chi_chi_tiet,
    } : {
      name: input.recipientName, phone: input.phone,
      province: input.provinceName ?? "", provinceCode: input.provinceCode ?? null,
      district: "", ward: input.wardName ?? "", wardCode: input.wardCode ?? null,
      detail: input.detail ?? input.shippingAddress,
    };
    const prefix = String(storeSettings.tien_to_don_hang || "RBB").replace(/[^A-Z0-9]/gi, "").slice(0, 8) || "RBB";
    const orderCode = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const [orderResult] = await connection.execute(`
      INSERT INTO don_hang (
        ma_don_hang, nguoi_dung_id, khuyen_mai_id, ten_nguoi_nhan, so_dien_thoai, email,
        tinh_thanh, tinh_thanh_ma, quan_huyen, phuong_xa, phuong_xa_ma, dia_chi_chi_tiet,
        tong_tien_hang, tien_giam, phi_van_chuyen, tong_thanh_toan,
        phuong_thuc_thanh_toan, trang_thai_thanh_toan, trang_thai_don_hang, ghi_chu_khach_hang
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CHUA_THANH_TOAN', 'CHO_XAC_NHAN', ?)
    `, [
      orderCode, userId, summary.promotion?.id ?? null, shipping.name, shipping.phone, customer?.email ?? null,
      shipping.province, shipping.provinceCode ?? null, shipping.district, shipping.ward, shipping.wardCode ?? null, shipping.detail,
      summary.subtotal, summary.discountAmount, summary.shippingFee, summary.totalPayment,
      input.paymentMethod, input.customerNote || null,
    ]);
    if (input.paymentMethod === "CHUYEN_KHOAN") {
      await connection.execute(`
        INSERT INTO giao_dich_thanh_toan (
          don_hang_id, nha_cung_cap, ma_thanh_toan, so_tien, trang_thai, het_han_luc
        ) VALUES (?, 'SEPAY', ?, ?, 'CHO_THANH_TOAN', DATE_ADD(NOW(), INTERVAL 30 MINUTE))
      `, [orderResult.insertId, input.paymentCode, summary.totalPayment]);
    }
    for (const item of items) {
      await connection.execute(`
        INSERT INTO chi_tiet_don_hang (
          don_hang_id, san_pham_id, ma_san_pham, ten_san_pham, anh_san_pham_url, so_luong, don_gia, thanh_tien
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [orderResult.insertId, item.id, item.ma_san_pham, item.ten_san_pham, item.anh_chinh_url, item.so_luong, item.gia_ban, item.gia_ban * item.so_luong]);
      const [stockResult] = await connection.execute(`
        UPDATE san_pham
        SET so_luong_giu_cho=so_luong_giu_cho+?
        WHERE id=? AND trang_thai='DANG_BAN' AND (so_luong_ton-so_luong_giu_cho)>=?
      `, [item.so_luong, item.id, item.so_luong]);
      if (!stockResult.affectedRows) {
        const error = new Error(`${item.ten_san_pham} không đủ tồn kho`);
        error.statusCode = 409;
        throw error;
      }
    }

    await connection.query(`
      DELETE ctgh FROM chi_tiet_gio_hang ctgh
      INNER JOIN gio_hang gh ON gh.id=ctgh.gio_hang_id
      WHERE gh.nguoi_dung_id=? AND ctgh.san_pham_id IN (?)
    `, [userId, productIds]);
    if (summary.promotion) {
      await connection.execute("UPDATE khuyen_mai SET so_luot_da_su_dung=so_luot_da_su_dung+1 WHERE id=?", [summary.promotion.id]);
      await connection.execute("INSERT INTO lich_su_su_dung_khuyen_mai (khuyen_mai_id, nguoi_dung_id, don_hang_id) VALUES (?, ?, ?)", [summary.promotion.id, userId, orderResult.insertId]);
    }
    await connection.commit();
    return {
      id: orderResult.insertId,
      orderCode,
      summary,
      emailContext: {
        customerEmail: customer?.email ?? null,
        customerName: customer?.ho_ten || shipping.name,
        adminEmail: storeSettings.email_thong_bao ?? null,
        sendCustomerConfirmation: Boolean(storeSettings.gui_email_xac_nhan),
        storeName: storeSettings.ten_cua_hang || "Rubeanora",
        paymentMethod: input.paymentMethod,
        items: items.map((item) => ({
          name: item.ten_san_pham,
          quantity: Number(item.so_luong),
          price: Number(item.gia_ban),
        })),
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
