USE rubeanora_store;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Workbench có thể bật Safe Update Mode và chặn thao tác làm mới thư viện ảnh.
-- Lưu trạng thái hiện tại để khôi phục sau khi hoàn tất.
SET @sql_safe_updates_cu := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;

-- ================================================================
-- 1. CẤU HÌNH CỬA HÀNG
-- ================================================================

INSERT INTO cau_hinh_cua_hang (
  ten_cua_hang, logo_url, mo_ta, hotline, email, dia_chi, gio_lam_viec,
  phi_van_chuyen, nguong_mien_phi_van_chuyen,
  facebook_url, instagram_url, tiktok_url
)
SELECT
  'Rubeanora',
  '/images/logo1.png',
  'Rubeanora phát triển các sản phẩm chăm sóc da từ hạt đậu đỏ Việt Nam, kết hợp cùng những thành phần thiên nhiên được chọn lọc. Công thức dịu nhẹ giúp làm sạch, cấp ẩm và nuôi dưỡng làn da sáng khỏe mỗi ngày.',
  '0986126955',
  'Hoangthingocmai2005@gmail.com',
  'Cầu Treo, Yên Mỹ, Hưng Yên',
  '08:00 - 21:00, Thứ Hai - Chủ Nhật',
  30000,
  300000,
  'https://facebook.com/',
  'https://instagram.com/',
  'https://tiktok.com/'
WHERE NOT EXISTS (SELECT 1 FROM cau_hinh_cua_hang);

SET @cau_hinh_id := (SELECT MIN(id) FROM cau_hinh_cua_hang);

UPDATE cau_hinh_cua_hang
SET
  ten_cua_hang = 'Rubeanora',
  logo_url = '/images/logo1.png',
  mo_ta = 'Rubeanora phát triển các sản phẩm chăm sóc da từ hạt đậu đỏ Việt Nam, kết hợp cùng những thành phần thiên nhiên được chọn lọc. Công thức dịu nhẹ giúp làm sạch, cấp ẩm và nuôi dưỡng làn da sáng khỏe mỗi ngày.',
  hotline = '0986126955',
  email = 'Hoangthingocmai2005@gmail.com',
  dia_chi = 'Cầu Treo, Yên Mỹ, Hưng Yên',
  gio_lam_viec = '08:00 - 21:00, Thứ Hai - Chủ Nhật',
  phi_van_chuyen = 30000,
  nguong_mien_phi_van_chuyen = 300000,
  facebook_url = 'https://facebook.com/',
  instagram_url = 'https://instagram.com/',
  tiktok_url = 'https://tiktok.com/'
WHERE id = @cau_hinh_id;

-- ================================================================
-- 2. BỐN DANH MỤC
-- ================================================================

INSERT INTO danh_muc_san_pham (
  ten_danh_muc, duong_dan, mo_ta, hinh_anh_url, thu_tu_hien_thi, trang_thai
)
VALUES
  ('Sữa rửa mặt', 'sua-rua-mat', 'Sản phẩm làm sạch da mặt dịu nhẹ.', '/images/products/sua-rua-mat-tao-bot4.png', 1, 'HOAT_DONG'),
  ('Mặt nạ', 'mat-na', 'Mặt nạ chăm sóc và làm sạch tế bào chết.', '/images/products/mat-na-tay-te-bao-chet4.png', 2, 'HOAT_DONG'),
  ('Toner', 'toner', 'Sản phẩm cân bằng, làm dịu và dưỡng ẩm da.', '/images/products/toner-duong-da6.png', 3, 'HOAT_DONG'),
  ('Combo', 'combo', 'Bộ sản phẩm chăm sóc da đậu đỏ.', '/images/products/combo_ref1.png', 4, 'HOAT_DONG')
ON DUPLICATE KEY UPDATE
  ten_danh_muc = VALUES(ten_danh_muc),
  mo_ta = VALUES(mo_ta),
  hinh_anh_url = VALUES(hinh_anh_url),
  thu_tu_hien_thi = VALUES(thu_tu_hien_thi),
  trang_thai = VALUES(trang_thai);

