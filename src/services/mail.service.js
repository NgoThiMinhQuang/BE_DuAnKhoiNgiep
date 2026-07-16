import nodemailer from "nodemailer";

import { env } from "../config/env.js";

export async function sendPasswordResetEmail({ email, name, resetUrl }) {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.password) return false;
  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.password },
  });
  await transporter.sendMail({
    from: env.smtp.from,
    to: email,
    subject: "Đặt lại mật khẩu Rubeanora",
    text: `Xin chào ${name}, mở liên kết sau để đặt lại mật khẩu trong 15 phút: ${resetUrl}`,
    html: `<p>Xin chào <strong>${name}</strong>,</p><p>Liên kết đặt lại mật khẩu có hiệu lực trong 15 phút:</p><p><a href="${resetUrl}">Đặt lại mật khẩu</a></p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
  });
  return true;
}
