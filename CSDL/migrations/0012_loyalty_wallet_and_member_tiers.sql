CREATE TABLE IF NOT EXISTS hang_thanh_vien (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ma_hang ENUM('THANH_VIEN', 'BAC', 'VANG', 'KIM_CUONG') NOT NULL,
  ten_hang VARCHAR(100) NOT NULL,
  chi_tieu_toi_thieu DECIMAL(15,2) NOT NULL DEFAULT 0,
  ty_le_tich_xu DECIMAL(5,4) NOT NULL DEFAULT 0.01,
  trang_thai ENUM('HOAT_DONG', 'TAM_DUNG') NOT NULL DEFAULT 'HOAT_DONG',
  PRIMARY KEY (id),
  UNIQUE KEY uk_htv_ma_hang (ma_hang),
  KEY idx_htv_chi_tieu (chi_tieu_toi_thieu)
) ENGINE=InnoDB;

INSERT INTO hang_thanh_vien (ma_hang, ten_hang, chi_tieu_toi_thieu, ty_le_tich_xu)
VALUES
  ('THANH_VIEN', 'Thành viên', 0, 0.0100),
  ('BAC', 'Bạc', 1000000, 0.0150),
  ('VANG', 'Vàng', 3000000, 0.0200),
  ('KIM_CUONG', 'Kim cương', 7000000, 0.0300)
ON DUPLICATE KEY UPDATE
  ten_hang=VALUES(ten_hang),
  chi_tieu_toi_thieu=VALUES(chi_tieu_toi_thieu),
  ty_le_tich_xu=VALUES(ty_le_tich_xu);

CREATE TABLE IF NOT EXISTS vi_xu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nguoi_dung_id INT UNSIGNED NOT NULL,
  hang_thanh_vien_id INT UNSIGNED NOT NULL,
  so_du_kha_dung BIGINT NOT NULL DEFAULT 0,
  so_du_giu_cho BIGINT UNSIGNED NOT NULL DEFAULT 0,
  xu_cho_thu_hoi BIGINT UNSIGNED NOT NULL DEFAULT 0,
  chi_tieu_xep_hang DECIMAL(15,2) NOT NULL DEFAULT 0,
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_vi_xu_nguoi_dung (nguoi_dung_id),
  KEY idx_vi_xu_hang (hang_thanh_vien_id),
  CONSTRAINT fk_vi_xu_nguoi_dung FOREIGN KEY (nguoi_dung_id)
    REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_vi_xu_hang FOREIGN KEY (hang_thanh_vien_id)
    REFERENCES hang_thanh_vien(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS giao_dich_xu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nguoi_dung_id INT UNSIGNED NOT NULL,
  don_hang_id INT UNSIGNED NULL,
  danh_gia_id INT UNSIGNED NULL,
  loai_giao_dich ENUM(
    'THUONG_DANH_GIA', 'TICH_LUY_DON_HANG', 'HOAN_TAC_DANH_GIA',
    'THU_HOI_XU_HOAN_HANG', 'DIEU_CHINH_ADMIN'
  ) NOT NULL,
  so_xu BIGINT NOT NULL,
  so_du_sau_giao_dich BIGINT NOT NULL,
  ma_tham_chieu VARCHAR(100) NOT NULL,
  noi_dung VARCHAR(500) NOT NULL,
  nguoi_thuc_hien_id INT UNSIGNED NULL,
  ngay_tao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_gdx_ma_tham_chieu (ma_tham_chieu),
  KEY idx_gdx_nguoi_dung (nguoi_dung_id, ngay_tao),
  KEY idx_gdx_don_hang (don_hang_id),
  KEY idx_gdx_danh_gia (danh_gia_id),
  CONSTRAINT fk_gdx_nguoi_dung FOREIGN KEY (nguoi_dung_id)
    REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_gdx_don_hang FOREIGN KEY (don_hang_id)
    REFERENCES don_hang(id) ON DELETE SET NULL,
  CONSTRAINT fk_gdx_danh_gia FOREIGN KEY (danh_gia_id)
    REFERENCES danh_gia(id) ON DELETE SET NULL,
  CONSTRAINT fk_gdx_nguoi_thuc_hien FOREIGN KEY (nguoi_thuc_hien_id)
    REFERENCES nguoi_dung(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lich_su_hang_thanh_vien (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nguoi_dung_id INT UNSIGNED NOT NULL,
  hang_cu_id INT UNSIGNED NULL,
  hang_moi_id INT UNSIGNED NOT NULL,
  chi_tieu_tai_thoi_diem DECIMAL(15,2) NOT NULL,
  ly_do VARCHAR(255) NOT NULL,
  ngay_thay_doi DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lshtv_nguoi_dung (nguoi_dung_id, ngay_thay_doi),
  CONSTRAINT fk_lshtv_nguoi_dung FOREIGN KEY (nguoi_dung_id)
    REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_lshtv_hang_cu FOREIGN KEY (hang_cu_id)
    REFERENCES hang_thanh_vien(id) ON DELETE SET NULL,
  CONSTRAINT fk_lshtv_hang_moi FOREIGN KEY (hang_moi_id)
    REFERENCES hang_thanh_vien(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

ALTER TABLE don_hang
  ADD COLUMN gia_tri_tich_luy DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER tong_thanh_toan,
  ADD COLUMN ty_le_tich_xu DECIMAL(5,4) NULL AFTER gia_tri_tich_luy,
  ADD COLUMN xu_duoc_nhan BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER ty_le_tich_xu;

INSERT IGNORE INTO vi_xu (nguoi_dung_id, hang_thanh_vien_id)
SELECT nd.id, h.id
FROM nguoi_dung nd
JOIN hang_thanh_vien h ON h.ma_hang='THANH_VIEN'
WHERE nd.vai_tro='KHACH_HANG';

UPDATE vi_xu vx
LEFT JOIN (
  SELECT nguoi_dung_id, SUM(GREATEST(tong_tien_hang-tien_giam, 0)) AS chi_tieu
  FROM don_hang
  WHERE trang_thai_don_hang='DA_GIAO'
  GROUP BY nguoi_dung_id
) delivered ON delivered.nguoi_dung_id=vx.nguoi_dung_id
SET vx.chi_tieu_xep_hang=COALESCE(delivered.chi_tieu, 0);

UPDATE vi_xu vx
SET vx.hang_thanh_vien_id=(
  SELECT h.id
  FROM hang_thanh_vien h
  WHERE h.trang_thai='HOAT_DONG'
    AND h.chi_tieu_toi_thieu<=vx.chi_tieu_xep_hang
  ORDER BY h.chi_tieu_toi_thieu DESC
  LIMIT 1
);
