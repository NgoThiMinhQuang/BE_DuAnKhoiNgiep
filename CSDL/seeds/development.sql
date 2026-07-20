-- Dữ liệu chỉnh sửa tài khoản phục vụ môi trường phát triển cũ.
-- Không chạy file này trên production.
USE rubeanora_store;

UPDATE nguoi_dung SET ho_ten='Duy Thuận' WHERE email='thuan@gmail.com';
UPDATE nguoi_dung SET ho_ten='Ngọc Mai' WHERE email='admin@gmail.com';
UPDATE nguoi_dung SET ho_ten='Lê Văn Quang' WHERE email='quang@gmail.com';
