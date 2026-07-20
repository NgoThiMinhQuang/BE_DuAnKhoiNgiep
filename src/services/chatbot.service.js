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

export function findChatbotAnswer(message) {
  const normalizedMessage = normalize(message);
  const match = faqEntries.find((entry) => entry.keywords.some((phrase) => (
    phrase.every((keyword) => normalizedMessage.includes(keyword))
  )));
  return match?.answer ?? "Xin lỗi, tôi chưa có câu trả lời phù hợp cho nội dung này. Bạn có thể chọn một câu hỏi gợi ý hoặc bấm “Chat với người bán” nếu muốn liên hệ trực tiếp với nhân viên. Tin nhắn này chưa được gửi cho người bán.";
}
