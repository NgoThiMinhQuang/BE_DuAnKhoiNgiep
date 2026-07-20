CREATE TABLE IF NOT EXISTS lich_su_trang_thai_thanh_toan (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  don_hang_id INT UNSIGNED NOT NULL,
  nguoi_thuc_hien_id INT UNSIGNED NULL,
  trang_thai_cu ENUM('CHUA_THANH_TOAN', 'DA_THANH_TOAN', 'THAT_BAI', 'DA_HOAN_TIEN') NOT NULL,
  trang_thai_moi ENUM('CHUA_THANH_TOAN', 'DA_THANH_TOAN', 'THAT_BAI', 'DA_HOAN_TIEN') NOT NULL,
  nguon ENUM('SEPAY_WEBHOOK', 'COD_GIAO_HANG', 'HOAN_TIEN') NOT NULL,
  ly_do VARCHAR(500) NOT NULL,
  du_lieu_doi_chieu JSON NULL,
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lstttt_don_hang (don_hang_id, ngay_tao),
  CONSTRAINT fk_lstttt_don_hang FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE,
  CONSTRAINT fk_lstttt_nguoi_thuc_hien FOREIGN KEY (nguoi_thuc_hien_id)
    REFERENCES nguoi_dung(id) ON DELETE SET NULL
) ENGINE=InnoDB;
