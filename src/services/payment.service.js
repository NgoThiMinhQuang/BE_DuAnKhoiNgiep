import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { env } from "../config/env.js";
import { findCustomerPayment, handleSePayTransaction } from "../repositories/payment.repository.js";
import { notifyAdmins, notifyUser } from "./notification.service.js";

const paymentCodeSuffixLength = 12;
const httpError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

function assertSePayConfigured() {
  const missing = [];
  if (!env.sepay.webhookSecret) missing.push("SEPAY_WEBHOOK_SECRET");
  if (!env.sepay.bankCode) missing.push("SEPAY_BANK_CODE");
  if (!env.sepay.accountNumber) missing.push("SEPAY_ACCOUNT_NUMBER");
  if (!env.sepay.accountHolder) missing.push("SEPAY_ACCOUNT_HOLDER");
  if (!/^[A-Z0-9]{2,5}$/.test(env.sepay.paymentPrefix)) missing.push("SEPAY_PAYMENT_PREFIX");
  if (missing.length) {
    throw httpError(`SePay chưa được cấu hình đầy đủ: ${missing.join(", ")}`, 503);
  }
}

export function createSePayPaymentCode() {
  assertSePayConfigured();
  return `${env.sepay.paymentPrefix}${randomBytes(6).toString("hex").toUpperCase()}`;
}

function buildQrUrl(amount, paymentCode) {
  const transferContent = [env.sepay.transferContentPrefix, paymentCode].filter(Boolean).join(" ");
  const query = new URLSearchParams({
    acc: env.sepay.accountNumber,
    bank: env.sepay.bankCode,
    amount: String(Math.round(Number(amount))),
    des: transferContent,
    template: "compact",
    showinfo: "true",
    fullacc: "true",
    holder: env.sepay.accountHolder,
    store: "Rubeanora",
  });
  return `https://vietqr.app/img?${query.toString()}`;
}

function mapPayment(row) {
  return {
    orderId: String(row.don_hang_id),
    orderCode: row.ma_don_hang,
    amount: Number(row.so_tien),
    paymentCode: row.ma_thanh_toan,
    paymentStatus: row.trang_thai_thanh_toan,
    transactionStatus: row.trang_thai,
    paidAt: row.ngay_thanh_toan ?? null,
    expiresAt: row.het_han_luc ?? null,
    bank: {
      code: env.sepay.bankCode,
      name: env.sepay.bankName,
      accountNumber: env.sepay.accountNumber,
      accountHolder: env.sepay.accountHolder,
    },
    qrUrl: buildQrUrl(row.so_tien, row.ma_thanh_toan),
  };
}

export async function getOrderPaymentForCustomer(userId, orderId) {
  assertSePayConfigured();
  const row = await findCustomerPayment(userId, orderId);
  if (!row) throw httpError("Không tìm thấy thông tin thanh toán chuyển khoản của đơn hàng", 404);
  return mapPayment(row);
}

function verifySePaySignature(rawBody, signatureValue, timestampValue) {
  assertSePayConfigured();
  if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
    throw httpError("Webhook không có dữ liệu", 400);
  }

  const signature = String(signatureValue ?? "");
  const timestamp = Number(timestampValue);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(timestamp) || Math.abs(now - timestamp) > 300) {
    throw httpError("Webhook đã hết hạn", 401);
  }

  const signedBody = Buffer.concat([Buffer.from(`${timestamp}.`), rawBody]);
  const expected = `sha256=${createHmac("sha256", env.sepay.webhookSecret).update(signedBody).digest("hex")}`;
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw httpError("Chữ ký SePay không hợp lệ", 401);
  }
}

function extractPaymentCode(payload) {
  const pattern = new RegExp(`${env.sepay.paymentPrefix}[A-Z0-9]{${paymentCodeSuffixLength}}`, "i");
  const source = [payload.code, payload.content].filter(Boolean).join(" ");
  return source.match(pattern)?.[0]?.toUpperCase() ?? null;
}

export async function processSePayWebhook({ rawBody, signature, timestamp }) {
  verifySePaySignature(rawBody, signature, timestamp);

  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw httpError("Dữ liệu webhook không phải JSON hợp lệ", 400);
  }

  const transactionId = String(payload.id ?? "");
  const transferAmount = Number(payload.transferAmount);
  if (!/^\d+$/.test(transactionId) || !Number.isSafeInteger(transferAmount) || transferAmount <= 0) {
    throw httpError("Dữ liệu giao dịch SePay không hợp lệ", 400);
  }

  const result = await handleSePayTransaction({
    payload,
    transactionId,
    transferAmount,
    paymentCode: extractPaymentCode(payload),
    expectedAccountNumber: env.sepay.accountNumber,
  });
  if (result) {
    await Promise.all([
      notifyUser(result.userId, {
        type: "THANH_TOAN_THANH_CONG",
        title: "Thanh toán thành công",
        content: `Đơn ${result.orderCode} đã nhận đủ ${result.amount.toLocaleString("vi-VN")}đ.`,
        path: "/tai-khoan/don-hang",
        tag: `payment-${result.orderId}`,
      }),
      notifyAdmins({
        type: "THANH_TOAN_THANH_CONG",
        title: "SePay xác nhận thanh toán",
        content: `Đơn ${result.orderCode} đã thanh toán ${result.amount.toLocaleString("vi-VN")}đ.`,
        path: "/admin/don-hang",
        tag: `admin-payment-${result.orderId}`,
      }),
    ]);
  }
}