-- ================================================================
-- 3. NĂM SẢN PHẨM: 3 SẢN PHẨM ĐƠN VÀ 2 COMBO
-- ================================================================

INSERT INTO san_pham (
  danh_muc_id, ma_san_pham, ma_sku, ten_san_pham, duong_dan,
  loai_san_pham, mo_ta_ngan, mo_ta_chi_tiet,
  thanh_phan, cong_dung, huong_dan_su_dung,
  quy_cach, xuat_xu, anh_chinh_url,
  gia_niem_yet, gia_ban, gia_von,
  so_luong_ton, ton_toi_thieu, la_noi_bat, trang_thai
)
VALUES
  (
    (SELECT id FROM danh_muc_san_pham WHERE duong_dan = 'sua-rua-mat'),
    'SRM-DD-150', 'RB-SRM-150',
    'Sữa rửa mặt tạo bọt đậu đỏ 150g',
    'sua-rua-mat-tao-bot-dau-do-150g',
    'DON',
    'Làm sạch sâu nhưng vẫn dịu nhẹ và duy trì độ ẩm tự nhiên cho da.',
    'Sữa rửa mặt tạo bọt giúp loại bỏ bụi bẩn, bã nhờn và mồ hôi trên da một cách dịu nhẹ, giúp da mềm mại và sáng mịn.',
    'Chiết xuất đậu đỏ,Chiết xuất hoa cúc La Mã,Niacinamide,Panthenol',
    'Làm sạch sâu,Dưỡng ẩm,Sáng da',
    'Làm ướt mặt, lấy một lượng vừa đủ, tạo bọt và massage nhẹ nhàng trong 30 đến 60 giây. Rửa sạch với nước.',
    '150g', 'Việt Nam', '/images/products/sua-rua-mat-tao-bot4.png',
    220000, 220000, 120000, 100, 10, 1, 'DANG_BAN'
  ),
  (
    (SELECT id FROM danh_muc_san_pham WHERE duong_dan = 'mat-na'),
    'MN-DD-150', 'RB-MN-150',
    'Mặt nạ tẩy tế bào chết đậu đỏ 150g',
    'mat-na-tay-te-bao-chet-dau-do-150g',
    'DON',
    'Làm sạch tế bào chết, hỗ trợ da mịn màng và sáng khỏe.',
    'Mặt nạ giúp làm sạch tế bào chết, hỗ trợ da ẩm mượt, sáng khỏe và mềm mại.',
    'Hyaluronic Acid,Niacinamide,Bột đậu đỏ,Bột cám gạo',
    'Tẩy tế bào chết,Sáng da,Dưỡng ẩm',
    'Thoa một lớp mỏng lên da sạch, tránh vùng mắt và môi. Massage nhẹ rồi rửa sạch sau 10 đến 15 phút. Dùng 1 đến 2 lần mỗi tuần.',
    '150g', 'Việt Nam', '/images/products/mat-na-tay-te-bao-chet4.png',
    250000, 250000, 135000, 100, 10, 1, 'DANG_BAN'
  ),
  (
    (SELECT id FROM danh_muc_san_pham WHERE duong_dan = 'toner'),
    'TONER-DD-150', 'RB-TONER-150',
    'Toner dưỡng da đậu đỏ 150ml',
    'toner-duong-da-dau-do',
    'DON',
    'Cấp ẩm, làm dịu và cân bằng da sau bước làm sạch.',
    'Toner giúp dưỡng ẩm, làm dịu da khô căng và cân bằng da sau bước làm sạch.',
    'Chiết xuất đậu đỏ,Chiết xuất hoa cúc La Mã,Chiết xuất rễ cam thảo,Nước hoa hồng',
    'Dưỡng ẩm,Làm dịu da,Cân bằng pH',
    'Sau khi rửa mặt, lấy toner ra lòng bàn tay hoặc bông mềm rồi vỗ nhẹ lên da. Sử dụng sáng và tối.',
    '150ml', 'Việt Nam', '/images/products/toner-duong-da6.png',
    220000, 220000, 120000, 100, 10, 1, 'DANG_BAN'
  ),
  (
    (SELECT id FROM danh_muc_san_pham WHERE duong_dan = 'combo'),
    'COMBO-DD-3', 'RB-COMBO-3',
    'Combo chăm sóc da toàn diện đậu đỏ 3 món',
    'combo-cham-soc-da-toan-dien-dau-do-3-mon-150g',
    'COMBO',
    'Combo 3 bước làm sạch, tẩy tế bào chết và cân bằng da.',
    'Bộ combo gồm Sữa rửa mặt tạo bọt đậu đỏ, Mặt nạ tẩy tế bào chết đậu đỏ và Toner dưỡng da đậu đỏ. Combo chăm sóc da toàn diện, phù hợp với nhiều loại da.',
    'Bột đậu đỏ,Bột cám gạo,Chiết xuất nghệ,Nước hoa hồng',
    'Làm sạch sâu,Tẩy tế bào chết,Cấp ẩm và cân bằng da',
    'Sử dụng lần lượt sữa rửa mặt, mặt nạ từ 1 đến 2 lần mỗi tuần và toner sau bước làm sạch.',
    '3 món', 'Việt Nam', '/images/products/combo_ref1.png',
    565000, 480000, 350000, 80, 10, 1, 'DANG_BAN'
  ),
  (
    (SELECT id FROM danh_muc_san_pham WHERE duong_dan = 'combo'),
    'COMBO-DD-MINI', 'RB-COMBO-MINI',
    'Bộ combo dưỡng da đậu đỏ mini',
    'combo-duong-da-dau-do-mini',
    'COMBO',
    'Bộ chăm sóc da nhỏ gọn, tiện lợi khi đi du lịch.',
    'Bộ combo mini gồm các bước làm sạch, tẩy tế bào chết và cân bằng da, nhỏ gọn để mang theo khi đi học, công tác hoặc du lịch.',
    'Bột đậu đỏ,Bột cám gạo,Chiết xuất nghệ,Nước hoa hồng',
    'Mini size,Tiện lợi,Chăm sóc da cơ bản',
    'Sử dụng lần lượt theo thứ tự làm sạch, mặt nạ và cân bằng da. Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp.',
    'Bộ mini', 'Việt Nam', '/images/products/combo-duong-da-mini4.png',
    290000, 290000, 190000, 80, 10, 1, 'DANG_BAN'
  )
