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

## Nhóm API

- `GET /`: thông tin API.
- `GET /api/health`: kiểm tra trạng thái máy chủ.
- `/api/home`, `/api/products`, `/api/news`: trang chủ, sản phẩm và bài viết công khai.
- `/api/auth`: đăng ký, đăng nhập, Google và đặt lại mật khẩu.
- `/api/customers/me`: hồ sơ, địa chỉ, giỏ hàng, yêu thích, đặt/hủy đơn và đánh giá.
- `POST /api/contact`: gửi thông tin liên hệ.
- `/api/admin`: dashboard, đơn hàng, người dùng, đánh giá, liên hệ, cấu hình cửa hàng, sản phẩm, danh mục, khuyến mãi, bài viết, nhà cung cấp và nhập/xuất kho.

Tất cả API `/api/customers/me` cần header `Authorization: Bearer <token>`. API `/api/admin` còn yêu cầu tài khoản có vai trò `ADMIN` và trạng thái `HOAT_DONG`.

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

