import {
  addCustomerAddress,
  changeCustomerPassword,
  getCustomer,
  loginCustomer,
  makeCustomerAddressDefault,
  registerCustomer,
  removeCustomerAddress,
  socialLoginCustomer,
  updateCustomer,
} from "../services/customer.service.js";

export async function register(request, response, next) {
  try { response.status(201).json({ success: true, data: await registerCustomer(request.body) }); }
  catch (error) { next(error); }
}

export async function login(request, response, next) {
  try { response.json({ success: true, data: await loginCustomer(request.body) }); }
  catch (error) { next(error); }
}

export async function socialLogin(request, response, next) {
  try { response.json({ success: true, data: await socialLoginCustomer(request.body.provider) }); }
  catch (error) { next(error); }
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
