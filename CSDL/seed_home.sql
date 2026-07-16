USE rubeanora_store;

INSERT INTO danh_muc_san_pham (ten_danh_muc, duong_dan, mo_ta, thu_tu_hien_thi, trang_thai)
VALUES
  ('Sữa rửa mặt', 'sua-rua-mat', 'Sản phẩm làm sạch da mặt dịu nhẹ', 1, 'HOAT_DONG'),
  ('Mặt nạ', 'mat-na', 'Mặt nạ chăm sóc và làm sạch da', 2, 'HOAT_DONG'),
  ('Toner', 'toner', 'Sản phẩm cân bằng và dưỡng ẩm da', 3, 'HOAT_DONG'),
  ('Combo', 'combo', 'Bộ sản phẩm chăm sóc da', 4, 'HOAT_DONG')
ON DUPLICATE KEY UPDATE
  ten_danh_muc = VALUES(ten_danh_muc),
  mo_ta = VALUES(mo_ta),
  thu_tu_hien_thi = VALUES(thu_tu_hien_thi),
  trang_thai = VALUES(trang_thai);

INSERT INTO san_pham (
  danh_muc_id, ma_san_pham, ma_sku, ten_san_pham, duong_dan, loai_san_pham,
  mo_ta_ngan, mo_ta_chi_tiet, quy_cach, xuat_xu, anh_chinh_url,
  gia_niem_yet, gia_ban, gia_von, so_luong_ton, ton_toi_thieu, la_noi_bat, trang_thai
)
VALUES
  ((SELECT id FROM danh_muc_san_pham WHERE duong_dan='sua-rua-mat'), 'SRM-DD-150', 'RB-SRM-150', 'Sữa rửa mặt tạo bọt đậu đỏ 150g', 'sua-rua-mat-tao-bot-dau-do-150g', 'DON', NULL, 'Làm sạch da dịu nhẹ với chiết xuất đậu đỏ.', '150g', 'Việt Nam', '/images/products/sua-rua-mat-tao-bot4.png', 220000, 220000, 120000, 100, 10, 1, 'DANG_BAN'),
  ((SELECT id FROM danh_muc_san_pham WHERE duong_dan='mat-na'), 'MN-DD-150', 'RB-MN-150', 'Mặt nạ tẩy tế bào chết đậu đỏ 150g', 'mat-na-tay-te-bao-chet-dau-do-150g', 'DON', NULL, 'Làm sạch tế bào chết, hỗ trợ da mịn và sáng khỏe.', '150g', 'Việt Nam', '/images/products/mat-na-tay-te-bao-chet4.png', 250000, 250000, 135000, 100, 10, 1, 'DANG_BAN'),
  ((SELECT id FROM danh_muc_san_pham WHERE duong_dan='toner'), 'TONER-DD-150', 'RB-TONER-150', 'Toner dưỡng da đậu đỏ', 'toner-duong-da-dau-do', 'DON', NULL, 'Cấp ẩm, làm dịu và cân bằng da.', '150g', 'Việt Nam', '/images/products/toner-duong-da6.png', 220000, 220000, 120000, 100, 10, 1, 'DANG_BAN'),
  ((SELECT id FROM danh_muc_san_pham WHERE duong_dan='combo'), 'COMBO-DD-3', 'RB-COMBO-3', 'Combo chăm sóc da toàn diện đậu đỏ', 'combo-cham-soc-da-toan-dien-dau-do-3-mon-150g', 'COMBO', 'Combo 3 món 150g', 'Làm sạch sâu – Tẩy tế bào chết – Cấp ẩm & cân bằng da', '3 món x 150g', 'Việt Nam', '/images/products/combo_ref1.png', 565000, 480000, 350000, 80, 10, 1, 'DANG_BAN'),
  ((SELECT id FROM danh_muc_san_pham WHERE duong_dan='combo'), 'COMBO-DD-MINI', 'RB-COMBO-MINI', 'Bộ combo dưỡng da đậu đỏ mini', 'combo-duong-da-dau-do-mini', 'COMBO', NULL, 'Bộ chăm sóc da nhỏ gọn, tiện lợi khi đi du lịch.', 'Mini size', 'Việt Nam', '/images/products/combo-duong-da-mini4.png', 290000, 290000, 190000, 80, 10, 1, 'DANG_BAN')
ON DUPLICATE KEY UPDATE
  danh_muc_id=VALUES(danh_muc_id), ma_sku=VALUES(ma_sku), ten_san_pham=VALUES(ten_san_pham),
  duong_dan=VALUES(duong_dan), loai_san_pham=VALUES(loai_san_pham), mo_ta_ngan=VALUES(mo_ta_ngan),
  mo_ta_chi_tiet=VALUES(mo_ta_chi_tiet), quy_cach=VALUES(quy_cach), xuat_xu=VALUES(xuat_xu),
  anh_chinh_url=VALUES(anh_chinh_url), gia_niem_yet=VALUES(gia_niem_yet), gia_ban=VALUES(gia_ban),
  gia_von=VALUES(gia_von), so_luong_ton=VALUES(so_luong_ton), ton_toi_thieu=VALUES(ton_toi_thieu),
  la_noi_bat=VALUES(la_noi_bat), trang_thai=VALUES(trang_thai);

