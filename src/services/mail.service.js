import { lookup } from "node:dns/promises";

import nodemailer from "nodemailer";

import { env } from "../config/env.js";

function createPasswordResetMessage({ email, name, resetUrl }) {
  return {
    to: email,
    subject: "Đặt lại mật khẩu Rubeanora",
    text: `Xin chào ${name}, mở liên kết sau để đặt lại mật khẩu trong 15 phút: ${resetUrl}`,
    html: `<p>Xin chào <strong>${name}</strong>,</p><p>Liên kết đặt lại mật khẩu có hiệu lực trong 15 phút:</p><p><a href="${resetUrl}">Đặt lại mật khẩu</a></p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
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

export async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const message = createPasswordResetMessage({ email, name, resetUrl });

  if (env.resend.apiKey) {
    await sendWithResend(message);
    return true;
  }

  return sendWithSmtp(message);
}
