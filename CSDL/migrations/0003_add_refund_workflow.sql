ALTER TABLE giao_dich_thanh_toan
  MODIFY COLUMN trang_thai ENUM(
    'CHO_THANH_TOAN', 'DA_THANH_TOAN', 'HET_HAN', 'DA_HUY',
    'YEU_CAU_HOAN_TIEN', 'DANG_HOAN_TIEN', 'DA_HOAN_TIEN', 'HOAN_TIEN_THAT_BAI'
  ) NOT NULL DEFAULT 'CHO_THANH_TOAN';

CREATE TABLE IF NOT EXISTS yeu_cau_hoan_tien (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  don_hang_id INT UNSIGNED NOT NULL,
  giao_dich_thanh_toan_id BIGINT UNSIGNED NULL,
  nguoi_yeu_cau_id INT UNSIGNED NULL,
  so_tien DECIMAL(15,2) NOT NULL,
  ly_do TEXT NOT NULL,
  phuong_thuc ENUM('CHUYEN_KHOAN_THU_CONG') NOT NULL DEFAULT 'CHUYEN_KHOAN_THU_CONG',
  trang_thai ENUM('YEU_CAU_HOAN_TIEN', 'DANG_HOAN_TIEN', 'DA_HOAN_TIEN', 'HOAN_TIEN_THAT_BAI')
    NOT NULL DEFAULT 'YEU_CAU_HOAN_TIEN',
  ghi_chu_admin TEXT NULL,
  ngay_yeu_cau DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_bat_dau DATETIME NULL,
  ngay_hoan_tien DATETIME NULL,
  ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ycht_don_hang (don_hang_id),
  KEY idx_ycht_trang_thai (trang_thai),
  CONSTRAINT fk_ycht_don_hang FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE,
  CONSTRAINT fk_ycht_giao_dich FOREIGN KEY (giao_dich_thanh_toan_id)
    REFERENCES giao_dich_thanh_toan(id) ON DELETE SET NULL,
  CONSTRAINT fk_ycht_nguoi_yeu_cau FOREIGN KEY (nguoi_yeu_cau_id)
    REFERENCES nguoi_dung(id) ON DELETE SET NULL
) ENGINE=InnoDB;