INSERT INTO bai_viet (chuyen_muc, tieu_de, duong_dan, tom_tat, noi_dung, anh_dai_dien_url, la_noi_bat, trang_thai, ngay_dang)
VALUES
  ('Chăm sóc da', '5 lợi ích của đậu đỏ đối với làn da bạn nên biết', '5-loi-ich-cua-dau-do-doi-voi-lan-da', 'Đậu đỏ chứa nhiều vitamin và chất chống oxy hóa, giúp làm sạch nhẹ nhàng, hỗ trợ da sáng khỏe và mịn màng hơn.', 'Đậu đỏ là nguyên liệu tự nhiên giàu dưỡng chất, phù hợp với chu trình chăm sóc da dịu nhẹ.', '/images/products/combo-3mon.jpg', 1, 'DA_DANG', '2026-06-15 08:00:00'),
  ('Chăm sóc da', 'Chu trình chăm sóc da 3 bước đơn giản mỗi ngày', 'chu-trinh-cham-soc-da-3-buoc', 'Làm sạch, loại bỏ tế bào chết và cân bằng độ ẩm là ba bước cơ bản giúp làn da duy trì vẻ tươi sáng tự nhiên.', 'Chu trình gồm làm sạch, làm sạch lớp tế bào cũ và cân bằng cấp ẩm.', '/images/products/combo-3mon7.jpg', 1, 'DA_DANG', '2026-06-10 08:00:00'),
  ('Chăm sóc da', 'Cách chọn sữa rửa mặt dịu nhẹ cho từng loại da', 'cach-chon-sua-rua-mat-diu-nhe', 'Một sản phẩm làm sạch phù hợp sẽ giúp loại bỏ bụi bẩn mà không khiến da khô căng hay mất đi độ ẩm cần thiết.', 'Mỗi loại da cần công thức làm sạch có độ dịu nhẹ phù hợp.', '/images/products/sua-rua-mat-tao-bot3.jpg', 1, 'DA_DANG', '2026-06-05 08:00:00'),
  ('Chăm sóc da', 'Tẩy tế bào chết đúng cách để da luôn mịn màng', 'tay-te-bao-chet-dung-cach', 'Tần suất và cách sử dụng phù hợp giúp làm sạch lớp da cũ hiệu quả, đồng thời hạn chế cảm giác kích ứng trên da.', 'Nên tẩy tế bào chết nhẹ nhàng từ một đến hai lần mỗi tuần.', '/images/products/mat-na-tay-te-bao-chet6.jpg', 1, 'DA_DANG', '2026-05-28 08:00:00')
ON DUPLICATE KEY UPDATE
  chuyen_muc=VALUES(chuyen_muc), tieu_de=VALUES(tieu_de), tom_tat=VALUES(tom_tat),
  noi_dung=VALUES(noi_dung), anh_dai_dien_url=VALUES(anh_dai_dien_url), la_noi_bat=VALUES(la_noi_bat),
  trang_thai=VALUES(trang_thai), ngay_dang=VALUES(ngay_dang);

-- Tạo 128 tài khoản mẫu để số lượt đánh giá trên trang chủ khớp giao diện.
INSERT IGNORE INTO nguoi_dung (ho_ten, email, mat_khau_hash, vai_tro, trang_thai)
SELECT CONCAT('Khách hàng ', n), CONCAT('seed-review-', n, '@example.local'), '$2b$10$seedOnlyNotForLogin', 'KHACH_HANG', 'HOAT_DONG'
FROM (
  WITH RECURSIVE sequence AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM sequence WHERE n < 128)
  SELECT n FROM sequence
) AS numbers;

UPDATE nguoi_dung
SET ho_ten='Minh Anh',
    anh_dai_dien_url='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'
WHERE email='seed-review-1@example.local';

UPDATE nguoi_dung
SET ho_ten='Thu Trang',
    anh_dai_dien_url='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100&q=80'
WHERE email='seed-review-2@example.local';

UPDATE nguoi_dung
SET ho_ten='Hoàng Nam',
    anh_dai_dien_url='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80'
WHERE email='seed-review-3@example.local';

-- Chỉ làm mới đánh giá mẫu; không đụng đến đánh giá thật của khách hàng.
DELETE dg
FROM danh_gia dg
INNER JOIN nguoi_dung nd ON nd.id=dg.nguoi_dung_id
INNER JOIN san_pham sp ON sp.id=dg.san_pham_id
WHERE nd.email LIKE 'seed-review-%@example.local'
  AND sp.ma_san_pham IN ('SRM-DD-150', 'MN-DD-150', 'TONER-DD-150', 'COMBO-DD-3', 'COMBO-DD-MINI');

