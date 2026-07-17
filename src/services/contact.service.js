import { createContact } from "../repositories/contact.repository.js";

const invalid = (message) => Object.assign(new Error(message), { statusCode: 400 });

export async function submitContact(input = {}) {
  const fullName = String(input.fullName ?? input.hoTen ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const phone = String(input.phone ?? input.soDienThoai ?? "").trim() || null;
  const subject = String(input.subject ?? input.tieuDe ?? "").trim() || null;
  const message = String(input.message ?? input.noiDung ?? "").trim();

  if (!fullName) throw invalid("Họ tên là bắt buộc");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw invalid("Email không hợp lệ");
  if (!message) throw invalid("Nội dung liên hệ là bắt buộc");
  if (fullName.length > 150 || email.length > 150 || (phone?.length ?? 0) > 20 || (subject?.length ?? 0) > 255) {
    throw invalid("Thông tin liên hệ vượt quá độ dài cho phép");
  }

  const id = await createContact({ fullName, email, phone, subject, message });
  return { id: String(id), status: "MOI" };
}
