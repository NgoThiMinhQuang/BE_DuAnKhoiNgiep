import webPush from "web-push";

import { env } from "../config/env.js";
import {
  deletePushSubscription,
  deletePushSubscriptionById,
  findActiveAdminIds,
  findNotificationsByUser,
  findPushSubscriptionsByUsers,
  insertNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  upsertPushSubscription,
} from "../repositories/notification.repository.js";

const badRequest = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const pushConfigured = Boolean(env.push.publicKey && env.push.privateKey && env.push.subject);

if (pushConfigured) webPush.setVapidDetails(env.push.subject, env.push.publicKey, env.push.privateKey);

function mapNotification(row) {
  return {
    id: String(row.id), type: row.loai, title: row.tieu_de, content: row.noi_dung,
    path: row.duong_dan, read: Boolean(row.da_doc), readAt: row.ngay_doc, createdAt: row.ngay_tao,
  };
}

export async function getUserNotifications(userId, query = {}) {
  const limit = Math.min(Math.max(Number.parseInt(query.limit ?? "30", 10) || 30, 1), 100);
  const result = await findNotificationsByUser(userId, limit);
  return { items: result.rows.map(mapNotification), unread: result.unread };
}

export async function readUserNotification(userId, notificationId) {
  if (!/^\d+$/.test(String(notificationId))) throw badRequest("Thông báo không hợp lệ");
  if (!await markNotificationRead(userId, notificationId)) throw badRequest("Không tìm thấy thông báo", 404);
  return { id: String(notificationId), read: true };
}

export async function readAllUserNotifications(userId) {
  return { updated: await markAllNotificationsRead(userId) };
}

function normalizeSubscription(input = {}) {
  const endpoint = String(input.endpoint ?? "").trim();
  const p256dh = String(input.keys?.p256dh ?? input.p256dh ?? "").trim();
  const auth = String(input.keys?.auth ?? input.auth ?? "").trim();
  if (!endpoint.startsWith("https://") || endpoint.length > 1000 || !p256dh || !auth) {
    throw badRequest("Thông tin đăng ký nhận thông báo không hợp lệ");
  }
  if (p256dh.length > 255 || auth.length > 255) throw badRequest("Khóa đăng ký nhận thông báo không hợp lệ");
  return { endpoint, p256dh, auth, userAgent: String(input.userAgent ?? "").trim().slice(0, 500) || null };
}

export async function subscribeUserPush(userId, input) {
  if (!pushConfigured) throw badRequest("Máy chủ chưa cấu hình VAPID cho thông báo đẩy", 503);
  await upsertPushSubscription(userId, normalizeSubscription(input));
  return { subscribed: true };
}

export async function unsubscribeUserPush(userId, input) {
  const endpoint = String(input?.endpoint ?? "").trim();
  if (!endpoint) throw badRequest("Endpoint đăng ký là bắt buộc");
  await deletePushSubscription(userId, endpoint);
  return { subscribed: false };
}

async function sendPushToUsers(userIds, notification) {
  if (!pushConfigured) return;
  const subscriptions = await findPushSubscriptionsByUsers(userIds);
  const payload = JSON.stringify({
    title: notification.title, body: notification.content, path: notification.path ?? "/",
    type: notification.type, tag: notification.tag ?? `rubeanora-${notification.type}`,
    icon: "/rubeanora-icon.svg", badge: "/rubeanora-icon.svg",
  });
  await Promise.allSettled(subscriptions.map(async (item) => {
    try {
      await webPush.sendNotification({
        endpoint: item.endpoint,
        keys: { p256dh: item.p256dh, auth: item.auth },
      }, payload, { TTL: 60 * 60 * 24 });
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await deletePushSubscriptionById(item.id);
      } else {
        console.error("Không thể gửi Web Push:", error.message);
      }
    }
  }));
}

export async function notifyUsers(userIds, notification) {
  const uniqueUserIds = [...new Set(userIds.map(Number).filter(Number.isInteger))];
  if (!uniqueUserIds.length) return;
  try {
    await insertNotifications(uniqueUserIds, notification);
    void sendPushToUsers(uniqueUserIds, notification).catch((error) => {
      console.error("Không thể gửi thông báo đẩy:", error.message);
    });
  } catch (error) {
    console.error("Không thể tạo thông báo:", error.message);
  }
}

export async function notifyUser(userId, notification) {
  return notifyUsers([userId], notification);
}

export async function notifyAdmins(notification) {
  try {
    return await notifyUsers(await findActiveAdminIds(), notification);
  } catch (error) {
    console.error("Không thể tạo thông báo cho quản trị viên:", error.message);
  }
}
