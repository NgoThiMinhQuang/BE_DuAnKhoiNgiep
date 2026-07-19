# Backend Dự Án Khởi Nghiệp

REST API viết bằng Node.js và Express.

## Yêu cầu

- Node.js 20 trở lên

## Chạy project

```bash
npm install
copy .env.example .env
npm run dev
```

Máy chủ mặc định chạy tại `http://localhost:5000`.

## Lệnh có sẵn

- `npm run dev`: chạy chế độ phát triển và tự khởi động lại khi sửa mã nguồn.
- `npm start`: chạy máy chủ.
- `npm test`: chạy kiểm thử API.
- `npm run check`: kiểm tra cú pháp các tệp khởi động chính.

## Cơ sở dữ liệu

- File schema mới nhất: `CSDL/CSDL.sql`.
- Điền thông tin MySQL trong `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- Backend dùng transaction khi đặt/hủy đơn và khi nhập/xuất kho để số lượng tồn không bị cập nhật dở dang.

### Dùng database chung cho nhóm

1. Người phụ trách tạo MySQL dùng chung và chạy `CSDL/CSDL.sql` một lần để tạo schema ban đầu.
2. Mỗi thành viên sao chép `.env.example` thành `.env`, rồi nhận thông tin `DB_*` từ người phụ trách. Không commit `.env`.
3. Từ các lần thay đổi sau, tạo file SQL mới trong `CSDL/migrations` theo mẫu `0001_mo_ta_thay_doi.sql` và commit cùng code.
4. Sau khi pull code mới, chạy:

```bash
npm run migrate
```

Lệnh này ghi nhận migration đã chạy trong bảng `schema_migrations`; một file chỉ được chạy một lần trên database chung.

## Nhóm API

- `GET /`: thông tin API.
- `GET /api/health`: kiểm tra trạng thái máy chủ.
- `/api/home`, `/api/products`, `/api/news`: trang chủ, sản phẩm và bài viết công khai.
- `/api/auth`: đăng ký, đăng nhập, Google và đặt lại mật khẩu.
- `/api/customers/me`: hồ sơ, địa chỉ, giỏ hàng, yêu thích, đặt/hủy đơn và đánh giá.
- `/api/payments/sepay/webhook`: nhận kết quả chuyển khoản ngân hàng và tự động xác nhận đơn hàng.
- `POST /api/contact`: gửi thông tin liên hệ.
- `/api/admin`: dashboard, đơn hàng, người dùng, đánh giá, liên hệ, cấu hình cửa hàng, sản phẩm, danh mục, khuyến mãi, bài viết, nhà cung cấp và nhập/xuất kho.

Tất cả API `/api/customers/me` cần header `Authorization: Bearer <token>`. API `/api/admin` còn yêu cầu tài khoản có vai trò `ADMIN` và trạng thái `HOAT_DONG`.

## Thanh toán chuyển khoản tự động bằng SePay

Chạy migration `CSDL/migrations/0001_add_sepay_payments.sql`, cấu hình các biến `SEPAY_*` trên Railway và làm theo hướng dẫn trong `SEPAY_SETUP.md`. Secret webhook chỉ được lưu trong Railway hoặc `.env` cục bộ, không đưa vào GitHub.

## Cấu trúc thư mục

```text
src/
├── config/       # Biến môi trường và cấu hình
├── controllers/  # Xử lý request/response
├── middleware/   # Middleware dùng chung
├── routes/       # Khai báo API routes
├── repositories/ # Truy vấn MySQL
├── services/     # Kiểm tra dữ liệu và nghiệp vụ
├── app.js        # Cấu hình Express
└── server.js     # Khởi động máy chủ
test/             # Kiểm thử tự động
```
