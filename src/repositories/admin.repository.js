import { database } from "../config/database.js";

const dashboardPeriods = {
  week: {
    orderCurrent: "dh.ngay_tao >= CURDATE() - INTERVAL 6 DAY AND dh.ngay_tao < CURDATE() + INTERVAL 1 DAY",
    orderPrevious: "dh.ngay_tao >= CURDATE() - INTERVAL 13 DAY AND dh.ngay_tao < CURDATE() - INTERVAL 6 DAY",
    userCurrent: "nd.ngay_tao >= CURDATE() - INTERVAL 6 DAY AND nd.ngay_tao < CURDATE() + INTERVAL 1 DAY",
    userPrevious: "nd.ngay_tao >= CURDATE() - INTERVAL 13 DAY AND nd.ngay_tao < CURDATE() - INTERVAL 6 DAY",
    bucket: "DATEDIFF(DATE(dh.ngay_tao), CURDATE() - INTERVAL 6 DAY) + 1",
  },
  month: {
    orderCurrent: "dh.ngay_tao >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND dh.ngay_tao < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')",
    orderPrevious: "dh.ngay_tao >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01') AND dh.ngay_tao < DATE_FORMAT(CURDATE(), '%Y-%m-01')",
    userCurrent: "nd.ngay_tao >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND nd.ngay_tao < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')",
    userPrevious: "nd.ngay_tao >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01') AND nd.ngay_tao < DATE_FORMAT(CURDATE(), '%Y-%m-01')",
    bucket: "FLOOR((DAY(dh.ngay_tao) - 1) / 7) + 1",
  },
  quarter: {
    orderCurrent: "dh.ngay_tao >= MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL (QUARTER(CURDATE()) - 1) QUARTER AND dh.ngay_tao < MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL QUARTER(CURDATE()) QUARTER",
    orderPrevious: "dh.ngay_tao >= MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL (QUARTER(CURDATE()) - 2) QUARTER AND dh.ngay_tao < MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL (QUARTER(CURDATE()) - 1) QUARTER",
    userCurrent: "nd.ngay_tao >= MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL (QUARTER(CURDATE()) - 1) QUARTER AND nd.ngay_tao < MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL QUARTER(CURDATE()) QUARTER",
    userPrevious: "nd.ngay_tao >= MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL (QUARTER(CURDATE()) - 2) QUARTER AND nd.ngay_tao < MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL (QUARTER(CURDATE()) - 1) QUARTER",
    bucket: "MONTH(dh.ngay_tao) - ((QUARTER(CURDATE()) - 1) * 3)",
  },
  year: {
    orderCurrent: "YEAR(dh.ngay_tao) = YEAR(CURDATE())",
    orderPrevious: "YEAR(dh.ngay_tao) = YEAR(CURDATE()) - 1",
    userCurrent: "YEAR(nd.ngay_tao) = YEAR(CURDATE())",
    userPrevious: "YEAR(nd.ngay_tao) = YEAR(CURDATE()) - 1",
    bucket: "QUARTER(dh.ngay_tao)",
  },
};

