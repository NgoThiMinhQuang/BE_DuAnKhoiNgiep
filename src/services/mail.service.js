import { lookup } from "node:dns/promises";

import nodemailer from "nodemailer";

import { env } from "../config/env.js";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character]);

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const paymentMethodLabel = (method) => method === "CHUYEN_KHOAN"
  ? "Chuyển khoản ngân hàng (SePay)"
  : "Thanh toán khi nhận hàng (COD)";

const frontendUrl = (path) => new URL(path, env.frontendUrl.endsWith("/") ? env.frontendUrl : `${env.frontendUrl}/`).toString();

function createOrderItemsHtml(items = []) {
  return items.map((item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee">${escapeHtml(item.name)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center">${Number(item.quantity)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right">${formatMoney(Number(item.price) * Number(item.quantity))}</td>
    </tr>
  `).join("");
}

function createOrderSummaryHtml(summary) {
  return `
    <table style="width:100%;margin-top:18px;border-collapse:collapse">
      <tr><td style="padding:5px 0">Tiền hàng</td><td style="padding:5px 0;text-align:right">${formatMoney(summary.subtotal)}</td></tr>
      <tr><td style="padding:5px 0">Giảm giá</td><td style="padding:5px 0;text-align:right">-${formatMoney(summary.discountAmount)}</td></tr>
      <tr><td style="padding:5px 0">Phí vận chuyển</td><td style="padding:5px 0;text-align:right">${formatMoney(summary.shippingFee)}</td></tr>
      <tr><td style="padding:10px 0;border-top:1px solid #ddd"><strong>Tổng thanh toán</strong></td><td style="padding:10px 0;border-top:1px solid #ddd;text-align:right;color:#b53740"><strong>${formatMoney(summary.totalPayment)}</strong></td></tr>
    </table>
  `;
}

function createPasswordResetMessage({ email, name, resetUrl }) {
  return {
    to: email,
    subject: "Đặt lại mật khẩu Rubeanora",
    text: `Xin chào ${name}, mở liên kết sau để đặt lại mật khẩu trong 15 phút: ${resetUrl}`,
    html: `<p>Xin chào <strong>${name}</strong>,</p><p>Liên kết đặt lại mật khẩu có hiệu lực trong 15 phút:</p><p><a href="${resetUrl}">Đặt lại mật khẩu</a></p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
  };
}

function createCustomerOrderMessage(order) {
  const storeName = escapeHtml(order.storeName || "Rubeanora");
  const orderUrl = frontendUrl("/tai-khoan/don-hang");
  const itemText = order.items.map((item) => `- ${item.name} x${item.quantity}: ${formatMoney(Number(item.price) * Number(item.quantity))}`).join("\n");
  return {
    to: order.customerEmail,
    subject: `Xác nhận đơn hàng ${order.orderCode} - ${order.storeName || "Rubeanora"}`,
    text: `Xin chào ${order.customerName},\n\nĐơn hàng ${order.orderCode} đã được tạo thành công.\n${itemText}\n\nTổng thanh toán: ${formatMoney(order.summary.totalPayment)}\nPhương thức: ${paymentMethodLabel(order.paymentMethod)}\nTheo dõi đơn hàng: ${orderUrl}`,
    html: `
      <div style="max-width:640px;margin:auto;font-family:Arial,sans-serif;color:#34292a;line-height:1.55">
        <h2 style="color:#b53740">${storeName}</h2>
        <p>Xin chào <strong>${escapeHtml(order.customerName)}</strong>,</p>
        <p>Đơn hàng <strong>${escapeHtml(order.orderCode)}</strong> đã được tạo thành công và đang chờ cửa hàng xác nhận.</p>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr><th style="padding:10px 8px;text-align:left;background:#fff3f4">Sản phẩm</th><th style="padding:10px 8px;background:#fff3f4">SL</th><th style="padding:10px 8px;text-align:right;background:#fff3f4">Thành tiền</th></tr></thead>
          <tbody>${createOrderItemsHtml(order.items)}</tbody>
        </table>
        ${createOrderSummaryHtml(order.summary)}
        <p><strong>Phương thức thanh toán:</strong> ${escapeHtml(paymentMethodLabel(order.paymentMethod))}</p>
        <p><a href="${orderUrl}" style="display:inline-block;padding:11px 18px;border-radius:7px;background:#b53740;color:#fff;text-decoration:none">Theo dõi đơn hàng</a></p>
        <p style="font-size:13px;color:#766a6b">Cảm ơn bạn đã mua sắm tại ${storeName}.</p>
      </div>
    `,
  };
}

function createAdminNewOrderMessage(order) {
  const adminOrderUrl = frontendUrl("/admin/don-hang");
  return {
    to: order.adminEmail,
    subject: `Đơn hàng mới ${order.orderCode} - ${formatMoney(order.summary.totalPayment)}`,
    text: `Có đơn hàng mới ${order.orderCode}. Khách hàng: ${order.customerName}. Tổng thanh toán: ${formatMoney(order.summary.totalPayment)}. Xem đơn: ${adminOrderUrl}`,
    html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;color:#34292a;line-height:1.55">
        <h2 style="color:#b53740">Có đơn hàng mới</h2>
        <p>Đơn <strong>${escapeHtml(order.orderCode)}</strong> vừa được tạo.</p>
        <p><strong>Khách hàng:</strong> ${escapeHtml(order.customerName)}<br><strong>Tổng thanh toán:</strong> ${formatMoney(order.summary.totalPayment)}<br><strong>Phương thức:</strong> ${escapeHtml(paymentMethodLabel(order.paymentMethod))}</p>
        <p><a href="${adminOrderUrl}" style="display:inline-block;padding:11px 18px;border-radius:7px;background:#b53740;color:#fff;text-decoration:none">Mở trang quản lý đơn hàng</a></p>
      </div>
    `,
  };
}

async function sendWithResend(message) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resend.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.resend.from,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend API trả về HTTP ${response.status}: ${detail.slice(0, 500)}`);
  }
}

async function sendWithSmtp(message) {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.password) return false;

  // Railway Pro có thể dùng SMTP nhưng IPv6 outbound mặc định bị tắt.
  // Phân giải IPv4 trước để tránh ENETUNREACH với Gmail.
  const { address: smtpIpv4Address } = await lookup(env.smtp.host, { family: 4 });
  const transporter = nodemailer.createTransport({
    host: smtpIpv4Address,
    servername: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    dnsTimeout: 10_000,
  });

  await transporter.sendMail({ from: env.smtp.from, ...message });
  return true;
}

async function sendMail(message) {
  if (env.resend.apiKey) {
    await sendWithResend(message);
    return true;
  }
  return sendWithSmtp(message);
}

export async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const message = createPasswordResetMessage({ email, name, resetUrl });
  return sendMail(message);
}

export async function sendCustomerOrderConfirmationEmail(order) {
  if (!order.customerEmail) return false;
  return sendMail(createCustomerOrderMessage(order));
}

export async function sendAdminNewOrderEmail(order) {
  if (!order.adminEmail) return false;
  return sendMail(createAdminNewOrderMessage(order));
}
