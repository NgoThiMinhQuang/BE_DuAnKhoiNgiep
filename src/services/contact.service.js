import {
  continueContact, createContact, findContactsByEmail, findLatestContactByEmail, updateContactReplies,
} from "../repositories/contact.repository.js";
import { findUserById } from "../repositories/customer.repository.js";

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

  const current = await findLatestContactByEmail(email);
  if (current) {
    const replies = parseReplies(current);
    replies.push({
      id: `customer-${Date.now()}`,
      content: message,
      sentAt: new Date().toISOString(),
      sender: fullName,
      direction: "CUSTOMER",
      readAt: null,
    });
    await continueContact(current.id, { fullName, email, phone, adminNote: JSON.stringify({ replies }) });
    return { id: String(current.id), status: "MOI", continued: true };
  }

  const id = await createContact({ fullName, email, phone, subject, message });
  return { id: String(id), status: "MOI", continued: false };
}

const parseReplies = (row) => {
  if (!row.ghi_chu_admin) return [];
  try {
    const parsed = JSON.parse(row.ghi_chu_admin);
    if (Array.isArray(parsed.replies)) return parsed.replies;
  } catch {
    // Ghi chú cũ được chuyển thành một phản hồi để không mất dữ liệu.
  }
  return [{
    id: `legacy-${row.id}`,
    content: row.ghi_chu_admin,
    sentAt: row.ngay_tao,
    sender: "Nhân viên hỗ trợ",
    direction: "ADMIN",
    readAt: null,
  }];
};

const getCustomerEmail = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw Object.assign(new Error("Không tìm thấy khách hàng"), { statusCode: 404 });
  return user.email;
};

export async function getCustomerSupportMessages(userId) {
  const rows = await findContactsByEmail(await getCustomerEmail(userId));
  return {
    conversations: rows.map((row) => ({
      id: String(row.id),
      subject: row.tieu_de,
      content: row.noi_dung,
      status: row.trang_thai,
      createdAt: row.ngay_tao,
      replies: parseReplies(row),
    })),
  };
}

export async function readCustomerSupportMessages(userId) {
  const email = await getCustomerEmail(userId);
  const rows = await findContactsByEmail(email);
  await Promise.all(rows.map(async (row) => {
    const replies = parseReplies(row);
    if (!replies.some((reply) => reply.direction !== "CUSTOMER" && !reply.readAt)) return;
    const readAt = new Date().toISOString();
    const next = replies.map((reply) => reply.direction === "CUSTOMER" || reply.readAt ? reply : { ...reply, readAt });
    await updateContactReplies(row.id, email, JSON.stringify({ replies: next }));
  }));
  return { success: true };
}
