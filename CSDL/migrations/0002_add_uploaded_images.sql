CREATE TABLE IF NOT EXISTS tep_anh (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nguoi_tai_len_id INT UNSIGNED NULL,
  ten_tep VARCHAR(255) NOT NULL,
  loai_mime VARCHAR(100) NOT NULL,
  kich_thuoc INT UNSIGNED NOT NULL,
  du_lieu MEDIUMBLOB NOT NULL,
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tep_anh_nguoi_tai_len (nguoi_tai_len_id),
  CONSTRAINT fk_tep_anh_nguoi_tai_len
    FOREIGN KEY (nguoi_tai_len_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
