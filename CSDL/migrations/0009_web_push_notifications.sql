CREATE TABLE IF NOT EXISTS thong_bao (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nguoi_dung_id INT UNSIGNED NOT NULL,
  loai VARCHAR(50) NOT NULL,
  tieu_de VARCHAR(255) NOT NULL,
  noi_dung VARCHAR(1000) NOT NULL,
  duong_dan VARCHAR(500) NULL,
  da_doc TINYINT UNSIGNED NOT NULL DEFAULT 0,
  ngay_doc DATETIME NULL,
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_thong_bao_nguoi_dung (nguoi_dung_id, da_doc, ngay_tao),
  CONSTRAINT fk_thong_bao_nguoi_dung FOREIGN KEY (nguoi_dung_id)
    REFERENCES nguoi_dung(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dang_ky_push (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nguoi_dung_id INT UNSIGNED NOT NULL,
  endpoint VARCHAR(1000) NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  user_agent VARCHAR(500) NULL,
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_dang_ky_push_endpoint (endpoint(500)),
  KEY idx_dang_ky_push_nguoi_dung (nguoi_dung_id),
  CONSTRAINT fk_dang_ky_push_nguoi_dung FOREIGN KEY (nguoi_dung_id)
    REFERENCES nguoi_dung(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