ON DUPLICATE KEY UPDATE
  danh_muc_id = VALUES(danh_muc_id),
  ma_sku = VALUES(ma_sku),
  ten_san_pham = VALUES(ten_san_pham),
  duong_dan = VALUES(duong_dan),
  loai_san_pham = VALUES(loai_san_pham),
  mo_ta_ngan = VALUES(mo_ta_ngan),
  mo_ta_chi_tiet = VALUES(mo_ta_chi_tiet),
  thanh_phan = VALUES(thanh_phan),
  cong_dung = VALUES(cong_dung),
  huong_dan_su_dung = VALUES(huong_dan_su_dung),
  quy_cach = VALUES(quy_cach),
  xuat_xu = VALUES(xuat_xu),
  anh_chinh_url = VALUES(anh_chinh_url),
  gia_niem_yet = VALUES(gia_niem_yet),
  gia_ban = VALUES(gia_ban),
  gia_von = VALUES(gia_von),
  so_luong_ton = VALUES(so_luong_ton),
  ton_toi_thieu = VALUES(ton_toi_thieu),
  la_noi_bat = VALUES(la_noi_bat),
  trang_thai = VALUES(trang_thai);

-- Làm mới thư viện ảnh của đúng 5 sản phẩm trên.
-- Xóa theo khóa chính id để tương thích Safe Update Mode.
DELETE FROM anh_san_pham
WHERE id IN (
  SELECT id
  FROM (
    SELECT asp.id
    FROM anh_san_pham asp
    INNER JOIN san_pham sp ON sp.id = asp.san_pham_id
    WHERE sp.ma_san_pham IN (
      'SRM-DD-150', 'MN-DD-150', 'TONER-DD-150', 'COMBO-DD-3', 'COMBO-DD-MINI'
    )
  ) AS anh_can_xoa
);

