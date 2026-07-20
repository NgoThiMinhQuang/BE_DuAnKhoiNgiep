const normalize = (value) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const faqEntries = [
  {
    keywords: [["phi", "ship"], ["phi", "van chuyen"], ["mien phi", "giao hang"]],
    answer: "Phí vận chuyển tiêu chuẩn là 30.000đ. Đơn hàng từ 300.000đ được miễn phí vận chuyển.",
  },
  {
    keywords: [["bao lau", "giao"], ["thoi gian", "giao hang"], ["khi nao", "nhan hang"]],
    answer: "Thời gian giao hàng dự kiến từ 2–5 ngày làm việc, tùy khu vực. Khi đơn được bàn giao cho đơn vị vận chuyển, bạn có thể theo dõi trạng thái trong mục Đơn hàng của tôi.",
  },
  {
    keywords: [["doi tra"], ["tra hang"], ["hoan hang"], ["doi hang"]],
    answer: "Rubeanora hỗ trợ đổi trả theo chính sách của cửa hàng. Bạn vui lòng giữ sản phẩm, bao bì và hóa đơn, sau đó liên hệ hỗ trợ sớm để được kiểm tra điều kiện đổi trả.",
  },
  {
    keywords: [["thanh toan"], ["chuyen khoan"], ["cod"], ["tra tien"]],
    answer: "Bạn có thể thanh toán theo các phương thức được hiển thị tại trang Thanh toán, bao gồm chuyển khoản ngân hàng và các lựa chọn khả dụng cho đơn hàng.",
  },
  {
    keywords: [["kiem tra", "don hang"], ["theo doi", "don hang"], ["don hang", "o dau"], ["trang thai", "don"]],
    answer: "Bạn hãy đăng nhập, vào Tài khoản → Đơn hàng của tôi để xem trạng thái và chi tiết đơn hàng.",
  },
  {
    keywords: [["tu van", "san pham"], ["chon", "san pham"], ["san pham", "phu hop"]],
    answer: "Bạn hãy cho Rubeanora biết loại sản phẩm đang quan tâm, nhu cầu sử dụng và mức giá mong muốn. Nhân viên tư vấn sẽ gợi ý sản phẩm phù hợp.",
  },
  {
    keywords: [["lien he"], ["hotline"], ["nhan vien"], ["tu van vien"]],
    answer: "Bạn có thể để lại nội dung ngay tại hộp chat này hoặc xem hotline, email và địa chỉ tại trang Liên hệ. Nhân viên Rubeanora sẽ phản hồi sớm nhất có thể.",
  },
];

import { findChatHistory, getChatContext, getPublicChatSettings, saveChatExchange, transferChatToSeller } from "../repositories/chatbot.repository.js";

export function findChatbotAnswer(message) {
  const normalizedMessage = normalize(message);
  const match = faqEntries.find((entry) => entry.keywords.some((phrase) => (
    phrase.every((keyword) => normalizedMessage.includes(keyword))
  )));
  return match?.answer ?? "Xin lỗi, tôi chưa có câu trả lời phù hợp cho nội dung này. Bạn có thể chọn một câu hỏi gợi ý hoặc bấm “Chat với người bán” nếu muốn liên hệ trực tiếp với nhân viên. Tin nhắn này chưa được gửi cho người bán.";
}

export async function answerPublicChatbot(message) {
  const normalized = normalize(message);
  const settings = await getPublicChatSettings();
  if (has(normalized, ["phi ship", "phi van chuyen", "mien phi giao hang"])) return `Phí vận chuyển hiện tại là ${Number(settings.phi_van_chuyen || 0).toLocaleString("vi-VN")}đ. Đơn từ ${Number(settings.nguong_mien_phi_van_chuyen || 0).toLocaleString("vi-VN")}đ được miễn phí vận chuyển.`;
  if (has(normalized, ["hotline", "lien he", "gio lam viec"])) return `Hotline: ${settings.hotline || "đang cập nhật"}. Email: ${settings.email_ho_tro || settings.email || "đang cập nhật"}. Giờ làm việc: ${settings.gio_lam_viec || "đang cập nhật"}.`;
  return findChatbotAnswer(message);
}

const has = (text, words) => words.some((word) => text.includes(word));