INSERT IGNORE INTO danh_gia (nguoi_dung_id, san_pham_id, so_sao, noi_dung, trang_thai)
SELECT nd.id, sp.id, IF(MOD(nd.id, 10)=0, 4, 5), 'Sản phẩm tốt, dịu nhẹ và dễ sử dụng.', 'DA_DUYET'
FROM nguoi_dung nd
JOIN san_pham sp ON sp.ma_san_pham = 'SRM-DD-150'
WHERE nd.email LIKE 'seed-review-%@example.local'
  AND CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(nd.email, '@', 1), '-', -1) AS UNSIGNED) <= 128
LIMIT 128;

INSERT IGNORE INTO danh_gia (nguoi_dung_id, san_pham_id, so_sao, noi_dung, trang_thai)
SELECT nd.id, sp.id, IF(MOD(nd.id, 10)=0, 4, 5), 'Sản phẩm tốt, dịu nhẹ và dễ sử dụng.', 'DA_DUYET'
FROM nguoi_dung nd
JOIN san_pham sp ON sp.ma_san_pham = 'MN-DD-150'
WHERE nd.email LIKE 'seed-review-%@example.local'
  AND CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(nd.email, '@', 1), '-', -1) AS UNSIGNED) <= 98
LIMIT 98;

INSERT IGNORE INTO danh_gia (nguoi_dung_id, san_pham_id, so_sao, noi_dung, trang_thai)
SELECT nd.id, sp.id, IF(MOD(nd.id, 10)=0, 4, 5), 'Sản phẩm tốt, dịu nhẹ và dễ sử dụng.', 'DA_DUYET'
FROM nguoi_dung nd
JOIN san_pham sp ON sp.ma_san_pham = 'TONER-DD-150'
WHERE nd.email LIKE 'seed-review-%@example.local'
  AND CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(nd.email, '@', 1), '-', -1) AS UNSIGNED) <= 76
LIMIT 76;

INSERT IGNORE INTO danh_gia (nguoi_dung_id, san_pham_id, so_sao, noi_dung, trang_thai)
SELECT nd.id, sp.id, IF(MOD(nd.id, 10)=0, 4, 5), 'Sản phẩm tốt, dịu nhẹ và dễ sử dụng.', 'DA_DUYET'
FROM nguoi_dung nd
JOIN san_pham sp ON sp.ma_san_pham = 'COMBO-DD-3'
WHERE nd.email LIKE 'seed-review-%@example.local'
  AND CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(nd.email, '@', 1), '-', -1) AS UNSIGNED) <= 128
LIMIT 128;

INSERT IGNORE INTO danh_gia (nguoi_dung_id, san_pham_id, so_sao, noi_dung, trang_thai)
SELECT nd.id, sp.id, IF(MOD(nd.id, 10)=0, 4, 5), 'Sản phẩm tốt, dịu nhẹ và dễ sử dụng.', 'DA_DUYET'
FROM nguoi_dung nd
JOIN san_pham sp ON sp.ma_san_pham = 'COMBO-DD-MINI'
WHERE nd.email LIKE 'seed-review-%@example.local'
  AND CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(nd.email, '@', 1), '-', -1) AS UNSIGNED) <= 54
LIMIT 54;

UPDATE danh_gia dg
INNER JOIN nguoi_dung nd ON nd.id=dg.nguoi_dung_id
INNER JOIN san_pham sp ON sp.id=dg.san_pham_id
SET dg.so_sao=5,
    dg.noi_dung='Da mình cải thiện rõ rệt sau 2 tuần sử dụng. Sản phẩm lành tính, không gây kích ứng.'
WHERE nd.email='seed-review-1@example.local' AND sp.ma_san_pham='COMBO-DD-3';

UPDATE danh_gia dg
INNER JOIN nguoi_dung nd ON nd.id=dg.nguoi_dung_id
INNER JOIN san_pham sp ON sp.id=dg.san_pham_id
SET dg.so_sao=5,
    dg.noi_dung='Toner thấm nhanh, không nhờn rít. Mùi thơm nhẹ, rất dễ chịu.'
WHERE nd.email='seed-review-2@example.local' AND sp.ma_san_pham='TONER-DD-150';

UPDATE danh_gia dg
INNER JOIN nguoi_dung nd ON nd.id=dg.nguoi_dung_id
INNER JOIN san_pham sp ON sp.id=dg.san_pham_id
SET dg.so_sao=5,
    dg.noi_dung='Rửa mặt sạch sâu nhưng không khô da. Sẽ ủng hộ lâu dài!'
WHERE nd.email='seed-review-3@example.local' AND sp.ma_san_pham='SRM-DD-150';
