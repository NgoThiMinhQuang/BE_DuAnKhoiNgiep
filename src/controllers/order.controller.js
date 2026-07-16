import {
  cancelCustomerOrder, getCustomerOrderReviews, getCustomerOrders, submitCustomerOrderReviews,
  createCustomerOrder, getCheckoutQuote,
} from "../services/order.service.js";

export async function quoteMyCheckout(request, response, next) {
  try { response.json({ success: true, data: await getCheckoutQuote(request.auth.userId, request.body) }); }
  catch (error) { next(error); }
}
export async function createMyOrder(request, response, next) {
  try { response.status(201).json({ success: true, data: await createCustomerOrder(request.auth.userId, request.body) }); }
  catch (error) { next(error); }
}

export async function listMyOrders(request, response, next) {
  try { response.json({ success: true, data: { orders: await getCustomerOrders(request.auth.userId) } }); }
  catch (error) { next(error); }
}
export async function cancelMyOrder(request, response, next) {
  try { await cancelCustomerOrder(request.auth.userId, request.params.id, request.body.reason); response.json({ success: true }); }
  catch (error) { next(error); }
}
export async function reviewMyOrder(request, response, next) {
  try { await submitCustomerOrderReviews(request.auth.userId, request.params.id, request.body.reviews ?? []); response.status(201).json({ success: true }); }
  catch (error) { next(error); }
}
export async function listMyOrderReviews(request, response, next) {
  try { response.json({ success: true, data: { reviews: await getCustomerOrderReviews(request.auth.userId, request.params.id) } }); }
  catch (error) { next(error); }
}