async function findDashboardPeriodData(period) {
  const definition = dashboardPeriods[period];
  const statsQuery = (orderCondition, userCondition) => `
    SELECT
      (SELECT COALESCE(SUM(dh.tong_thanh_toan), 0) FROM don_hang dh
        WHERE ${orderCondition} AND dh.trang_thai_don_hang='DA_GIAO') AS revenue,
      (SELECT COUNT(*) FROM don_hang dh WHERE ${orderCondition}) AS orders,
      (SELECT COUNT(*) FROM nguoi_dung nd
        WHERE ${userCondition} AND nd.vai_tro='KHACH_HANG') AS customers,
      (SELECT COALESCE(SUM(ctdh.so_luong), 0)
        FROM chi_tiet_don_hang ctdh
        INNER JOIN don_hang dh ON dh.id=ctdh.don_hang_id
        WHERE ${orderCondition} AND dh.trang_thai_don_hang='DA_GIAO') AS units_sold
  `;

  const [
    [currentRows],
    [previousRows],
    [revenueSeries],
    [orderStatusRows],
    [bestSellingProducts],
    [recentOrders],
  ] = await Promise.all([
    database.query(statsQuery(definition.orderCurrent, definition.userCurrent)),
    database.query(statsQuery(definition.orderPrevious, definition.userPrevious)),
    database.query(`
      SELECT ${definition.bucket} AS bucket, COALESCE(SUM(dh.tong_thanh_toan), 0) AS revenue
      FROM don_hang dh
      WHERE ${definition.orderCurrent} AND dh.trang_thai_don_hang='DA_GIAO'
      GROUP BY bucket
      ORDER BY bucket
    `),
    database.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(dh.trang_thai_don_hang='DA_GIAO'), 0) AS completed,
        COALESCE(SUM(dh.trang_thai_don_hang IN ('DA_XAC_NHAN', 'DANG_CHUAN_BI', 'DANG_GIAO')), 0) AS processing,
        COALESCE(SUM(dh.trang_thai_don_hang='CHO_XAC_NHAN'), 0) AS pending,
        COALESCE(SUM(dh.trang_thai_don_hang='DA_HUY'), 0) AS cancelled
      FROM don_hang dh
      WHERE ${definition.orderCurrent}
    `),
    database.query(`
      SELECT ctdh.san_pham_id AS id,
        COALESCE(MAX(sp.ten_san_pham), MAX(ctdh.ten_san_pham)) AS name,
        COALESCE(SUM(ctdh.so_luong), 0) AS sold
      FROM chi_tiet_don_hang ctdh
      INNER JOIN don_hang dh ON dh.id=ctdh.don_hang_id
      LEFT JOIN san_pham sp ON sp.id=ctdh.san_pham_id
      WHERE ${definition.orderCurrent} AND dh.trang_thai_don_hang='DA_GIAO'
      GROUP BY ctdh.san_pham_id
      ORDER BY sold DESC, name
      LIMIT 5
    `),
    database.query(`
      SELECT dh.*, nd.ho_ten AS ten_khach_hang
      FROM don_hang dh
      INNER JOIN nguoi_dung nd ON nd.id=dh.nguoi_dung_id
      WHERE ${definition.orderCurrent}
      ORDER BY dh.ngay_tao DESC
      LIMIT 5
    `),
  ]);

  return {
    current: currentRows[0],
    previous: previousRows[0],
    revenueSeries,
    orderStatus: orderStatusRows[0],
    bestSellingProducts,
    recentOrders,
  };
}

export async function findDashboardData() {
  const [[summary], [recentOrders], [lowStock], periodEntries] = await Promise.all([
    database.query(`
      SELECT
        (SELECT COUNT(*) FROM don_hang) AS total_orders,
        (SELECT COUNT(*) FROM don_hang WHERE trang_thai_don_hang='CHO_XAC_NHAN') AS pending_orders,
        (SELECT COALESCE(SUM(tong_thanh_toan), 0) FROM don_hang
          WHERE trang_thai_don_hang='DA_GIAO'
            AND YEAR(ngay_tao)=YEAR(CURDATE()) AND MONTH(ngay_tao)=MONTH(CURDATE())) AS monthly_revenue,
        (SELECT COUNT(*) FROM nguoi_dung WHERE vai_tro='KHACH_HANG') AS customers,
        (SELECT COUNT(*) FROM san_pham WHERE so_luong_ton<=ton_toi_thieu) AS low_stock_products,
        (SELECT COUNT(*) FROM danh_gia WHERE trang_thai='CHO_DUYET') AS pending_reviews,
        (SELECT COUNT(*) FROM lien_he WHERE trang_thai='MOI') AS new_contacts
    `),
    database.query(`
      SELECT id, ma_don_hang, ten_nguoi_nhan, tong_thanh_toan,
        trang_thai_don_hang, trang_thai_thanh_toan, ngay_tao
      FROM don_hang ORDER BY ngay_tao DESC LIMIT 8
    `),
    database.query(`
      SELECT id, ma_san_pham, ma_sku, ten_san_pham, so_luong_ton, ton_toi_thieu
      FROM san_pham
      WHERE so_luong_ton<=ton_toi_thieu
      ORDER BY so_luong_ton ASC, id LIMIT 8
    `),
    Promise.all(Object.keys(dashboardPeriods).map(async (period) => [
      period,
      await findDashboardPeriodData(period),
    ])),
  ]);
  return { summary: summary[0], recentOrders, lowStock, periods: Object.fromEntries(periodEntries) };
}

export async function findAdminOrders({ status, paymentStatus, search, limit, offset }) {
  const conditions = ["1=1"];
  const values = [];
  if (status) { conditions.push("dh.trang_thai_don_hang=?"); values.push(status); }
  if (paymentStatus) { conditions.push("dh.trang_thai_thanh_toan=?"); values.push(paymentStatus); }
  if (search) {
    conditions.push("(dh.ma_don_hang LIKE ? OR dh.ten_nguoi_nhan LIKE ? OR dh.so_dien_thoai LIKE ?)");
    const pattern = `%${search}%`;
    values.push(pattern, pattern, pattern);
  }
  const where = conditions.join(" AND ");
  const [countRows] = await database.execute(`SELECT COUNT(*) AS total FROM don_hang dh WHERE ${where}`, values);
  const [rows] = await database.query(`
    SELECT dh.*, nd.ho_ten AS ten_khach_hang,
      COUNT(ctdh.id) AS so_dong_san_pham,
      COALESCE(SUM(ctdh.so_luong), 0) AS tong_so_luong
    FROM don_hang dh
    INNER JOIN nguoi_dung nd ON nd.id=dh.nguoi_dung_id
    LEFT JOIN chi_tiet_don_hang ctdh ON ctdh.don_hang_id=dh.id
    WHERE ${where}
    GROUP BY dh.id, nd.id
    ORDER BY dh.ngay_tao DESC
    LIMIT ? OFFSET ?
  `, [...values, limit, offset]);
  return { rows, total: Number(countRows[0].total) };
}

export async function findAdminOrderById(orderId) {
  const [orders] = await database.execute(`
    SELECT dh.*, nd.ho_ten AS ten_khach_hang, nd.email AS email_khach_hang
    FROM don_hang dh
    INNER JOIN nguoi_dung nd ON nd.id=dh.nguoi_dung_id
    WHERE dh.id=? LIMIT 1
  `, [orderId]);
  if (!orders[0]) return null;
  const [items] = await database.execute(`
    SELECT * FROM chi_tiet_don_hang WHERE don_hang_id=? ORDER BY id
  `, [orderId]);
  const [exports] = await database.execute(`
    SELECT id, ma_phieu_xuat, loai_xuat, trang_thai, ngay_xuat
    FROM phieu_xuat WHERE don_hang_id=? ORDER BY id
  `, [orderId]);
  return { order: orders[0], items, exports };
}

export async function updateAdminOrderInTransaction(orderId, changes) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute("SELECT * FROM don_hang WHERE id=? FOR UPDATE", [orderId]);
    const order = rows[0];
    if (!order) {
      await connection.rollback();
      return false;
    }

    const nextStatus = changes.orderStatus ?? order.trang_thai_don_hang;
    if (nextStatus === "DA_HUY" && order.trang_thai_don_hang !== "DA_HUY") {
      const [items] = await connection.execute(`
        SELECT san_pham_id, so_luong FROM chi_tiet_don_hang
        WHERE don_hang_id=? AND san_pham_id IS NOT NULL FOR UPDATE
      `, [order.id]);
      for (const item of items) {
        await connection.execute(
          "UPDATE san_pham SET so_luong_ton=so_luong_ton+? WHERE id=?",
          [item.so_luong, item.san_pham_id],
        );
      }
      await connection.execute(`
        UPDATE phieu_xuat SET trang_thai='DA_HUY'
        WHERE don_hang_id=? AND loai_xuat='BAN_HANG' AND trang_thai<>'DA_HUY'
      `, [order.id]);
      if (order.khuyen_mai_id) {
        await connection.execute(`
          UPDATE khuyen_mai
          SET so_luot_da_su_dung=GREATEST(so_luot_da_su_dung-1, 0)
          WHERE id=?
        `, [order.khuyen_mai_id]);
      }
    }

    await connection.execute(`
      UPDATE don_hang SET
        trang_thai_don_hang=?, trang_thai_thanh_toan=?,
        ghi_chu_admin=?, ly_do_huy=?, don_vi_van_chuyen=?, ma_van_don=?
      WHERE id=?
    `, [
      nextStatus,
      changes.paymentStatus ?? order.trang_thai_thanh_toan,
      changes.adminNote ?? order.ghi_chu_admin,
      changes.cancelReason ?? order.ly_do_huy,
      changes.shippingProvider ?? order.don_vi_van_chuyen,
      changes.trackingCode ?? order.ma_van_don,
      order.id,
    ]);
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function findAdminUsers({ role, status, search, limit, offset }) {
  const conditions = ["1=1"];
  const values = [];
  if (role) { conditions.push("nd.vai_tro=?"); values.push(role); }
  if (status) { conditions.push("nd.trang_thai=?"); values.push(status); }
  if (search) {
    conditions.push("(nd.ho_ten LIKE ? OR nd.email LIKE ? OR nd.so_dien_thoai LIKE ?)");
    const pattern = `%${search}%`;
    values.push(pattern, pattern, pattern);
  }
  const where = conditions.join(" AND ");
  const [countRows] = await database.execute(`SELECT COUNT(*) AS total FROM nguoi_dung nd WHERE ${where}`, values);
  const [rows] = await database.query(`
    SELECT nd.id, nd.ho_ten, nd.email, nd.so_dien_thoai, nd.anh_dai_dien_url,
      nd.vai_tro, nd.trang_thai, nd.ngay_tao,
      COUNT(dh.id) AS so_don_hang,
      COALESCE(SUM(CASE WHEN dh.trang_thai_don_hang='DA_GIAO' THEN dh.tong_thanh_toan ELSE 0 END), 0) AS tong_chi_tieu
    FROM nguoi_dung nd
    LEFT JOIN don_hang dh ON dh.nguoi_dung_id=nd.id
    WHERE ${where}
    GROUP BY nd.id
    ORDER BY nd.ngay_tao DESC
    LIMIT ? OFFSET ?
  `, [...values, limit, offset]);
  return { rows, total: Number(countRows[0].total) };
}

export async function updateAdminUser(userId, changes) {
  const [result] = await database.execute(`
    UPDATE nguoi_dung
    SET vai_tro=COALESCE(?, vai_tro), trang_thai=COALESCE(?, trang_thai)
    WHERE id=?
  `, [changes.role ?? null, changes.status ?? null, userId]);
  return result.affectedRows > 0;
}

export async function findAdminReviews({ status, limit, offset }) {
  const where = status ? "WHERE dg.trang_thai=?" : "";
  const values = status ? [status] : [];
  const [countRows] = await database.execute(`SELECT COUNT(*) AS total FROM danh_gia dg ${where}`, values);
  const [rows] = await database.query(`
    SELECT dg.*, nd.ho_ten, nd.email, sp.ten_san_pham, sp.ma_san_pham
    FROM danh_gia dg
    INNER JOIN nguoi_dung nd ON nd.id=dg.nguoi_dung_id
    INNER JOIN san_pham sp ON sp.id=dg.san_pham_id
    ${where}
    ORDER BY dg.ngay_tao DESC
    LIMIT ? OFFSET ?
  `, [...values, limit, offset]);
  return { rows, total: Number(countRows[0].total) };
}

export async function updateAdminReview(reviewId, changes) {
  const [result] = await database.execute(`
    UPDATE danh_gia
    SET trang_thai=COALESCE(?, trang_thai),
      phan_hoi_admin=COALESCE(?, phan_hoi_admin)
    WHERE id=?
  `, [changes.status ?? null, changes.reply ?? null, reviewId]);
  return result.affectedRows > 0;
}

export async function findAdminContacts({ status, limit, offset }) {
  const where = status ? "WHERE lh.trang_thai=?" : "";
  const values = status ? [status] : [];
  const [countRows] = await database.execute(`SELECT COUNT(*) AS total FROM lien_he lh ${where}`, values);
  const [rows] = await database.query(`
    SELECT lh.*, nd.ho_ten AS nguoi_xu_ly
    FROM lien_he lh
    LEFT JOIN nguoi_dung nd ON nd.id=lh.nguoi_xu_ly_id
    ${where}
    ORDER BY lh.ngay_tao DESC
    LIMIT ? OFFSET ?
  `, [...values, limit, offset]);
  return { rows, total: Number(countRows[0].total) };
}

export async function updateAdminContact(contactId, adminId, changes) {
  const [result] = await database.execute(`
    UPDATE lien_he
    SET trang_thai=COALESCE(?, trang_thai),
      ghi_chu_admin=COALESCE(?, ghi_chu_admin), nguoi_xu_ly_id=?
    WHERE id=?
  `, [changes.status ?? null, changes.adminNote ?? null, adminId, contactId]);
  return result.affectedRows > 0;
}

export async function findAdminSettings() {
  const [rows] = await database.query("SELECT * FROM cau_hinh_cua_hang ORDER BY id LIMIT 1");
  return rows[0] ?? null;
}

export async function updateAdminSettings(changes) {
  const rows = await findAdminSettings();
  if (!rows) return false;
  await database.execute(`
    UPDATE cau_hinh_cua_hang SET
      ten_cua_hang=?, logo_url=?, mo_ta=?, hotline=?, email=?, dia_chi=?,
      gio_lam_viec=?, phi_van_chuyen=?, nguong_mien_phi_van_chuyen=?,
      facebook_url=?, instagram_url=?, tiktok_url=?
    WHERE id=?
  `, [
    changes.storeName ?? rows.ten_cua_hang,
    changes.logoUrl ?? rows.logo_url,
    changes.description ?? rows.mo_ta,
    changes.hotline ?? rows.hotline,
    changes.email ?? rows.email,
    changes.address ?? rows.dia_chi,
    changes.workingHours ?? rows.gio_lam_viec,
    changes.shippingFee ?? rows.phi_van_chuyen,
    changes.freeShippingThreshold ?? rows.nguong_mien_phi_van_chuyen,
    changes.facebookUrl ?? rows.facebook_url,
    changes.instagramUrl ?? rows.instagram_url,
    changes.tiktokUrl ?? rows.tiktok_url,
    rows.id,
  ]);
  return true;
}

export async function findAdminProducts() {
  const [rows] = await database.query(`
    SELECT sp.*, dm.ten_danh_muc,
      GROUP_CONCAT(asp.duong_dan_anh ORDER BY asp.thu_tu_hien_thi, asp.id SEPARATOR '||') AS gallery
    FROM san_pham sp
    INNER JOIN danh_muc_san_pham dm ON dm.id=sp.danh_muc_id
    LEFT JOIN anh_san_pham asp ON asp.san_pham_id=sp.id
    GROUP BY sp.id, dm.id
    ORDER BY sp.ngay_cap_nhat DESC, sp.id DESC
  `);
  return rows;
}

async function replaceProductImages(connection, productId, images) {
  await connection.execute("DELETE FROM anh_san_pham WHERE san_pham_id=?", [productId]);
  for (const [index, image] of images.entries()) {
    await connection.execute(`
      INSERT INTO anh_san_pham (san_pham_id, duong_dan_anh, alt_text, thu_tu_hien_thi)
      VALUES (?, ?, ?, ?)
    `, [productId, image.url, image.altText || null, image.order ?? index + 1]);
  }
}

export async function createAdminProduct(input) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(`
      INSERT INTO san_pham (
        danh_muc_id, ma_san_pham, ma_sku, ten_san_pham, duong_dan,
        loai_san_pham, mo_ta_ngan, mo_ta_chi_tiet, thanh_phan, cong_dung,
        huong_dan_su_dung, quy_cach, xuat_xu, anh_chinh_url,
        gia_niem_yet, gia_ban, gia_von, so_luong_ton, ton_toi_thieu,
        la_noi_bat, trang_thai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      input.categoryId, input.productCode, input.sku, input.name, input.slug,
      input.productType, input.shortDescription, input.description,
      input.ingredients, input.benefits, input.usageInstructions,
      input.specification, input.origin, input.mainImage,
      input.listPrice, input.salePrice, input.costPrice, input.stock,
      input.minimumStock, input.featured ? 1 : 0, input.status,
    ]);
    await replaceProductImages(connection, result.insertId, input.images);
    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateAdminProduct(productId, input) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(`
      UPDATE san_pham SET
        danh_muc_id=?, ma_san_pham=?, ma_sku=?, ten_san_pham=?, duong_dan=?,
        loai_san_pham=?, mo_ta_ngan=?, mo_ta_chi_tiet=?, thanh_phan=?, cong_dung=?,
        huong_dan_su_dung=?, quy_cach=?, xuat_xu=?, anh_chinh_url=?,
        gia_niem_yet=?, gia_ban=?, gia_von=?, so_luong_ton=?, ton_toi_thieu=?,
        la_noi_bat=?, trang_thai=?
      WHERE id=?
    `, [
      input.categoryId, input.productCode, input.sku, input.name, input.slug,
      input.productType, input.shortDescription, input.description,
      input.ingredients, input.benefits, input.usageInstructions,
      input.specification, input.origin, input.mainImage,
      input.listPrice, input.salePrice, input.costPrice, input.stock,
      input.minimumStock, input.featured ? 1 : 0, input.status, productId,
    ]);
    if (!result.affectedRows) {
      await connection.rollback();
      return false;
    }
    if (input.images) await replaceProductImages(connection, productId, input.images);
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function hideAdminProduct(productId) {
  const [result] = await database.execute(
    "UPDATE san_pham SET trang_thai='NGUNG_BAN' WHERE id=?",
    [productId],
  );
  return result.affectedRows > 0;
}

export async function findAdminCategories() {
  const [rows] = await database.query(`
    SELECT dm.*, COUNT(sp.id) AS so_san_pham
    FROM danh_muc_san_pham dm
    LEFT JOIN san_pham sp ON sp.danh_muc_id=dm.id
    GROUP BY dm.id ORDER BY dm.thu_tu_hien_thi, dm.id
  `);
  return rows;
}

export async function createAdminCategory(input) {
  const [result] = await database.execute(`
    INSERT INTO danh_muc_san_pham (
      ten_danh_muc, duong_dan, mo_ta, hinh_anh_url, thu_tu_hien_thi, trang_thai
    ) VALUES (?, ?, ?, ?, ?, ?)
  `, [input.name, input.slug, input.description, input.imageUrl, input.displayOrder, input.status]);
  return result.insertId;
}

export async function updateAdminCategory(categoryId, input) {
  const [result] = await database.execute(`
    UPDATE danh_muc_san_pham SET
      ten_danh_muc=?, duong_dan=?, mo_ta=?, hinh_anh_url=?,
      thu_tu_hien_thi=?, trang_thai=?
    WHERE id=?
  `, [input.name, input.slug, input.description, input.imageUrl, input.displayOrder, input.status, categoryId]);
  return result.affectedRows > 0;
}

export async function findAdminPromotions() {
  const [rows] = await database.query(`
    SELECT km.*,
      GROUP_CONCAT(kmsp.san_pham_id ORDER BY kmsp.san_pham_id) AS san_pham_ids
    FROM khuyen_mai km
    LEFT JOIN khuyen_mai_san_pham kmsp ON kmsp.khuyen_mai_id=km.id
    GROUP BY km.id ORDER BY km.ngay_tao DESC
  `);
  return rows;
}

async function replacePromotionProducts(connection, promotionId, productIds) {
  await connection.execute("DELETE FROM khuyen_mai_san_pham WHERE khuyen_mai_id=?", [promotionId]);
  for (const productId of productIds) {
    await connection.execute(
      "INSERT INTO khuyen_mai_san_pham (khuyen_mai_id, san_pham_id) VALUES (?, ?)",
      [promotionId, productId],
    );
  }
}

export async function createAdminPromotion(input) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(`
      INSERT INTO khuyen_mai (
        ma_khuyen_mai, ten_khuyen_mai, mo_ta, loai_khuyen_mai,
        gia_tri, giam_toi_da, gia_tri_don_toi_thieu,
        so_luot_su_dung_toi_da, ngay_bat_dau, ngay_ket_thuc, trang_thai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      input.code, input.name, input.description, input.type, input.value,
      input.maximumDiscount, input.minimumOrder, input.maximumUses,
      input.startsAt, input.endsAt, input.status,
    ]);
    await replacePromotionProducts(connection, result.insertId, input.productIds);
    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

export async function updateAdminPromotion(promotionId, input) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(`
      UPDATE khuyen_mai SET
        ma_khuyen_mai=?, ten_khuyen_mai=?, mo_ta=?, loai_khuyen_mai=?,
        gia_tri=?, giam_toi_da=?, gia_tri_don_toi_thieu=?,
        so_luot_su_dung_toi_da=?, ngay_bat_dau=?, ngay_ket_thuc=?, trang_thai=?
      WHERE id=?
    `, [
      input.code, input.name, input.description, input.type, input.value,
      input.maximumDiscount, input.minimumOrder, input.maximumUses,
      input.startsAt, input.endsAt, input.status, promotionId,
    ]);
    if (!result.affectedRows) {
      await connection.rollback();
      return false;
    }
    await replacePromotionProducts(connection, promotionId, input.productIds);
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

export async function findAdminArticles() {
  const [rows] = await database.query(`
    SELECT bv.*, nd.ho_ten AS ten_tac_gia
    FROM bai_viet bv LEFT JOIN nguoi_dung nd ON nd.id=bv.tac_gia_id
    ORDER BY bv.ngay_cap_nhat DESC, bv.id DESC
  `);
  return rows;
}

export async function createAdminArticle(adminId, input) {
  const [result] = await database.execute(`
    INSERT INTO bai_viet (
      tac_gia_id, chuyen_muc, tieu_de, duong_dan, tom_tat, noi_dung,
      anh_dai_dien_url, la_noi_bat, trang_thai, ngay_dang
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    adminId, input.category, input.title, input.slug, input.summary,
    input.content, input.imageUrl, input.featured ? 1 : 0,
    input.status, input.publishedAt,
  ]);
  return result.insertId;
}

