import { Router } from "express";

import {
  listNotifications, markAllNotificationsRead, markNotificationRead, subscribePush, unsubscribePush,
} from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const notificationRouter = Router();
export const pushRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get("/", listNotifications);
notificationRouter.patch("/read-all", markAllNotificationsRead);
notificationRouter.patch("/:id/read", markNotificationRead);

pushRouter.use(authenticate);
pushRouter.post("/subscribe", subscribePush);
pushRouter.delete("/subscribe", unsubscribePush);
