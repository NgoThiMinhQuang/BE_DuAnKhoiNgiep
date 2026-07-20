import { submitContact } from "../services/contact.service.js";
import { answerPublicChatbot } from "../services/chatbot.service.js";

export async function answerChatbot(request, response, next) {
  try {
    const message = String(request.body?.message ?? "").trim();
    if (!message) throw Object.assign(new Error("Nội dung câu hỏi là bắt buộc"), { statusCode: 400 });
    if (message.length > 2000) throw Object.assign(new Error("Câu hỏi vượt quá độ dài cho phép"), { statusCode: 400 });
    response.json({ success: true, data: { answer: await answerPublicChatbot(message) } });
  } catch (error) {
    next(error);
  }
}

export async function createContact(request, response, next) {
  try {
    response.status(201).json({ success: true, data: await submitContact(request.body) });
  } catch (error) {
    next(error);
  }
}