export async function updateAdminArticle(articleId, input) {
  const [result] = await database.execute(`
    UPDATE bai_viet SET
      chuyen_muc=?, tieu_de=?, duong_dan=?, tom_tat=?, noi_dung=?,
      anh_dai_dien_url=?, la_noi_bat=?, trang_thai=?, ngay_dang=?
    WHERE id=?
  `, [
    input.category, input.title, input.slug, input.summary, input.content,
    input.imageUrl, input.featured ? 1 : 0, input.status,
    input.publishedAt, articleId,
  ]);
  return result.affectedRows > 0;
}

export async function findAdminInventory() {
  const [[products], [suppliers], [imports], [exports]] = await Promise.all([
    database.query(`
      SELECT id, ma_san_pham, ma_sku, ten_san_pham, anh_chinh_url,
        so_luong_ton, ton_toi_thieu, gia_von, trang_thai
      FROM san_pham ORDER BY so_luong_ton ASC, ten_san_pham
    `),
    database.query(`
      SELECT * FROM nha_cung_cap ORDER BY trang_thai, ten_nha_cung_cap
    `),
    database.query(`
      SELECT pn.*, ncc.ten_nha_cung_cap, nd.ho_ten AS nguoi_tao,
        COALESCE(SUM(ctpn.so_luong), 0) AS tong_so_luong
      FROM phieu_nhap pn
      INNER JOIN nha_cung_cap ncc ON ncc.id=pn.nha_cung_cap_id
      LEFT JOIN nguoi_dung nd ON nd.id=pn.nguoi_tao_id
      LEFT JOIN chi_tiet_phieu_nhap ctpn ON ctpn.phieu_nhap_id=pn.id
      GROUP BY pn.id, ncc.id, nd.id
      ORDER BY pn.ngay_nhap DESC LIMIT 100
    `),
    database.query(`
      SELECT px.*, nd.ho_ten AS nguoi_tao,
        COALESCE(SUM(ctpx.so_luong), 0) AS tong_so_luong
      FROM phieu_xuat px
      LEFT JOIN nguoi_dung nd ON nd.id=px.nguoi_tao_id
      LEFT JOIN chi_tiet_phieu_xuat ctpx ON ctpx.phieu_xuat_id=px.id
      GROUP BY px.id, nd.id
      ORDER BY px.ngay_xuat DESC LIMIT 100
    `),
  ]);
  return { products, suppliers, imports, exports };
}

