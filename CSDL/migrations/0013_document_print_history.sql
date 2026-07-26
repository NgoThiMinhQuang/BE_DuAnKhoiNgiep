CREATE TABLE IF NOT EXISTS lich_su_in_chung_tu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  loai_chung_tu ENUM(
    'DON_BAN_HANG', 'PHIEU_DONG_GOI', 'PHIEU_GIAO_HANG',
    'NHAN_VAN_CHUYEN', 'PHIEU_XUAT_KHO', 'PHIEU_GIAO_THAT_BAI',
    'PHIEU_NHAP_KHO', 'PHIEU_NHAP_HOAN_HANG'
  ) NOT NULL,
  doi_tuong_id BIGINT UNSIGNED NOT NULL,
  nguoi_in_id INT UNSIGNED NOT NULL,
  lan_in INT UNSIGNED NOT NULL,
  ly_do_in_lai VARCHAR(500) NULL,
  trang_thai_chung_tu VARCHAR(50) NOT NULL,
  ngay_in DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lsinct_lan_in (loai_chung_tu, doi_tuong_id, lan_in),
  KEY idx_lsinct_doi_tuong (loai_chung_tu, doi_tuong_id, ngay_in),
  KEY idx_lsinct_nguoi_in (nguoi_in_id, ngay_in),
  CONSTRAINT fk_lsinct_nguoi_in FOREIGN KEY (nguoi_in_id)
    REFERENCES nguoi_dung(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
