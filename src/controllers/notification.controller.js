import {
  getUserNotifications,
  readAllUserNotifications,
  readUserNotification,
  subscribeUserPush,
  unsubscribeUserPush,
} from "../services/notification.service.js";

export async function listNotifications(request, response, next) {
  try { response.json({ success: true, data: await getUserNotifications(request.auth.userId, request.query) }); }
  catch (error) { next(error); }
}

export async function markNotificationRead(request, response, next) {
  try { response.json({ success: true, data: await readUserNotification(request.auth.userId, request.params.id) }); }
  catch (error) { next(error); }
}

export async function markAllNotificationsRead(request, response, next) {
  try { response.json({ success: true, data: await readAllUserNotifications(request.auth.userId) }); }
  catch (error) { next(error); }
}

export async function subscribePush(request, response, next) {
  try { response.status(201).json({ success: true, data: await subscribeUserPush(request.auth.userId, request.body) }); }
  catch (error) { next(error); }
}

export async function unsubscribePush(request, response, next) {
  try { response.json({ success: true, data: await unsubscribeUserPush(request.auth.userId, request.body) }); }
  catch (error) { next(error); }
}