INSERT INTO anh_san_pham (
  san_pham_id, duong_dan_anh, alt_text, thu_tu_hien_thi
)
VALUES
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'SRM-DD-150'), '/images/products/sua-rua-mat-tao-bot3.jpg', 'Sữa rửa mặt đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'SRM-DD-150'), '/images/products/sua-rua-mat-tao-bot1.png', 'Sữa rửa mặt đậu đỏ', 2),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'SRM-DD-150'), '/images/products/sua-rua-mat-tao-bot2.png', 'Sữa rửa mặt đậu đỏ', 3),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'SRM-DD-150'), '/images/products/sua-rua-mat-tao-bot4.png', 'Sữa rửa mặt đậu đỏ', 4),

  ((SELECT id FROM san_pham WHERE ma_san_pham = 'MN-DD-150'), '/images/products/mat-na-tay-te-bao-chet6.jpg', 'Mặt nạ đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'MN-DD-150'), '/images/products/mat-na-tay-te-bao-chet1.jpg', 'Mặt nạ đậu đỏ', 2),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'MN-DD-150'), '/images/products/mat-na-tay-te-bao-chet2.jpg', 'Mặt nạ đậu đỏ', 3),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'MN-DD-150'), '/images/products/mat-na-tay-te-bao-chet4.png', 'Mặt nạ đậu đỏ', 4),

  ((SELECT id FROM san_pham WHERE ma_san_pham = 'TONER-DD-150'), '/images/products/toner-duong-da4.jpg', 'Toner đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'TONER-DD-150'), '/images/products/toner-duong-da1.png', 'Toner đậu đỏ', 2),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'TONER-DD-150'), '/images/products/toner-duong-da2.jpg', 'Toner đậu đỏ', 3),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'TONER-DD-150'), '/images/products/toner-duong-da3.jpg', 'Toner đậu đỏ', 4),

  ((SELECT id FROM san_pham WHERE ma_san_pham = 'COMBO-DD-3'), '/images/products/combo-3mon6.jpg', 'Combo chăm sóc da đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'COMBO-DD-3'), '/images/products/combo-3mon.jpg', 'Combo chăm sóc da đậu đỏ', 2),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'COMBO-DD-3'), '/images/products/combo-3mon2.png', 'Combo chăm sóc da đậu đỏ', 3),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'COMBO-DD-3'), '/images/products/combo-3mon3.png', 'Combo chăm sóc da đậu đỏ', 4),

  ((SELECT id FROM san_pham WHERE ma_san_pham = 'COMBO-DD-MINI'), '/images/products/combo-duong-da-mini4.png', 'Combo mini đậu đỏ', 1),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'COMBO-DD-MINI'), '/images/products/combo-duong-da-mini.png', 'Combo mini đậu đỏ', 2),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'COMBO-DD-MINI'), '/images/products/combo-duong-da-mini2.jpg', 'Combo mini đậu đỏ', 3),
  ((SELECT id FROM san_pham WHERE ma_san_pham = 'COMBO-DD-MINI'), '/images/products/combo-duong-da-mini3.jpg', 'Combo mini đậu đỏ', 4);

-- ================================================================
-- 4. SÁU BÀI VIẾT
-- ================================================================

SET @tac_gia_admin_id := (
  SELECT MIN(id) FROM nguoi_dung WHERE vai_tro = 'ADMIN'
);

