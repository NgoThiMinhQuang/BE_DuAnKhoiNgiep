CREATE TABLE IF NOT EXISTS lich_su_quyen_nguoi_dung (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nguoi_dung_id INT UNSIGNED NOT NULL,
  nguoi_thuc_hien_id INT UNSIGNED NOT NULL,
  vai_tro_cu ENUM('ADMIN', 'KHACH_HANG') NOT NULL,
  vai_tro_moi ENUM('ADMIN', 'KHACH_HANG') NOT NULL,
  trang_thai_cu ENUM('HOAT_DONG', 'BI_KHOA') NOT NULL,
  trang_thai_moi ENUM('HOAT_DONG', 'BI_KHOA') NOT NULL,
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lsqnd_nguoi_dung (nguoi_dung_id, ngay_tao),
  CONSTRAINT fk_lsqnd_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_lsqnd_nguoi_thuc_hien FOREIGN KEY (nguoi_thuc_hien_id) REFERENCES nguoi_dung(id)
) ENGINE=InnoDB;
