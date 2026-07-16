import "dotenv/config";
import mysql from "mysql2/promise";

import { hashPassword } from "../src/security/password.js";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8mb4",
});

try {
  await connection.execute("ALTER TABLE nguoi_dung MODIFY anh_dai_dien_url LONGTEXT NULL");
  const passwordHash = hashPassword("123456");
  await connection.execute(`
    INSERT INTO nguoi_dung (ho_ten, email, so_dien_thoai, mat_khau_hash, vai_tro, trang_thai)
    VALUES ('Lê Văn Quang', 'quang@gmail.com', '0987654321', ?, 'KHACH_HANG', 'HOAT_DONG')
    ON DUPLICATE KEY UPDATE ho_ten=VALUES(ho_ten), so_dien_thoai=VALUES(so_dien_thoai),
      mat_khau_hash=VALUES(mat_khau_hash), vai_tro='KHACH_HANG', trang_thai='HOAT_DONG'
  `, [passwordHash]);
  const [[user]] = await connection.execute("SELECT id FROM nguoi_dung WHERE email='quang@gmail.com'");
  await connection.execute(`
    INSERT INTO dia_chi_nguoi_dung (
      nguoi_dung_id, ten_nguoi_nhan, so_dien_thoai, tinh_thanh,
      quan_huyen, phuong_xa, dia_chi_chi_tiet, la_mac_dinh
    )
    SELECT ?, 'Lê Văn Quang', '0987654321', 'Thành phố Hồ Chí Minh', '',
      'Phường Bến Thành', 'Số 15, Đường Trần Hưng Đạo', 1
    WHERE NOT EXISTS (SELECT 1 FROM dia_chi_nguoi_dung WHERE nguoi_dung_id=? )
  `, [user.id, user.id]);

  const demoOrders = [
    { code: 'RBB-948123', total: 440000, discount: 0, shipping: 30000, payment: 470000, method: 'COD', paymentStatus: 'CHUA_THANH_TOAN', status: 'CHO_XAC_NHAN', note: 'Giao giờ hành chính giúp em ạ.', cancel: null, days: 0, items: [['SRM-DD-150', 2, 220000]] },
    { code: 'RBB-837128', total: 700000, discount: 50000, shipping: 0, payment: 650000, method: 'MOMO', paymentStatus: 'DA_THANH_TOAN', status: 'DANG_GIAO', note: null, cancel: null, days: 1, items: [['COMBO-DD-3', 1, 480000], ['TONER-DD-150', 1, 220000]] },
    { code: 'RBB-129482', total: 250000, discount: 0, shipping: 30000, payment: 280000, method: 'CHUYEN_KHOAN', paymentStatus: 'DA_THANH_TOAN', status: 'DA_GIAO', note: null, cancel: null, days: 10, items: [['MN-DD-150', 1, 250000]] },
    { code: 'RBB-581938', total: 220000, discount: 0, shipping: 30000, payment: 250000, method: 'COD', paymentStatus: 'CHUA_THANH_TOAN', status: 'DA_HUY', note: null, cancel: 'Thay đổi địa chỉ giao hàng', days: 15, items: [['TONER-DD-150', 1, 220000]] },
  ];

  for (const order of demoOrders) {
    await connection.execute(`
      INSERT INTO don_hang (
        ma_don_hang, nguoi_dung_id, ten_nguoi_nhan, so_dien_thoai, email,
        tinh_thanh, quan_huyen, phuong_xa, dia_chi_chi_tiet,
        tong_tien_hang, tien_giam, phi_van_chuyen, tong_thanh_toan,
        phuong_thuc_thanh_toan, trang_thai_thanh_toan, trang_thai_don_hang,
        ghi_chu_khach_hang, ly_do_huy, ngay_tao
      ) VALUES (?, ?, 'Lê Văn Quang', '0987654321', 'quang@gmail.com',
        'Thành phố Hồ Chí Minh', 'Quận 1', 'Phường Bến Thành', 'Số 15, Đường Trần Hưng Đạo',
        ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
      ON DUPLICATE KEY UPDATE tong_tien_hang=VALUES(tong_tien_hang), tien_giam=VALUES(tien_giam),
        phi_van_chuyen=VALUES(phi_van_chuyen), tong_thanh_toan=VALUES(tong_thanh_toan),
        phuong_thuc_thanh_toan=VALUES(phuong_thuc_thanh_toan),
        trang_thai_thanh_toan=VALUES(trang_thai_thanh_toan), trang_thai_don_hang=VALUES(trang_thai_don_hang),
        ghi_chu_khach_hang=VALUES(ghi_chu_khach_hang), ly_do_huy=VALUES(ly_do_huy)
    `, [order.code, user.id, order.total, order.discount, order.shipping, order.payment, order.method, order.paymentStatus, order.status, order.note, order.cancel, order.days]);
    const [[savedOrder]] = await connection.execute("SELECT id FROM don_hang WHERE ma_don_hang=?", [order.code]);
    await connection.execute("DELETE FROM chi_tiet_don_hang WHERE don_hang_id=? AND id NOT IN (SELECT reviewed_id FROM (SELECT chi_tiet_don_hang_id AS reviewed_id FROM danh_gia WHERE chi_tiet_don_hang_id IS NOT NULL) reviewed)", [savedOrder.id]);
    const [[remaining]] = await connection.execute("SELECT COUNT(*) AS total FROM chi_tiet_don_hang WHERE don_hang_id=?", [savedOrder.id]);
    if (remaining.total === 0) {
      for (const [productCode, quantity, price] of order.items) {
        const [[product]] = await connection.execute("SELECT id, ten_san_pham, anh_chinh_url FROM san_pham WHERE ma_san_pham=?", [productCode]);
        await connection.execute(`
          INSERT INTO chi_tiet_don_hang (don_hang_id, san_pham_id, ma_san_pham, ten_san_pham, anh_san_pham_url, so_luong, don_gia, thanh_tien)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [savedOrder.id, product.id, productCode, product.ten_san_pham, product.anh_chinh_url, quantity, price, quantity * price]);
      }
    }
  }
  console.log("Seed khách hàng thành công: quang@gmail.com");
} finally {
  await connection.end();
}
