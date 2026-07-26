ALTER TABLE danh_gia
  MODIFY COLUMN trang_thai ENUM('CHO_DUYET', 'DA_DUYET', 'TU_CHOI', 'DA_AN')
    NOT NULL DEFAULT 'CHO_DUYET';

ALTER TABLE don_hang
  MODIFY COLUMN trang_thai_don_hang ENUM(
    'CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_CHUAN_BI', 'DANG_GIAO',
    'DA_GIAO', 'GIAO_THAT_BAI', 'GIAO_LAI', 'DANG_HOAN_HANG',
    'DA_HOAN_HANG', 'DA_HUY'
  ) NOT NULL DEFAULT 'CHO_XAC_NHAN';

ALTER TABLE phieu_nhap
  MODIFY COLUMN nha_cung_cap_id INT UNSIGNED NULL,
  ADD COLUMN don_hang_id INT UNSIGNED NULL AFTER nha_cung_cap_id,
  ADD COLUMN loai_nhap ENUM('NHAP_HANG', 'NHAP_HOAN_HANG', 'NHAP_KHAC')
    NOT NULL DEFAULT 'NHAP_HANG' AFTER nguoi_tao_id,
  ADD UNIQUE KEY uk_phieu_nhap_don_hoan (don_hang_id, loai_nhap),
  ADD CONSTRAINT fk_phieu_nhap_don_hang
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE RESTRICT;
