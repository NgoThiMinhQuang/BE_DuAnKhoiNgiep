USE rubeanora_store;

-- Đồng bộ đúng phí giao hàng trước đây của giao diện sang nguồn dữ liệu MySQL.
UPDATE cau_hinh_cua_hang
SET phi_van_chuyen = 30000,
    nguong_mien_phi_van_chuyen = 300000
WHERE id = (SELECT id FROM (SELECT id FROM cau_hinh_cua_hang ORDER BY id LIMIT 1) AS store);
