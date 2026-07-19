# Hướng dẫn bật thanh toán chuyển khoản tự động bằng SePay

Backend đã có sẵn luồng thanh toán thật:

1. Tạo đơn `CHUYEN_KHOAN` và sinh mã thanh toán ngẫu nhiên dạng `RBB` + 12 ký tự.
2. Frontend hiển thị VietQR chứa đúng tài khoản, số tiền và mã thanh toán.
3. SePay gửi giao dịch tiền vào đến webhook Railway.
4. Backend xác thực HMAC-SHA256, chống trùng giao dịch, kiểm tra tài khoản, mã đơn và số tiền.
5. MySQL tự cập nhật đơn thành `DA_THANH_TOAN`; trang QR tự nhận trạng thái mới.

## 1. Đăng ký và liên kết ngân hàng

1. Truy cập `https://my.sepay.vn` và tạo tài khoản.
2. Vào phần **Tài khoản ngân hàng** và liên kết tài khoản sẽ nhận tiền.
3. Chỉ chọn tài khoản thuộc quyền quản lý của cửa hàng. Không cung cấp mật khẩu Internet Banking cho mã nguồn hoặc thành viên khác.

## 2. Tạo secret HMAC

Chạy lệnh sau trong PowerShell để tạo chuỗi bí mật 32 byte:

```powershell
[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).ToLower()
```

Sao chép kết quả và giữ kín. Chuỗi này phải được nhập giống nhau ở SePay và Railway.

## 3. Điền Railway Variables

Mở Railway → service `BE_DuAnKhoiNghiep_Fork` → **Variables** → thêm:

```env
SEPAY_WEBHOOK_SECRET=chuoi_hmac_vua_tao
SEPAY_BANK_CODE=ma_ngan_hang_dung_cho_vietqr
SEPAY_BANK_NAME=ten_ngan_hang_hien_thi
SEPAY_ACCOUNT_NUMBER=so_tai_khoan_nhan_tien
SEPAY_ACCOUNT_HOLDER=TEN CHU TAI KHOAN KHONG DAU
SEPAY_PAYMENT_PREFIX=RBB
SEPAY_TRANSFER_CONTENT_PREFIX=
```

Ví dụ mã ngân hàng: `Vietcombank`, `MB`, `ACB`, `BIDV`. Hãy dùng đúng mã/alias trong danh sách `https://vietqr.app/banks.json`.

Không điền các giá trị thật vào `.env.example` và không commit file `.env`.

`SEPAY_TRANSFER_CONTENT_PREFIX` thường để trống. Nếu tài khoản thuộc trường hợp SePay yêu cầu nội dung đặc biệt, điền `SEVQR` cho VietinBank cá nhân/hộ kinh doanh hoặc `TKP` kèm mã tài khoản ảo, ví dụ `TKP001`. Mã đơn `RBB...` vẫn được tự động nối phía sau.

## 4. Cập nhật MySQL Railway

Tại máy có file `.env` đang kết nối MySQL Railway, chạy:

```powershell
npm run migrate
```

Migration tạo hai bảng:

- `giao_dich_thanh_toan`: mã thanh toán và trạng thái của từng đơn.
- `sepay_webhook_log`: nhật ký webhook và khóa chống xử lý trùng.

## 5. Cấu hình nhận diện mã trên SePay

Vào SePay → **Cấu hình Công ty** → **Cấu hình chung** → **Cấu trúc mã thanh toán**:

- Nhận diện mã thanh toán: `Bật`.
- Tiền tố: `RBB`.
- Độ dài hậu tố tối thiểu: `12`.
- Độ dài hậu tố tối đa: `12`.
- Loại ký tự: `Số và chữ`.
- Trạng thái: `Đang hoạt động`.

Nhấn **Lưu lại**.

## 6. Tạo webhook trên SePay

Vào SePay → **Tích hợp** → **Webhooks** → **Thêm webhook** và điền:

- Tên: `Thanh toán đơn hàng Rubeanora`.
- URL:

```text
https://beduankhoingiepfork-production.up.railway.app/api/payments/sepay/webhook
```

- Loại sự kiện: `Tiền vào`.
- Content-Type: `application/json`.
- Tự động gửi lại: `Bật`.
- Tài khoản: chọn đúng tài khoản đã điền trong `SEPAY_ACCOUNT_NUMBER`.
- Lọc mã thanh toán: tiền tố `RBB`.
- Chỉ gửi khi có mã thanh toán: `Bật`.
- Bảo mật: `HMAC-SHA256`.
- Secret Key: chuỗi đã điền trong `SEPAY_WEBHOOK_SECRET` trên Railway.

Không chọn `Không xác thực` khi dùng giao dịch thật.

## 7. Deploy và kiểm thử

1. Deploy lại backend Railway sau khi thêm Variables.
2. Deploy lại frontend Vercel sau khi code được đưa lên nhánh deploy.
3. Trên SePay, mở webhook → **Gửi thử**. Kết quả hợp lệ phải là HTTP `200` với body:

```json
{"success": true}
```

4. Tạo đơn thật nhỏ trên website, chọn **Chuyển khoản ngân hàng (SePay)**.
5. Quét QR bằng ứng dụng ngân hàng và kiểm tra:
   - Số tài khoản đúng.
   - Số tiền đúng tổng đơn.
   - Nội dung có dạng `RBBXXXXXXXXXXXX`.
6. Sau khi chuyển tiền, trang phải đổi sang **Đã nhận thanh toán** và đơn trong trang khách/admin phải có trạng thái `DA_THANH_TOAN`.

## 8. Xử lý khi không tự xác nhận

Kiểm tra theo thứ tự:

1. Railway deployment và `/api/health` đang hoạt động.
2. `SEPAY_WEBHOOK_SECRET` trên Railway giống secret của webhook.
3. SePay nhận diện đúng tiền tố `RBB`, hậu tố 12 ký tự số và chữ.
4. Webhook chọn đúng tài khoản và sự kiện tiền vào.
5. Nhật ký webhook SePay có HTTP `200`.
6. Bảng `sepay_webhook_log`:
   - `DA_XU_LY`: đã cập nhật đơn.
   - `SAI_SO_TIEN`: khách chuyển sai tiền.
   - `KHONG_KHOP`: sai/thiếu mã thanh toán.
   - `BO_QUA`: sai tài khoản, đơn đã xử lý hoặc không phải tiền vào.

Không sửa trực tiếp một webhook lỗi thành `DA_XU_LY`. Hãy kiểm tra giao dịch ngân hàng và đơn hàng trước khi cập nhật thủ công.