export async function answerCustomerChatbot(userId, message) {
  const normalized = normalize(message);
  const context = await getChatContext(userId);
  let intent = "UNKNOWN";
  let answer;
  let products = [];
  if (has(normalized, ["dong y chuyen", "chuyen nguoi ban", "gap nhan vien"])) {
    intent = "TRANSFER_TO_SELLER";
    await transferChatToSeller(userId);
    answer = "Mình đã chuyển toàn bộ ngữ cảnh cho người bán. Thời gian phản hồi dự kiến trong giờ làm việc là 15–30 phút.";
  } else if (has(normalized, ["phi ship", "phi van chuyen", "mien phi giao hang"])) {
    intent = "SHIPPING_FEE";
    answer = `Phí vận chuyển hiện tại là ${Number(context.settings.phi_van_chuyen || 0).toLocaleString("vi-VN")}đ. Đơn từ ${Number(context.settings.nguong_mien_phi_van_chuyen || 0).toLocaleString("vi-VN")}đ được miễn phí vận chuyển.`;
  } else if (has(normalized, ["bao lau", "thoi gian giao", "khi nao nhan"])) {
    intent = "DELIVERY_TIME"; answer = context.faq.DELIVERY_TIME;
  } else if (has(normalized, ["doi tra", "tra hang", "doi hang"])) {
    intent = "RETURN_POLICY"; answer = context.faq.RETURN_POLICY;
  } else if (has(normalized, ["hotline", "lien he", "gio lam viec"])) {
    intent = "CONTACT_INFO"; answer = `Hotline: ${context.settings.hotline || "đang cập nhật"}. Email: ${context.settings.email_ho_tro || context.settings.email || "đang cập nhật"}. Giờ làm việc: ${context.settings.gio_lam_viec || "đang cập nhật"}.`;
  } else if (has(normalized, ["don ", "don hang", "ma van don", "thanh toan"])) {
    intent = "ORDER_STATUS";
    const code = normalized.match(/(?:rbb|[a-z0-9]{2,8})[- ][a-z0-9-]+/i)?.[0]?.replaceAll(" ", "-").toUpperCase();
    const order = code ? context.orders.find((item) => item.ma_don_hang.toUpperCase() === code) : context.orders[0];
    answer = order ? `Đơn ${order.ma_don_hang}: trạng thái ${order.trang_thai_don_hang}, thanh toán ${order.trang_thai_thanh_toan}${order.ma_van_don ? `, mã vận đơn ${order.ma_van_don}` : ", chưa có mã vận đơn"}.` : "Tài khoản của bạn chưa có đơn hàng phù hợp.";
  } else if (has(normalized, ["tu van", "san pham", "da kho", "da dau", "mun", "duong am"])) {
    intent = "PRODUCT_ADVICE";
    const budget = Number(normalized.match(/(\d+)\s*(k|000)/)?.[1] || 0) * 1000;
    const candidates = context.products.filter((item) => !budget || Number(item.gia_ban) <= budget).slice(0, 3);
    products = candidates.map((item) => ({ id: String(item.id), name: item.ten_san_pham, slug: item.duong_dan, price: Number(item.gia_ban), stock: Number(item.stock) }));
    answer = products.length ? "Dựa trên nhu cầu và mức giá bạn cung cấp, đây là các sản phẩm còn hàng để bạn tham khảo. Đây không phải chẩn đoán da hoặc cam kết điều trị." : "Bạn đang quan tâm sản phẩm nào? Hãy cho tôi thêm loại da, nhu cầu chính, mức giá mong muốn và thành phần từng dị ứng.";
  } else {
    answer = "Mình chưa xử lý chắc chắn nội dung này. Bạn có muốn chuyển toàn bộ cuộc trò chuyện cho người bán không? Chỉ khi bạn đồng ý, hệ thống mới tạo yêu cầu hỗ trợ.";
  }
  await saveChatExchange(userId, message, answer, intent);
  return { answer, intent, products, canTransfer: intent === "UNKNOWN" };
}

export async function getCustomerChatHistory(userId) {
  return (await findChatHistory(userId)).map((item) => ({ id: String(item.id), content: item.noi_dung, intent: item.intent, sentAt: item.ngay_gui, direction: item.loai_nguoi_gui === "KHACH_HANG" ? "CUSTOMER" : "BOT" }));
}
