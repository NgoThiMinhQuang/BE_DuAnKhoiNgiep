# Quy ước migration

Thư mục này lưu các thay đổi CSDL sau schema gốc `../CSDL.sql`.

## Tạo migration mới

1. Tạo file có số thứ tự tăng dần, ví dụ `0001_add_customer_note.sql`.
2. Viết thay đổi theo hướng an toàn; không xóa bảng hoặc dữ liệu trên database chung nếu chưa thống nhất với nhóm.
3. Commit file SQL cùng phần code sử dụng thay đổi đó.
4. Sau khi pull code, mỗi thành viên chạy `npm run migrate`.

Migration đã chạy được lưu ở bảng `schema_migrations`, nên không bị chạy lại.

## Khởi tạo database chung lần đầu

1. Tạo database có tên trùng `DB_NAME` trong file `.env` hoặc điều chỉnh hai dòng đầu của `../CSDL.sql`.
2. Chạy toàn bộ `../CSDL.sql` một lần.
3. Chạy `npm run migrate` để ghi nhận mốc `0000_baseline.sql`.

Không sửa nội dung migration đã được chạy trên database chung. Nếu cần thay đổi, tạo migration mới.
