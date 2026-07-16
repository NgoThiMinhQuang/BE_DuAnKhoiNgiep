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

## API ban đầu

- `GET /`: thông tin API.
- `GET /api/health`: kiểm tra trạng thái máy chủ.

## Cấu trúc thư mục

```text
src/
├── config/       # Biến môi trường và cấu hình
├── controllers/  # Xử lý request/response
├── middleware/   # Middleware dùng chung
├── routes/       # Khai báo API routes
├── app.js        # Cấu hình Express
└── server.js     # Khởi động máy chủ
test/             # Kiểm thử tự động
```

