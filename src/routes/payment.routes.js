import { Router } from "express";

import { receiveSePayWebhook } from "../controllers/payment.controller.js";

export const paymentRouter = Router();

paymentRouter.post("/sepay/webhook", receiveSePayWebhook);
