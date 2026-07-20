ALTER TABLE khuyen_mai
  ADD COLUMN so_luot_toi_da_moi_khach INT UNSIGNED NOT NULL DEFAULT 1 AFTER so_luot_da_su_dung;

CREATE TABLE IF NOT EXISTS lich_su_su_dung_khuyen_mai (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  khuyen_mai_id INT UNSIGNED NOT NULL,
  nguoi_dung_id INT UNSIGNED NOT NULL,
  don_hang_id INT UNSIGNED NOT NULL,
  ngay_su_dung DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_lssdkm_don_hang (don_hang_id),
  KEY idx_lssdkm_khach (khuyen_mai_id, nguoi_dung_id),
  FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai(id),
  FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id),
  FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE don_hang
  ADD COLUMN tinh_thanh_ma VARCHAR(20) NULL AFTER tinh_thanh,
  ADD COLUMN phuong_xa_ma VARCHAR(20) NULL AFTER phuong_xa;

ALTER TABLE cau_hinh_cua_hang
  ADD COLUMN ten_phap_ly VARCHAR(150) NULL,
  ADD COLUMN email_ho_tro VARCHAR(150) NULL,
  ADD COLUMN google_maps_url VARCHAR(500) NULL,
  ADD COLUMN tien_to_don_hang VARCHAR(8) NOT NULL DEFAULT 'RBB',
  ADD COLUMN bat_cod TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN bat_chuyen_khoan TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN youtube_url VARCHAR(500) NULL,
  ADD COLUMN email_thong_bao VARCHAR(150) NULL,
  ADD COLUMN nguong_canh_bao_kho INT UNSIGNED NOT NULL DEFAULT 5,
  ADD COLUMN gui_email_xac_nhan TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN che_do_bao_tri TINYINT(1) NOT NULL DEFAULT 0;
