import { database } from "../config/database.js";

export async function findNotificationsByUser(userId, limit) {
  const [items, unreadRows] = await Promise.all([
    database.query(`
      SELECT id, loai, tieu_de, noi_dung, duong_dan, da_doc, ngay_doc, ngay_tao
      FROM thong_bao
      WHERE nguoi_dung_id=?
      ORDER BY ngay_tao DESC, id DESC
      LIMIT ?
    `, [userId, limit]),
    database.execute(`
      SELECT COUNT(*) AS total
      FROM thong_bao
      WHERE nguoi_dung_id=? AND da_doc=0
    `, [userId]),
  ]);
  return { rows: items[0], unread: Number(unreadRows[0][0]?.total ?? 0) };
}

export async function insertNotifications(userIds, notification) {
  const uniqueUserIds = [...new Set(userIds.map(Number).filter(Number.isInteger))];
  if (!uniqueUserIds.length) return [];
  const placeholders = uniqueUserIds.map(() => "(?, ?, ?, ?, ?)").join(", ");
  const values = uniqueUserIds.flatMap((userId) => [
    userId, notification.type, notification.title, notification.content, notification.path ?? null,
  ]);
  const [result] = await database.execute(`
    INSERT INTO thong_bao (nguoi_dung_id, loai, tieu_de, noi_dung, duong_dan)
    VALUES ${placeholders}
  `, values);
  return uniqueUserIds.map((userId, index) => ({
    userId, notificationId: String(Number(result.insertId) + index),
  }));
}

export async function findActiveAdminIds() {
  const [rows] = await database.execute(`
    SELECT id FROM nguoi_dung
    WHERE vai_tro='ADMIN' AND trang_thai='HOAT_DONG'
  `);
  return rows.map((row) => Number(row.id));
}

export async function markNotificationRead(userId, notificationId) {
  const [result] = await database.execute(`
    UPDATE thong_bao
    SET da_doc=1, ngay_doc=COALESCE(ngay_doc, NOW())
    WHERE id=? AND nguoi_dung_id=?
  `, [notificationId, userId]);
  return result.affectedRows > 0;
}

export async function markAllNotificationsRead(userId) {
  const [result] = await database.execute(`
    UPDATE thong_bao
    SET da_doc=1, ngay_doc=COALESCE(ngay_doc, NOW())
    WHERE nguoi_dung_id=? AND da_doc=0
  `, [userId]);
  return Number(result.affectedRows);
}

export async function upsertPushSubscription(userId, subscription) {
  await database.execute(`
    INSERT INTO dang_ky_push (nguoi_dung_id, endpoint, p256dh, auth, user_agent)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      nguoi_dung_id=VALUES(nguoi_dung_id), p256dh=VALUES(p256dh),
      auth=VALUES(auth), user_agent=VALUES(user_agent), ngay_cap_nhat=NOW()
  `, [userId, subscription.endpoint, subscription.p256dh, subscription.auth, subscription.userAgent]);
}

export async function deletePushSubscription(userId, endpoint) {
  const [result] = await database.execute(
    "DELETE FROM dang_ky_push WHERE nguoi_dung_id=? AND endpoint=?",
    [userId, endpoint],
  );
  return result.affectedRows > 0;
}

export async function deletePushSubscriptionById(subscriptionId) {
  await database.execute("DELETE FROM dang_ky_push WHERE id=?", [subscriptionId]);
}

export async function findPushSubscriptionsByUsers(userIds) {
  const uniqueUserIds = [...new Set(userIds.map(Number).filter(Number.isInteger))];
  if (!uniqueUserIds.length) return [];
  const [rows] = await database.query(`
    SELECT id, nguoi_dung_id, endpoint, p256dh, auth
    FROM dang_ky_push
    WHERE nguoi_dung_id IN (?)
  `, [uniqueUserIds]);
  return rows;
}
