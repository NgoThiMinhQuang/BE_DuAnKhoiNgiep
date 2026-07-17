import {
  deleteAddress,
  findAddressesByUserId,
  findUserByEmail,
  findUserById,
  insertAddress,
  insertUser,
  setDefaultAddress,
  updateUserPassword,
  updateUserProfile,
  createPasswordResetToken,
  findUserByGoogleSub,
  linkGoogleAccount,
  resetPasswordByToken,
} from "../repositories/customer.repository.js";
import { hashPassword, verifyPassword } from "../security/password.js";
import { createAccessToken } from "../security/token.js";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { sendPasswordResetEmail } from "./mail.service.js";

const badRequest = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const googleClient = new OAuth2Client();
const hashResetToken = (token) => createHash("sha256").update(token).digest("hex");

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts.pop() ?? "", lastName: parts.join(" ") };
}

function mapAddress(row) {
  return {
    id: String(row.id), recipientName: row.ten_nguoi_nhan, phone: row.so_dien_thoai,
    provinceCode: "", provinceName: row.tinh_thanh, wardCode: "", wardName: row.phuong_xa,
    detail: row.dia_chi_chi_tiet, isDefault: Boolean(row.la_mac_dinh),
  };
}

async function mapUser(row) {
  const name = splitName(row.ho_ten);
  return {
    id: String(row.id), email: row.email, ...name, phone: row.so_dien_thoai ?? "",
    role: row.vai_tro,
    avatar: row.anh_dai_dien_url ?? undefined,
    addresses: (await findAddressesByUserId(row.id)).map(mapAddress),
  };
}

function validateCredentials(email, password) {
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw badRequest("Email không hợp lệ");
  if (!password || password.length < 6) throw badRequest("Mật khẩu phải có ít nhất 6 ký tự");
}

function translateDuplicate(error) {
  if (error.code !== "ER_DUP_ENTRY") throw error;
  throw badRequest(error.message.includes("email") ? "Email đã được sử dụng" : "Số điện thoại đã được sử dụng", 409);
}

export async function registerCustomer(input) {
  const email = input.email?.trim().toLowerCase();
  validateCredentials(email, input.password);
  if (!input.firstName?.trim() || !input.lastName?.trim()) throw badRequest("Vui lòng nhập đầy đủ họ tên");
  try {
    const id = await insertUser({
      fullName: `${input.lastName.trim()} ${input.firstName.trim()}`,
      email, phone: input.phone?.trim() ?? "", passwordHash: hashPassword(input.password),
    });
    return { token: createAccessToken(id), user: await mapUser(await findUserById(id)) };
  } catch (error) { translateDuplicate(error); }
}

export async function loginCustomer(input) {
  const email = input.email?.trim().toLowerCase();
  validateCredentials(email, input.password);
  const row = await findUserByEmail(email);
  if (!row || !verifyPassword(input.password, row.mat_khau_hash)) throw badRequest("Email hoặc mật khẩu không chính xác", 401);
  if (row.trang_thai !== "HOAT_DONG") throw badRequest("Tài khoản đã bị khóa", 403);
  return { token: createAccessToken(row.id), user: await mapUser(row) };
}

export async function socialLoginCustomer(provider) {
  if (!['google', 'facebook'].includes(provider)) throw badRequest("Nhà cung cấp đăng nhập không hợp lệ");
  const email = `${provider}.user@rubeanora.vn`;
  let row = await findUserByEmail(email);
  if (!row) {
    const id = await insertUser({ fullName: `Khách hàng ${provider}`, email, phone: "", passwordHash: hashPassword(randomUUID()) });
    row = await findUserById(id);
  }
  return { token: createAccessToken(row.id), user: await mapUser(row) };
}