INSERT INTO bai_viet (
  tac_gia_id, chuyen_muc, tieu_de, duong_dan, tom_tat, noi_dung,
  anh_dai_dien_url, la_noi_bat, luot_xem, trang_thai, ngay_dang
)
VALUES
  (
    @tac_gia_admin_id, 'Cẩm nang làm đẹp',
    '5 lợi ích của đậu đỏ đối với làn da bạn nên biết',
    '5-loi-ich-cua-dau-do-doi-voi-lan-da',
    'Đậu đỏ chứa nhiều vitamin và chất chống oxy hóa, giúp làm sạch nhẹ nhàng, hỗ trợ da sáng khỏe và mịn màng hơn.',
    JSON_OBJECT(
      'lead', 'Không chỉ là một loại thực phẩm quen thuộc, đậu đỏ còn được ứng dụng trong chăm sóc da nhờ nguồn dưỡng chất tự nhiên và khả năng làm sạch dịu nhẹ.',
      'sections', JSON_ARRAY(
        JSON_OBJECT('heading', '1. Hỗ trợ làm sạch da nhẹ nhàng', 'paragraphs', JSON_ARRAY('Bột đậu đỏ có kết cấu mịn, giúp lấy đi bụi bẩn và lớp tế bào cũ trên bề mặt da mà không gây cảm giác khô căng.')),
        JSON_OBJECT('heading', '2. Giúp da trông sáng và đều màu hơn', 'paragraphs', JSON_ARRAY('Vitamin nhóm B và các hợp chất chống oxy hóa hỗ trợ duy trì bề mặt da tươi sáng, mịn màng khi sử dụng đều đặn.')),
        JSON_OBJECT('heading', '3. Phù hợp với chu trình tối giản', 'paragraphs', JSON_ARRAY('Đậu đỏ có thể xuất hiện trong bước làm sạch, mặt nạ và chăm sóc cân bằng da hằng ngày.'))
      )
    ),
    '/images/products/combo-3mon.jpg', 1, 0, 'DA_DANG', '2026-06-15 08:00:00'
  ),
  (
    @tac_gia_admin_id, 'Cẩm nang làm đẹp',
    'Chu trình chăm sóc da 3 bước đơn giản mỗi ngày',
    'chu-trinh-cham-soc-da-3-buoc',
    'Làm sạch, loại bỏ tế bào chết và cân bằng độ ẩm là ba bước cơ bản giúp làn da duy trì vẻ tươi sáng tự nhiên.',
    JSON_OBJECT(
      'lead', 'Một chu trình chăm sóc da không cần quá nhiều bước. Điều quan trọng là chọn đúng sản phẩm và duy trì thói quen đều đặn.',
      'sections', JSON_ARRAY(
        JSON_OBJECT('heading', 'Bước 1: Làm sạch', 'paragraphs', JSON_ARRAY('Rửa mặt vào buổi sáng và buổi tối để loại bỏ dầu thừa, bụi bẩn và cặn sản phẩm trên da.')),
        JSON_OBJECT('heading', 'Bước 2: Làm sạch lớp tế bào cũ', 'paragraphs', JSON_ARRAY('Sử dụng sản phẩm tẩy tế bào chết từ một đến hai lần mỗi tuần tùy tình trạng da.')),
        JSON_OBJECT('heading', 'Bước 3: Cân bằng và cấp ẩm', 'paragraphs', JSON_ARRAY('Toner giúp làm dịu và bổ sung độ ẩm sau bước làm sạch. Ban ngày cần sử dụng thêm kem chống nắng.'))
      )
    ),
    '/images/products/combo-3mon7.jpg', 1, 0, 'DA_DANG', '2026-06-10 08:00:00'
  ),
  (
    @tac_gia_admin_id, 'Cẩm nang làm đẹp',
    'Cách chọn sữa rửa mặt dịu nhẹ cho từng loại da',
    'cach-chon-sua-rua-mat-diu-nhe',
    'Một sản phẩm làm sạch phù hợp sẽ giúp loại bỏ bụi bẩn mà không khiến da khô căng hay mất đi độ ẩm cần thiết.',
    JSON_OBJECT(
      'lead', 'Làm sạch là bước đầu tiên và cũng là nền tảng của mọi chu trình dưỡng da. Mỗi loại da sẽ cần một cách lựa chọn khác nhau.',
      'sections', JSON_ARRAY(
        JSON_OBJECT('heading', 'Da dầu và da hỗn hợp', 'paragraphs', JSON_ARRAY('Ưu tiên sản phẩm tạo bọt mịn, làm sạch tốt nhưng không khiến bề mặt da khô rít.')),
        JSON_OBJECT('heading', 'Da khô và da nhạy cảm', 'paragraphs', JSON_ARRAY('Nên chọn công thức dịu nhẹ, hạn chế hương liệu mạnh và chú trọng thành phần giữ ẩm.')),
        JSON_OBJECT('heading', 'Dấu hiệu sản phẩm phù hợp', 'paragraphs', JSON_ARRAY('Da không bị căng, ngứa hoặc đỏ sau khi rửa. Nếu xuất hiện khó chịu kéo dài, hãy ngừng sử dụng.'))
      )
    ),
    '/images/products/sua-rua-mat-tao-bot3.jpg', 1, 0, 'DA_DANG', '2026-06-05 08:00:00'
  ),
  (
    @tac_gia_admin_id, 'Cẩm nang làm đẹp',
    'Tẩy tế bào chết đúng cách để da luôn mịn màng',
    'tay-te-bao-chet-dung-cach',
    'Tần suất và cách sử dụng phù hợp giúp làm sạch lớp da cũ hiệu quả, đồng thời hạn chế cảm giác kích ứng trên da.',
    JSON_OBJECT(
      'lead', 'Tẩy tế bào chết đúng cách hỗ trợ bề mặt da thông thoáng và mịn hơn, nhưng dùng quá thường xuyên có thể khiến da nhạy cảm.',
      'sections', JSON_ARRAY(
        JSON_OBJECT('heading', 'Chọn tần suất phù hợp', 'paragraphs', JSON_ARRAY('Phần lớn làn da chỉ cần tẩy tế bào chết từ một đến hai lần mỗi tuần.')),
        JSON_OBJECT('heading', 'Thao tác nhẹ nhàng', 'paragraphs', JSON_ARRAY('Thoa sản phẩm trên da ẩm và massage nhẹ theo hướng vòng tròn, tránh vùng da đang tổn thương.')),
        JSON_OBJECT('heading', 'Dưỡng da sau khi sử dụng', 'paragraphs', JSON_ARRAY('Cấp ẩm và chống nắng đầy đủ giúp da được bảo vệ tốt hơn sau bước tẩy tế bào chết.'))
      )
    ),
    '/images/products/mat-na-tay-te-bao-chet6.jpg', 0, 0, 'DA_DANG', '2026-05-28 08:00:00'
  ),
  (
    @tac_gia_admin_id, 'Cẩm nang làm đẹp',
    'Toner đậu đỏ có vai trò gì trong chu trình dưỡng da?',
    'toner-dau-do-co-vai-tro-gi',
    'Toner giúp cân bằng da sau bước làm sạch, cấp ẩm nhẹ và chuẩn bị cho da hấp thu các sản phẩm dưỡng tiếp theo.',
    JSON_OBJECT(
      'lead', 'Toner là bước chuyển tiếp giữa làm sạch và dưỡng ẩm, đặc biệt hữu ích khi làn da cần được làm dịu và bổ sung nước.',
      'sections', JSON_ARRAY(
        JSON_OBJECT('heading', 'Cân bằng cảm giác trên da', 'paragraphs', JSON_ARRAY('Sau khi rửa mặt, toner hỗ trợ làm dịu cảm giác căng và giúp bề mặt da mềm hơn.')),
        JSON_OBJECT('heading', 'Cách sử dụng', 'paragraphs', JSON_ARRAY('Cho một lượng vừa đủ ra lòng bàn tay hoặc bông mềm, sau đó vỗ nhẹ lên da.')),
        JSON_OBJECT('heading', 'Lưu ý khi lựa chọn', 'paragraphs', JSON_ARRAY('Ưu tiên công thức phù hợp với loại da và tránh thành phần từng gây kích ứng cho bạn.'))
      )
    ),
    '/images/products/toner-duong-da4.jpg', 0, 0, 'DA_DANG', '2026-05-22 08:00:00'
  ),
  (
    @tac_gia_admin_id, 'Cẩm nang làm đẹp',
    'Bí quyết chăm sóc da sáng khỏe từ nguyên liệu Việt',
    'bi-quyet-cham-soc-da-tu-nguyen-lieu-viet',
    'Những nguyên liệu gần gũi như đậu đỏ đang trở thành lựa chọn được yêu thích trong xu hướng làm đẹp lành tính.',
    JSON_OBJECT(
      'lead', 'Nguyên liệu Việt có tiềm năng lớn trong ngành mỹ phẩm khi được nghiên cứu, xử lý và kết hợp trong công thức phù hợp.',
      'sections', JSON_ARRAY(
        JSON_OBJECT('heading', 'Lựa chọn sản phẩm có thông tin rõ ràng', 'paragraphs', JSON_ARRAY('Nguồn gốc nguyên liệu, thành phần, hướng dẫn sử dụng và hạn dùng là những thông tin cần kiểm tra trước khi mua mỹ phẩm.')),
        JSON_OBJECT('heading', 'Duy trì thói quen đều đặn', 'paragraphs', JSON_ARRAY('Hiệu quả chăm sóc da đến từ sự kiên trì trong làm sạch, dưỡng ẩm, chống nắng và sinh hoạt lành mạnh.')),
        JSON_OBJECT('heading', 'Lắng nghe làn da', 'paragraphs', JSON_ARRAY('Không phải nguyên liệu thiên nhiên nào cũng phù hợp với tất cả mọi người. Hãy ngừng dùng nếu da xuất hiện dấu hiệu khó chịu.'))
      )
    ),
    '/images/products/combo-duong-da-mini2.jpg', 0, 0, 'DA_DANG', '2026-05-16 08:00:00'
  )
