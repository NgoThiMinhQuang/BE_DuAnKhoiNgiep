ALTER TABLE san_pham
  ADD COLUMN so_luong_giu_cho INT UNSIGNED NOT NULL DEFAULT 0 AFTER so_luong_ton;

ALTER TABLE giao_dich_thanh_toan
  ADD COLUMN het_han_luc DATETIME NULL AFTER ngay_thanh_toan,
  ADD KEY idx_gdtt_het_han (trang_thai, het_han_luc);

UPDATE san_pham sp
INNER JOIN (
  SELECT ctdh.san_pham_id, SUM(ctdh.so_luong) AS so_luong
  FROM chi_tiet_don_hang ctdh
  INNER JOIN don_hang dh ON dh.id=ctdh.don_hang_id
  INNER JOIN phieu_xuat px ON px.don_hang_id=dh.id
    AND px.loai_xuat='BAN_HANG' AND px.trang_thai='DA_HOAN_THANH'
  WHERE dh.trang_thai_don_hang IN ('CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_CHUAN_BI')
    AND ctdh.san_pham_id IS NOT NULL
  GROUP BY ctdh.san_pham_id
) pending ON pending.san_pham_id=sp.id
SET sp.so_luong_ton=sp.so_luong_ton+pending.so_luong,
    sp.so_luong_giu_cho=sp.so_luong_giu_cho+pending.so_luong;

UPDATE phieu_xuat px
INNER JOIN don_hang dh ON dh.id=px.don_hang_id
SET px.trang_thai='NHAP_TAM'
WHERE px.loai_xuat='BAN_HANG' AND px.trang_thai='DA_HOAN_THANH'
  AND dh.trang_thai_don_hang IN ('CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_CHUAN_BI');

UPDATE giao_dich_thanh_toan
SET het_han_luc=DATE_ADD(ngay_tao, INTERVAL 30 MINUTE)
WHERE trang_thai='CHO_THANH_TOAN' AND het_han_luc IS NULL;