export async function googleLoginCustomer(credential) {
  if (!env.googleClientId) throw badRequest("Đăng nhập Google chưa được cấu hình", 503);
  if (!credential) throw badRequest("Thiếu thông tin xác thực Google");
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.googleClientId });
    payload = ticket.getPayload();
  } catch {
    throw badRequest("Thông tin xác thực Google không hợp lệ", 401);
  }
  if (!payload?.sub || !payload.email || !payload.email_verified) throw badRequest("Tài khoản Google chưa xác minh email", 401);
  let row = await findUserByGoogleSub(payload.sub);
  if (!row) {
    row = await findUserByEmail(payload.email.toLowerCase());
    if (!row) {
      const id = await insertUser({
        fullName: payload.name || payload.email.split("@")[0],
        email: payload.email.toLowerCase(), phone: "", passwordHash: hashPassword(randomUUID()),
      });
      row = await findUserById(id);
    }
    await linkGoogleAccount(row.id, payload.sub, payload.picture);
    row = await findUserById(row.id);
  }
  if (row.trang_thai !== "HOAT_DONG") throw badRequest("Tài khoản đã bị khóa", 403);
  return { token: createAccessToken(row.id), user: await mapUser(row) };
}

export async function requestPasswordReset(emailInput) {
  const email = emailInput?.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw badRequest("Email không hợp lệ");
  const row = await findUserByEmail(email);
  if (!row) return { message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi." };
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await createPasswordResetToken(row.id, hashResetToken(token), expiresAt);
  const resetUrl = `${env.frontendUrl}/tai-khoan?che-do=dat-lai-mat-khau&token=${encodeURIComponent(token)}`;
  const sent = await sendPasswordResetEmail({ email: row.email, name: row.ho_ten, resetUrl });
  if (!sent && env.nodeEnv === "production") throw badRequest("Dịch vụ gửi email chưa được cấu hình", 503);
  return {
    message: sent ? "Hướng dẫn đặt lại mật khẩu đã được gửi qua email." : "Chế độ phát triển: dùng liên kết đặt lại mật khẩu bên dưới.",
    ...(sent ? {} : { resetToken: token, resetUrl }),
  };
}

export async function resetForgottenPassword(token, newPassword) {
  if (!token) throw badRequest("Token đặt lại mật khẩu không hợp lệ");
  if (!newPassword || newPassword.length < 6) throw badRequest("Mật khẩu mới phải có ít nhất 6 ký tự");
  if (!await resetPasswordByToken(hashResetToken(token), hashPassword(newPassword))) {
    throw badRequest("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", 400);
  }
}

export async function getCustomer(userId) {
  const row = await findUserById(userId);
  if (!row) throw badRequest("Không tìm thấy khách hàng", 404);
  return mapUser(row);
}

export async function updateCustomer(userId, input) {
  if (!input.firstName?.trim() || !input.lastName?.trim()) throw badRequest("Vui lòng nhập đầy đủ họ tên");
  try {
    await updateUserProfile(userId, {
      fullName: `${input.lastName.trim()} ${input.firstName.trim()}`,
      email: input.email.trim().toLowerCase(), phone: input.phone?.trim() ?? "", avatar: input.avatar,
    });
  } catch (error) { translateDuplicate(error); }
  return getCustomer(userId);
}

export async function changeCustomerPassword(userId, input) {
  const row = await findUserById(userId);
  if (!row || !verifyPassword(input.currentPassword ?? "", row.mat_khau_hash)) throw badRequest("Mật khẩu hiện tại không chính xác", 400);
  if (!input.newPassword || input.newPassword.length < 6) throw badRequest("Mật khẩu mới phải có ít nhất 6 ký tự");
  await updateUserPassword(userId, hashPassword(input.newPassword));
}

export async function addCustomerAddress(userId, input) {
  if (!input.recipientName || !input.phone || !input.provinceName || !input.wardName || !input.detail) throw badRequest("Vui lòng nhập đầy đủ địa chỉ");
  await insertAddress(userId, input);
  return getCustomer(userId);
}

export async function makeCustomerAddressDefault(userId, addressId) {
  if (!await setDefaultAddress(userId, addressId)) throw badRequest("Không tìm thấy địa chỉ", 404);
  return getCustomer(userId);
}

export async function removeCustomerAddress(userId, addressId) {
  if (!await deleteAddress(userId, addressId)) throw badRequest("Không tìm thấy địa chỉ", 404);
  return getCustomer(userId);
}