ON DUPLICATE KEY UPDATE
  tac_gia_id = VALUES(tac_gia_id),
  chuyen_muc = VALUES(chuyen_muc),
  tieu_de = VALUES(tieu_de),
  tom_tat = VALUES(tom_tat),
  noi_dung = VALUES(noi_dung),
  anh_dai_dien_url = VALUES(anh_dai_dien_url),
  la_noi_bat = VALUES(la_noi_bat),
  trang_thai = VALUES(trang_thai),
  ngay_dang = VALUES(ngay_dang);

COMMIT;

SET SQL_SAFE_UPDATES = @sql_safe_updates_cu;

-- ================================================================
-- 5. KIỂM TRA KẾT QUẢ
-- ================================================================

SELECT COUNT(*) AS so_cau_hinh FROM cau_hinh_cua_hang;
SELECT COUNT(*) AS so_danh_muc FROM danh_muc_san_pham WHERE trang_thai = 'HOAT_DONG';
SELECT
  SUM(loai_san_pham = 'DON') AS so_san_pham_don,
  SUM(loai_san_pham = 'COMBO') AS so_combo
FROM san_pham
WHERE ma_san_pham IN (
  'SRM-DD-150', 'MN-DD-150', 'TONER-DD-150', 'COMBO-DD-3', 'COMBO-DD-MINI'
);
SELECT COUNT(*) AS so_bai_viet
FROM bai_viet
WHERE duong_dan IN (
  '5-loi-ich-cua-dau-do-doi-voi-lan-da',
  'chu-trinh-cham-soc-da-3-buoc',
  'cach-chon-sua-rua-mat-diu-nhe',
  'tay-te-bao-chet-dung-cach',
  'toner-dau-do-co-vai-tro-gi',
  'bi-quyet-cham-soc-da-tu-nguyen-lieu-viet'
);
