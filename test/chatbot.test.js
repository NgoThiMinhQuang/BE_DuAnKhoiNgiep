import test from "node:test";
import assert from "node:assert/strict";

import { findChatbotAnswer } from "../src/services/chatbot.service.js";

test("chatbot matches Vietnamese questions with accents", () => {
  assert.match(findChatbotAnswer("Phí vận chuyển là bao nhiêu?"), /30\.000đ/);
  assert.match(findChatbotAnswer("Bao lâu thì giao hàng tới?"), /2–5 ngày/);
});

test("chatbot matches questions without accents", () => {
  assert.match(findChatbotAnswer("lam sao theo doi don hang"), /Đơn hàng của tôi/);
  assert.match(findChatbotAnswer("toi muon doi tra"), /đổi trả/);
});

test("chatbot does not forward unknown questions without customer action", () => {
  assert.match(findChatbotAnswer("Tôi có một yêu cầu đặc biệt"), /chưa được gửi cho người bán/);
});
