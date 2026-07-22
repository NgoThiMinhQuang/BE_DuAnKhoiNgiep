-- Thêm trạng thái DA_XOA cho bảng nguoi_dung
ALTER TABLE nguoi_dung
  MODIFY COLUMN trang_thai ENUM('HOAT_DONG', 'BI_KHOA', 'DA_XOA') NOT NULL DEFAULT 'HOAT_DONG';

-- Cập nhật bảng lich_su_quyen_nguoi_dung để hỗ trợ trạng thái mới
ALTER TABLE lich_su_quyen_nguoi_dung
  MODIFY COLUMN trang_thai_cu ENUM('HOAT_DONG', 'BI_KHOA', 'DA_XOA') NOT NULL,
  MODIFY COLUMN trang_thai_moi ENUM('HOAT_DONG', 'BI_KHOA', 'DA_XOA') NOT NULL;
