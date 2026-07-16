USE rubeanora_store;

CREATE TABLE IF NOT EXISTS khuyen_mai_san_pham (
  khuyen_mai_id INT UNSIGNED NOT NULL,
  san_pham_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (khuyen_mai_id, san_pham_id),
  KEY idx_kmsp_san_pham (san_pham_id),
  CONSTRAINT fk_kmsp_khuyen_mai FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai(id) ON DELETE CASCADE,
  CONSTRAINT fk_kmsp_san_pham FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO cau_hinh_cua_hang (ten_cua_hang, mo_ta, hotline, email)
SELECT 'Rubeanora', 'Chăm sóc da từ đậu đỏ thiên nhiên', '0986126955', 'Hoangthinhgocmai2005@gmail.com'
WHERE NOT EXISTS (SELECT 1 FROM cau_hinh_cua_hang);

UPDATE san_pham SET
  mo_ta_chi_tiet='Bộ combo gồm Sữa rửa mặt tạo bọt đậu đỏ, Mặt nạ tẩy tế bào chết đậu đỏ và Toner dưỡng da đậu đỏ. Combo chăm sóc da toàn diện, phù hợp cho mọi loại da.',
  thanh_phan='Bột đậu đỏ,Bột cám gạo,Chiết xuất nghệ,Nước hoa hồng',
  cong_dung='Không Sulfate,Không Paraben,Không Alcohol'
WHERE ma_san_pham='COMBO-DD-3';

UPDATE san_pham SET
  mo_ta_chi_tiet='Sữa rửa mặt tạo bọt giúp loại bỏ bụi bẩn, bã nhờn và mồ hôi trên da một cách dịu nhẹ, giúp da mềm mại và sáng mịn.',
  thanh_phan='Chiết xuất đậu đỏ,Chiết xuất hoa cúc La Mã,Niacinamide,Panthenol',
  cong_dung='Làm sạch sâu,Dưỡng ẩm,Sáng da'
WHERE ma_san_pham='SRM-DD-150';

UPDATE san_pham SET
  mo_ta_chi_tiet='Mặt nạ giúp làm sạch tế bào chết, hỗ trợ da ẩm mượt, sáng khỏe và mềm mại.',
  thanh_phan='Hyaluronic Acid,Niacinamide,Bột đậu đỏ,Bột cám gạo',
  cong_dung='Tẩy tế bào chết,Sáng da,Dưỡng ẩm'
WHERE ma_san_pham='MN-DD-150';

UPDATE san_pham SET
  mo_ta_chi_tiet='Toner giúp dưỡng ẩm, làm dịu da khô căng và cân bằng da sau bước làm sạch.',
  thanh_phan='Chiết xuất đậu đỏ,Chiết xuất hoa cúc La Mã,Chiết xuất rễ Cam Thảo,Nước hoa hồng',
  cong_dung='Dưỡng ẩm,Làm dịu da,Cân bằng pH'
WHERE ma_san_pham='TONER-DD-150';

UPDATE san_pham SET
  mo_ta_chi_tiet='Bộ combo mini nhỏ gọn gồm các bước làm sạch, tẩy tế bào chết và cân bằng da, tiện lợi khi đi du lịch.',
  thanh_phan='Bột đậu đỏ,Bột cám gạo,Chiết xuất nghệ,Nước hoa hồng',
  cong_dung='Mini size,Tiện lợi,Quà tặng'
WHERE ma_san_pham='COMBO-DD-MINI';

INSERT INTO san_pham (
  danh_muc_id, ma_san_pham, ma_sku, ten_san_pham, duong_dan, loai_san_pham,
  mo_ta_ngan, mo_ta_chi_tiet, thanh_phan, cong_dung, quy_cach, xuat_xu,
  anh_chinh_url, gia_niem_yet, gia_ban, gia_von, so_luong_ton, ton_toi_thieu,
  la_noi_bat, trang_thai
)
VALUES
  ((SELECT id FROM danh_muc_san_pham WHERE duong_dan='toner'), 'SERUM-DD-30', 'RB-SERUM-30', 'Serum Đậu Đỏ Dưỡng sáng da', 'serum-dau-do-duong-sang-da', 'DON', 'Serum dưỡng sáng và cấp ẩm', 'Serum dưỡng sáng da từ đậu đỏ giúp cải thiện làn da xỉn màu, dưỡng ẩm sâu và hỗ trợ da đều màu.', 'Chiết xuất đậu đỏ,Vitamin B3,Hyaluronic Acid', 'Dưỡng sáng da,Mờ thâm,Cấp ẩm', '30ml', 'Việt Nam', '/images/products/toner-duong-da6.png', 350000, 280000, 160000, 60, 10, 0, 'DANG_BAN'),
  ((SELECT id FROM danh_muc_san_pham WHERE duong_dan='toner'), 'KEM-DD-50', 'RB-KEM-50', 'Kem dưỡng ẩm Cấp ẩm, mịn da', 'kem-duong-am-dau-do', 'DON', 'Kem dưỡng ẩm đậu đỏ', 'Kem dưỡng ẩm đậu đỏ giúp duy trì độ ẩm tự nhiên, tăng độ đàn hồi và làm dịu làn da nhạy cảm.', 'Bột đậu đỏ,Ceramide,Shea Butter', 'Cấp ẩm,Mịn da,Dịu nhẹ', '50g', 'Việt Nam', '/images/products/combo-duong-da-mini.png', 360000, 290000, 175000, 60, 10, 0, 'DANG_BAN'),
  ((SELECT id FROM danh_muc_san_pham WHERE duong_dan='sua-rua-mat'), 'TTRANG-DD-200', 'RB-TTRANG-200', 'Tẩy trang dịu nhẹ Làm sạch sâu', 'tay-trang-dau-do-lam-sach-sau', 'DON', 'Nước tẩy trang đậu đỏ', 'Nước tẩy trang đậu đỏ làm sạch lớp trang điểm và bụi bẩn mà không gây khô rát.', 'Chiết xuất đậu đỏ,Nước khoáng tự nhiên,Glycerin', 'Tẩy trang,Làm sạch sâu,Dịu nhẹ', '200ml', 'Việt Nam', '/images/products/sua-rua-mat-tao-bot2.png', 300000, 240000, 145000, 60, 10, 0, 'DANG_BAN')
ON DUPLICATE KEY UPDATE
  danh_muc_id=VALUES(danh_muc_id), ma_sku=VALUES(ma_sku), ten_san_pham=VALUES(ten_san_pham),
  duong_dan=VALUES(duong_dan), mo_ta_ngan=VALUES(mo_ta_ngan), mo_ta_chi_tiet=VALUES(mo_ta_chi_tiet),
  thanh_phan=VALUES(thanh_phan), cong_dung=VALUES(cong_dung), quy_cach=VALUES(quy_cach),
  xuat_xu=VALUES(xuat_xu), anh_chinh_url=VALUES(anh_chinh_url), gia_niem_yet=VALUES(gia_niem_yet),
  gia_ban=VALUES(gia_ban), gia_von=VALUES(gia_von), so_luong_ton=VALUES(so_luong_ton),
  ton_toi_thieu=VALUES(ton_toi_thieu), la_noi_bat=VALUES(la_noi_bat), trang_thai=VALUES(trang_thai);

DELETE asp
FROM anh_san_pham asp
INNER JOIN san_pham sp ON sp.id=asp.san_pham_id
WHERE sp.ma_san_pham IN ('COMBO-DD-3','SRM-DD-150','MN-DD-150','TONER-DD-150','COMBO-DD-MINI','SERUM-DD-30','KEM-DD-50','TTRANG-DD-200');

INSERT INTO anh_san_pham (san_pham_id, duong_dan_anh, alt_text, thu_tu_hien_thi)
VALUES
  ((SELECT id FROM san_pham WHERE ma_san_pham='COMBO-DD-3'), '/images/products/combo-3mon6.jpg', 'Combo chăm sóc da đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham='COMBO-DD-3'), '/images/products/combo-3mon.jpg', 'Combo chăm sóc da đậu đỏ', 2),
  ((SELECT id FROM san_pham WHERE ma_san_pham='COMBO-DD-3'), '/images/products/combo-3mon2.png', 'Combo chăm sóc da đậu đỏ', 3),
  ((SELECT id FROM san_pham WHERE ma_san_pham='COMBO-DD-3'), '/images/products/combo-3mon3.png', 'Combo chăm sóc da đậu đỏ', 4),
  ((SELECT id FROM san_pham WHERE ma_san_pham='SRM-DD-150'), '/images/products/sua-rua-mat-tao-bot3.jpg', 'Sữa rửa mặt đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham='SRM-DD-150'), '/images/products/sua-rua-mat-tao-bot1.png', 'Sữa rửa mặt đậu đỏ', 2),
  ((SELECT id FROM san_pham WHERE ma_san_pham='SRM-DD-150'), '/images/products/sua-rua-mat-tao-bot2.png', 'Sữa rửa mặt đậu đỏ', 3),
  ((SELECT id FROM san_pham WHERE ma_san_pham='SRM-DD-150'), '/images/products/sua-rua-mat-tao-bot4.png', 'Sữa rửa mặt đậu đỏ', 4),
  ((SELECT id FROM san_pham WHERE ma_san_pham='MN-DD-150'), '/images/products/mat-na-tay-te-bao-chet6.jpg', 'Mặt nạ đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham='MN-DD-150'), '/images/products/mat-na-tay-te-bao-chet1.jpg', 'Mặt nạ đậu đỏ', 2),
  ((SELECT id FROM san_pham WHERE ma_san_pham='MN-DD-150'), '/images/products/mat-na-tay-te-bao-chet2.jpg', 'Mặt nạ đậu đỏ', 3),
  ((SELECT id FROM san_pham WHERE ma_san_pham='MN-DD-150'), '/images/products/mat-na-tay-te-bao-chet4.png', 'Mặt nạ đậu đỏ', 4),
  ((SELECT id FROM san_pham WHERE ma_san_pham='TONER-DD-150'), '/images/products/toner-duong-da4.jpg', 'Toner đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham='TONER-DD-150'), '/images/products/toner-duong-da1.png', 'Toner đậu đỏ', 2),
  ((SELECT id FROM san_pham WHERE ma_san_pham='TONER-DD-150'), '/images/products/toner-duong-da2.jpg', 'Toner đậu đỏ', 3),
  ((SELECT id FROM san_pham WHERE ma_san_pham='TONER-DD-150'), '/images/products/toner-duong-da3.jpg', 'Toner đậu đỏ', 4),
  ((SELECT id FROM san_pham WHERE ma_san_pham='COMBO-DD-MINI'), '/images/products/combo-duong-da-mini4.png', 'Combo mini đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham='COMBO-DD-MINI'), '/images/products/combo-duong-da-mini.png', 'Combo mini đậu đỏ', 2),
  ((SELECT id FROM san_pham WHERE ma_san_pham='COMBO-DD-MINI'), '/images/products/combo-duong-da-mini2.jpg', 'Combo mini đậu đỏ', 3),
  ((SELECT id FROM san_pham WHERE ma_san_pham='COMBO-DD-MINI'), '/images/products/combo-duong-da-mini3.jpg', 'Combo mini đậu đỏ', 4),
  ((SELECT id FROM san_pham WHERE ma_san_pham='SERUM-DD-30'), '/images/products/toner-duong-da6.png', 'Serum đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham='KEM-DD-50'), '/images/products/combo-duong-da-mini.png', 'Kem dưỡng đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham='TTRANG-DD-200'), '/images/products/sua-rua-mat-tao-bot2.png', 'Tẩy trang đậu đỏ', 1);

INSERT INTO khuyen_mai (
  ma_khuyen_mai, ten_khuyen_mai, mo_ta, loai_khuyen_mai, gia_tri,
  gia_tri_don_toi_thieu, ngay_bat_dau, ngay_ket_thuc, trang_thai
)
VALUES
  ('REDBEAN', 'Giảm 10% cho đơn hàng đầu tiên', CONCAT('Áp dụng cho khách hàng mua lần đầu', CHAR(10), 'Giảm 10% cho đơn hàng từ 200K'), 'PHAN_TRAM', 10, 200000, '2026-01-01', '2027-12-31', 'HOAT_DONG'),
  ('COMBO20', 'Giảm 20% khi mua Combo 3 món', CONCAT('Áp dụng cho sản phẩm combo', CHAR(10), 'Giảm 20% cho combo chăm sóc da đậu đỏ 3 món'), 'PHAN_TRAM', 20, 0, '2026-01-01', '2027-12-31', 'HOAT_DONG'),
  ('FREESHIP', 'Miễn phí ship cho đơn từ 300K', CONCAT('Áp dụng toàn quốc', CHAR(10), 'Miễn phí vận chuyển cho đơn hàng từ 300K'), 'MIEN_PHI_VAN_CHUYEN', 0, 300000, '2026-01-01', '2027-12-31', 'HOAT_DONG'),
  ('SKINCARE', 'Tặng mẫu thử khi mua từ 250K', CONCAT('Áp dụng khi đơn hàng từ 250K', CHAR(10), 'Quà tặng được gửi kèm theo đơn hàng'), 'SO_TIEN', 0, 250000, '2026-01-01', '2027-12-31', 'HOAT_DONG')
ON DUPLICATE KEY UPDATE
  ten_khuyen_mai=VALUES(ten_khuyen_mai), mo_ta=VALUES(mo_ta), loai_khuyen_mai=VALUES(loai_khuyen_mai),
  gia_tri=VALUES(gia_tri), gia_tri_don_toi_thieu=VALUES(gia_tri_don_toi_thieu),
  ngay_bat_dau=VALUES(ngay_bat_dau), ngay_ket_thuc=VALUES(ngay_ket_thuc), trang_thai=VALUES(trang_thai);

DELETE kmsp
FROM khuyen_mai_san_pham kmsp
INNER JOIN khuyen_mai km ON km.id=kmsp.khuyen_mai_id
WHERE km.ma_khuyen_mai='COMBO20';

INSERT INTO khuyen_mai_san_pham (khuyen_mai_id, san_pham_id)
SELECT km.id, sp.id
FROM khuyen_mai km
INNER JOIN san_pham sp ON sp.loai_san_pham='COMBO' AND sp.trang_thai='DANG_BAN'
WHERE km.ma_khuyen_mai='COMBO20';

UPDATE san_pham
SET huong_dan_su_dung='Lấy một lượng sản phẩm vừa đủ, sử dụng theo đúng bước trong chu trình chăm sóc da. Tránh vùng mắt và vùng da đang tổn thương. Ngưng sử dụng nếu xuất hiện dấu hiệu kích ứng.'
WHERE ma_san_pham IN ('COMBO-DD-3','SRM-DD-150','MN-DD-150','TONER-DD-150','COMBO-DD-MINI','SERUM-DD-30','KEM-DD-50','TTRANG-DD-200');