export async function createAdminSupplier(input) {
  const [result] = await database.execute(`
    INSERT INTO nha_cung_cap (
      ma_nha_cung_cap, ten_nha_cung_cap, nguoi_lien_he,
      so_dien_thoai, email, dia_chi, ghi_chu, trang_thai
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    input.code, input.name, input.contactName, input.phone,
    input.email, input.address, input.note, input.status,
  ]);
  return result.insertId;
}

export async function updateAdminSupplier(supplierId, input) {
  const [result] = await database.execute(`
    UPDATE nha_cung_cap SET
      ma_nha_cung_cap=?, ten_nha_cung_cap=?, nguoi_lien_he=?,
      so_dien_thoai=?, email=?, dia_chi=?, ghi_chu=?, trang_thai=?
    WHERE id=?
  `, [
    input.code, input.name, input.contactName, input.phone,
    input.email, input.address, input.note, input.status, supplierId,
  ]);
  return result.affectedRows > 0;
}

export async function createAdminImport(adminId, input) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const productIds = input.items.map((item) => item.productId);
    const [products] = await connection.query(`
      SELECT id FROM san_pham
      WHERE id IN (?) FOR UPDATE
    `, [productIds]);
    if (products.length !== productIds.length) {
      const error = new Error("Có sản phẩm không tồn tại");
      error.statusCode = 400;
      throw error;
    }
    const total = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const [result] = await connection.execute(`
      INSERT INTO phieu_nhap (
        ma_phieu_nhap, nha_cung_cap_id, nguoi_tao_id,
        ngay_nhap, tong_tien, ghi_chu, trang_thai
      ) VALUES (?, ?, ?, ?, ?, ?, 'DA_HOAN_THANH')
    `, [input.code, input.supplierId, adminId, input.date, total, input.note]);
    for (const item of input.items) {
      await connection.execute(`
        INSERT INTO chi_tiet_phieu_nhap (
          phieu_nhap_id, san_pham_id, so_luong, don_gia_nhap, thanh_tien
        ) VALUES (?, ?, ?, ?, ?)
      `, [result.insertId, item.productId, item.quantity, item.unitPrice, item.quantity * item.unitPrice]);
      await connection.execute(`
        UPDATE san_pham
        SET so_luong_ton=so_luong_ton+?, gia_von=?
        WHERE id=?
      `, [item.quantity, item.unitPrice, item.productId]);
    }
    await connection.commit();
    return { id: result.insertId, total };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

export async function createAdminExport(adminId, input) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const productIds = input.items.map((item) => item.productId);
    const [products] = await connection.query(`
      SELECT id, ten_san_pham, so_luong_ton, gia_von
      FROM san_pham WHERE id IN (?) FOR UPDATE
    `, [productIds]);
    if (products.length !== productIds.length) {
      const error = new Error("Có sản phẩm không tồn tại");
      error.statusCode = 400;
      throw error;
    }
    const productMap = new Map(products.map((item) => [Number(item.id), item]));
    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (Number(product.so_luong_ton) < item.quantity) {
        const error = new Error(`${product.ten_san_pham} không đủ tồn kho`);
        error.statusCode = 409;
        throw error;
      }
    }
    const total = input.items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + item.quantity * Number(item.unitPrice ?? product.gia_von);
    }, 0);
    const [result] = await connection.execute(`
      INSERT INTO phieu_xuat (
        ma_phieu_xuat, nguoi_tao_id, loai_xuat, ngay_xuat,
        nguoi_nhan, tong_gia_tri, ghi_chu, trang_thai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'DA_HOAN_THANH')
    `, [input.code, adminId, input.type, input.date, input.recipient, total, input.note]);
    for (const item of input.items) {
      const product = productMap.get(item.productId);
      const unitPrice = Number(item.unitPrice ?? product.gia_von);
      await connection.execute(`
        INSERT INTO chi_tiet_phieu_xuat (
          phieu_xuat_id, san_pham_id, so_luong, don_gia_xuat, thanh_tien
        ) VALUES (?, ?, ?, ?, ?)
      `, [result.insertId, item.productId, item.quantity, unitPrice, item.quantity * unitPrice]);
      await connection.execute(
        "UPDATE san_pham SET so_luong_ton=so_luong_ton-? WHERE id=?",
        [item.quantity, item.productId],
      );
    }
    await connection.commit();
    return { id: result.insertId, total };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}
