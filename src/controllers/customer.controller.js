import {
  addCustomerAddress,
  changeCustomerPassword,
  getCustomer,
  loginCustomer,
  makeCustomerAddressDefault,
  registerCustomer,
  removeCustomerAddress,
  updateCustomer,
  googleLoginCustomer,
  requestPasswordReset,
  resetForgottenPassword,
} from "../services/customer.service.js";
import { getCustomerSupportMessages, readCustomerSupportMessages } from "../services/contact.service.js";
import { answerCustomerChatbot, getCustomerChatHistory } from "../services/chatbot.service.js";

export async function askChatbot(request, response, next) {
  try {
    const message = String(request.body?.message ?? "").trim();
    if (!message || message.length > 2000) throw Object.assign(new Error("Nội dung câu hỏi không hợp lệ"), { statusCode: 400 });
    response.json({ success: true, data: await answerCustomerChatbot(request.auth.userId, message) });
  } catch (error) { next(error); }
}

export async function showChatbotHistory(request, response, next) {
  try { response.json({ success: true, data: { messages: await getCustomerChatHistory(request.auth.userId) } }); }
  catch (error) { next(error); }
}

export async function register(request, response, next) {
  try { response.status(201).json({ success: true, data: await registerCustomer(request.body) }); }
  catch (error) { next(error); }
}

export async function login(request, response, next) {
  try { response.json({ success: true, data: await loginCustomer(request.body) }); }
  catch (error) { next(error); }
}

export async function googleLogin(request, response, next) {
  try { response.json({ success: true, data: await googleLoginCustomer(request.body.credential) }); }
  catch (error) { next(error); }
}

export async function forgotPassword(request, response, next) {
  try { response.json({ success: true, data: await requestPasswordReset(request.body.email) }); }
  catch (error) { next(error); }
}

export async function resetPassword(request, response, next) {
  try {
    await resetForgottenPassword(request.body.token, request.body.newPassword);
    response.json({ success: true, data: { message: "Đặt lại mật khẩu thành công" } });
  } catch (error) { next(error); }
}

export async function showMe(request, response, next) {
  try { response.json({ success: true, data: { user: await getCustomer(request.auth.userId) } }); }
  catch (error) { next(error); }
}

export async function updateMe(request, response, next) {
  try { response.json({ success: true, data: { user: await updateCustomer(request.auth.userId, request.body) } }); }
  catch (error) { next(error); }
}

export async function changePassword(request, response, next) {
  try {
    await changeCustomerPassword(request.auth.userId, request.body);
    response.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) { next(error); }
}

export async function addAddress(request, response, next) {
  try { response.status(201).json({ success: true, data: { user: await addCustomerAddress(request.auth.userId, request.body) } }); }
  catch (error) { next(error); }
}

export async function makeAddressDefault(request, response, next) {
  try { response.json({ success: true, data: { user: await makeCustomerAddressDefault(request.auth.userId, request.params.id) } }); }
  catch (error) { next(error); }
}

export async function removeAddress(request, response, next) {
  try { response.json({ success: true, data: { user: await removeCustomerAddress(request.auth.userId, request.params.id) } }); }
  catch (error) { next(error); }
}

export async function listSupportMessages(request, response, next) {
  try { response.json({ success: true, data: await getCustomerSupportMessages(request.auth.userId) }); }
  catch (error) { next(error); }
}

export async function markSupportMessagesRead(request, response, next) {
  try { response.json({ success: true, data: await readCustomerSupportMessages(request.auth.userId) }); }
  catch (error) { next(error); }
}
