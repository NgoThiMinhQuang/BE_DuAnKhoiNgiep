CREATE TABLE IF NOT EXISTS cau_hoi_thuong_gap (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  intent VARCHAR(50) NOT NULL,
  noi_dung TEXT NOT NULL,
  trang_thai ENUM('HOAT_DONG','TAM_AN') NOT NULL DEFAULT 'HOAT_DONG',
  PRIMARY KEY (id), UNIQUE KEY uk_chttg_intent (intent)
) ENGINE=InnoDB;

INSERT IGNORE INTO cau_hoi_thuong_gap (intent, noi_dung) VALUES
('DELIVERY_TIME','Thời gian giao hàng dự kiến từ 2–5 ngày làm việc, tùy khu vực.'),
('RETURN_POLICY','Vui lòng giữ nguyên sản phẩm, bao bì và hóa đơn rồi liên hệ hỗ trợ để kiểm tra điều kiện đổi trả.');

CREATE TABLE IF NOT EXISTS phien_chat (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nguoi_dung_id INT UNSIGNED NOT NULL,
  kenh ENUM('BOT','NGUOI_BAN') NOT NULL DEFAULT 'BOT',
  trang_thai ENUM('DANG_MO','DA_DONG') NOT NULL DEFAULT 'DANG_MO',
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_pc_user (nguoi_dung_id, kenh, trang_thai),
  FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tin_nhan_chat (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  phien_chat_id BIGINT UNSIGNED NOT NULL,
  loai_nguoi_gui ENUM('KHACH_HANG','BOT','ADMIN') NOT NULL,
  noi_dung TEXT NOT NULL,
  intent VARCHAR(50) NULL,
  da_doc_luc DATETIME NULL,
  ngay_gui DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_tnc_session (phien_chat_id, id),
  FOREIGN KEY (phien_chat_id) REFERENCES phien_chat(id) ON DELETE CASCADE
) ENGINE=InnoDB;
