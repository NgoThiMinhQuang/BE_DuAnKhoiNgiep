USE rubeanora_store;

CREATE TABLE IF NOT EXISTS binh_luan_bai_viet (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  bai_viet_id INT UNSIGNED NOT NULL,
  ho_ten VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  noi_dung TEXT NOT NULL,
  trang_thai ENUM('CHO_DUYET','DA_DUYET','TU_CHOI') NOT NULL DEFAULT 'CHO_DUYET',
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_binh_luan_bai_viet (bai_viet_id),
  KEY idx_binh_luan_trang_thai (trang_thai),
  CONSTRAINT fk_binh_luan_bai_viet FOREIGN KEY (bai_viet_id) REFERENCES bai_viet(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO bai_viet (
  chuyen_muc, tieu_de, duong_dan, tom_tat, noi_dung, anh_dai_dien_url,
  la_noi_bat, luot_xem, trang_thai, ngay_dang
)
VALUES
  ('Cẩm nang làm đẹp', '5 lợi ích của đậu đỏ đối với làn da bạn nên biết', '5-loi-ich-cua-dau-do-doi-voi-lan-da',
   'Đậu đỏ chứa nhiều vitamin và chất chống oxy hóa, giúp làm sạch nhẹ nhàng, hỗ trợ da sáng khỏe và mịn màng hơn.',
   JSON_OBJECT('lead', 'Không chỉ là một loại thực phẩm quen thuộc, đậu đỏ còn được ứng dụng trong chăm sóc da nhờ nguồn dưỡng chất tự nhiên và khả năng làm sạch dịu nhẹ.', 'sections', JSON_ARRAY(
     JSON_OBJECT('heading','1. Hỗ trợ làm sạch da nhẹ nhàng','paragraphs',JSON_ARRAY('Bột đậu đỏ có kết cấu mịn, giúp lấy đi bụi bẩn và lớp tế bào cũ trên bề mặt da. Khi được sử dụng đúng cách, nguyên liệu này mang lại cảm giác sạch thoáng mà không làm da bị khô căng.')),
     JSON_OBJECT('heading','2. Giúp làn da trông sáng và đều màu hơn','paragraphs',JSON_ARRAY('Đậu đỏ chứa vitamin nhóm B cùng các hợp chất chống oxy hóa. Việc làm sạch đều đặn kết hợp dưỡng ẩm và chống nắng giúp bề mặt da tươi sáng, mịn màng hơn theo thời gian.')),
     JSON_OBJECT('heading','3. Hỗ trợ duy trì độ ẩm tự nhiên','paragraphs',JSON_ARRAY('Các sản phẩm chăm sóc da từ đậu đỏ được phát triển theo hướng dịu nhẹ, kết hợp thành phần cấp ẩm để hạn chế cảm giác khô ráp sau khi làm sạch.')),
     JSON_OBJECT('heading','4. Góp phần bảo vệ da trước tác động môi trường','paragraphs',JSON_ARRAY('Chất chống oxy hóa giúp hỗ trợ làn da trước những tác động thường gặp như khói bụi và ánh nắng. Tuy nhiên, bạn vẫn cần sử dụng kem chống nắng mỗi ngày và che chắn da khi ra ngoài.')),
     JSON_OBJECT('heading','5. Phù hợp với chu trình chăm sóc da tối giản','paragraphs',JSON_ARRAY('Một chu trình cơ bản gồm sữa rửa mặt, sản phẩm tẩy tế bào chết dùng với tần suất phù hợp và toner cấp ẩm đã có thể đáp ứng nhu cầu chăm sóc hằng ngày.'))
   )), '/images/products/combo-3mon.jpg', 1, 0, 'DA_DANG', '2026-06-15 08:00:00'),

  ('Cẩm nang làm đẹp', 'Chu trình chăm sóc da 3 bước đơn giản mỗi ngày', 'chu-trinh-cham-soc-da-3-buoc',
   'Làm sạch, loại bỏ tế bào chết và cân bằng độ ẩm là ba bước cơ bản giúp làn da duy trì vẻ tươi sáng tự nhiên.',
   JSON_OBJECT('lead','Một chu trình chăm sóc da không cần quá nhiều bước. Điều quan trọng là chọn đúng sản phẩm và duy trì thói quen đều đặn.','sections',JSON_ARRAY(
     JSON_OBJECT('heading','Bước 1: Làm sạch','paragraphs',JSON_ARRAY('Rửa mặt vào buổi sáng và buổi tối để loại bỏ dầu thừa, bụi bẩn và cặn sản phẩm trên da. Massage nhẹ nhàng, tránh chà xát mạnh.')),
     JSON_OBJECT('heading','Bước 2: Làm sạch lớp tế bào cũ','paragraphs',JSON_ARRAY('Sử dụng sản phẩm tẩy tế bào chết từ một đến hai lần mỗi tuần tùy tình trạng da. Không nên dùng khi da đang kích ứng hoặc có tổn thương hở.')),
     JSON_OBJECT('heading','Bước 3: Cân bằng và cấp ẩm','paragraphs',JSON_ARRAY('Toner giúp làm dịu và bổ sung độ ẩm sau bước làm sạch. Ban ngày, hãy hoàn thiện chu trình bằng kem chống nắng phù hợp.'))
   )), '/images/products/combo-3mon7.jpg', 1, 0, 'DA_DANG', '2026-06-10 08:00:00'),

  ('Cẩm nang làm đẹp', 'Cách chọn sữa rửa mặt dịu nhẹ cho từng loại da', 'cach-chon-sua-rua-mat-diu-nhe',
   'Một sản phẩm làm sạch phù hợp sẽ giúp loại bỏ bụi bẩn mà không khiến da khô căng hay mất đi độ ẩm cần thiết.',
   JSON_OBJECT('lead','Làm sạch là bước đầu tiên và cũng là nền tảng của mọi chu trình dưỡng da. Mỗi loại da sẽ cần một cách lựa chọn khác nhau.','sections',JSON_ARRAY(
     JSON_OBJECT('heading','Da dầu và da hỗn hợp','paragraphs',JSON_ARRAY('Ưu tiên sản phẩm tạo bọt mịn, làm sạch tốt nhưng không khiến bề mặt da khô rít. Sau khi rửa, da nên giữ được cảm giác mềm và dễ chịu.')),
     JSON_OBJECT('heading','Da khô và da nhạy cảm','paragraphs',JSON_ARRAY('Nên chọn công thức dịu nhẹ, hạn chế hương liệu mạnh và chú trọng thành phần giữ ẩm. Luôn thử sản phẩm trên vùng da nhỏ trước khi dùng thường xuyên.')),
     JSON_OBJECT('heading','Dấu hiệu sản phẩm phù hợp','paragraphs',JSON_ARRAY('Da không bị căng, ngứa hoặc đỏ sau khi rửa. Nếu xuất hiện khó chịu kéo dài, hãy ngừng sử dụng và tham khảo ý kiến chuyên gia da liễu.'))
   )), '/images/products/sua-rua-mat-tao-bot3.jpg', 1, 0, 'DA_DANG', '2026-06-05 08:00:00'),

  ('Cẩm nang làm đẹp', 'Tẩy tế bào chết đúng cách để da luôn mịn màng', 'tay-te-bao-chet-dung-cach',
   'Tần suất và cách sử dụng phù hợp giúp làm sạch lớp da cũ hiệu quả, đồng thời hạn chế cảm giác kích ứng trên da.',
   JSON_OBJECT('lead','Tẩy tế bào chết đúng cách hỗ trợ bề mặt da thông thoáng và mịn hơn, nhưng sử dụng quá thường xuyên có thể khiến da nhạy cảm.','sections',JSON_ARRAY(
     JSON_OBJECT('heading','Chọn tần suất phù hợp','paragraphs',JSON_ARRAY('Phần lớn làn da chỉ cần tẩy tế bào chết từ một đến hai lần mỗi tuần. Với da nhạy cảm, nên bắt đầu ở tần suất thấp hơn.')),
     JSON_OBJECT('heading','Thao tác nhẹ nhàng','paragraphs',JSON_ARRAY('Thoa sản phẩm trên da ẩm và massage nhẹ theo hướng vòng tròn. Không chà xát vào vùng da đang viêm, trầy xước hoặc kích ứng.')),
     JSON_OBJECT('heading','Dưỡng da sau khi sử dụng','paragraphs',JSON_ARRAY('Cấp ẩm và chống nắng đầy đủ giúp da được bảo vệ tốt hơn sau bước làm sạch lớp tế bào cũ.'))
   )), '/images/products/mat-na-tay-te-bao-chet6.jpg', 0, 0, 'DA_DANG', '2026-05-28 08:00:00'),

  ('Cẩm nang làm đẹp', 'Toner đậu đỏ có vai trò gì trong chu trình dưỡng da?', 'toner-dau-do-co-vai-tro-gi',
   'Toner giúp cân bằng da sau bước làm sạch, cấp ẩm nhẹ và chuẩn bị cho da hấp thu các sản phẩm dưỡng tiếp theo.',
   JSON_OBJECT('lead','Toner là bước chuyển tiếp giữa làm sạch và dưỡng ẩm, đặc biệt hữu ích khi làn da cần được làm dịu và bổ sung nước.','sections',JSON_ARRAY(
     JSON_OBJECT('heading','Cân bằng cảm giác trên da','paragraphs',JSON_ARRAY('Sau khi rửa mặt, toner hỗ trợ làm dịu cảm giác căng và giúp bề mặt da mềm hơn trước các bước dưỡng tiếp theo.')),
     JSON_OBJECT('heading','Cách sử dụng','paragraphs',JSON_ARRAY('Cho một lượng vừa đủ ra lòng bàn tay hoặc bông mềm, sau đó vỗ nhẹ lên da. Không cần chà xát hay sử dụng quá nhiều sản phẩm.')),
     JSON_OBJECT('heading','Lưu ý khi lựa chọn','paragraphs',JSON_ARRAY('Ưu tiên công thức phù hợp với loại da và tránh thành phần từng gây kích ứng cho bạn. Toner không thay thế kem dưỡng hoặc kem chống nắng.'))
   )), '/images/products/toner-duong-da4.jpg', 0, 0, 'DA_DANG', '2026-05-22 08:00:00'),

  ('Cẩm nang làm đẹp', 'Bí quyết chăm sóc da sáng khỏe từ nguyên liệu Việt', 'bi-quyet-cham-soc-da-tu-nguyen-lieu-viet',
   'Những nguyên liệu gần gũi như đậu đỏ đang trở thành lựa chọn được yêu thích trong xu hướng làm đẹp lành tính.',
   JSON_OBJECT('lead','Nguyên liệu Việt có tiềm năng lớn trong ngành mỹ phẩm khi được nghiên cứu, xử lý và kết hợp trong công thức phù hợp.','sections',JSON_ARRAY(
     JSON_OBJECT('heading','Lựa chọn sản phẩm có thông tin rõ ràng','paragraphs',JSON_ARRAY('Nguồn gốc nguyên liệu, thành phần, hướng dẫn sử dụng và hạn dùng là những thông tin cần kiểm tra trước khi mua mỹ phẩm.')),
     JSON_OBJECT('heading','Duy trì thói quen đều đặn','paragraphs',JSON_ARRAY('Hiệu quả chăm sóc da đến từ sự kiên trì. Làm sạch, dưỡng ẩm, chống nắng và sinh hoạt lành mạnh nên được duy trì mỗi ngày.')),
     JSON_OBJECT('heading','Lắng nghe làn da','paragraphs',JSON_ARRAY('Không phải nguyên liệu thiên nhiên nào cũng phù hợp với tất cả mọi người. Hãy ngừng dùng sản phẩm nếu da xuất hiện dấu hiệu khó chịu bất thường.'))
   )), '/images/products/combo-duong-da-mini2.jpg', 0, 0, 'DA_DANG', '2026-05-16 08:00:00')
ON DUPLICATE KEY UPDATE
  chuyen_muc=VALUES(chuyen_muc), tieu_de=VALUES(tieu_de), tom_tat=VALUES(tom_tat),
  noi_dung=VALUES(noi_dung), anh_dai_dien_url=VALUES(anh_dai_dien_url),
  la_noi_bat=VALUES(la_noi_bat), trang_thai=VALUES(trang_thai), ngay_dang=VALUES(ngay_dang);
