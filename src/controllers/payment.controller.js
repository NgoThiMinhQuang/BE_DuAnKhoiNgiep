import { getOrderPaymentForCustomer, processSePayWebhook } from "../services/payment.service.js";

export async function showMyOrderPayment(request, response, next) {
  try {
    const data = await getOrderPaymentForCustomer(request.auth.userId, request.params.id);
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function receiveSePayWebhook(request, response, next) {
  try {
    await processSePayWebhook({
      rawBody: request.rawBody,
      signature: request.headers["x-sepay-signature"],
      timestamp: request.headers["x-sepay-timestamp"],
    });
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
}
