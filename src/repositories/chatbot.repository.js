import { database } from "../config/database.js";

export async function getPublicChatSettings() {
  const [rows] = await database.query("SELECT phi_van_chuyen, nguong_mien_phi_van_chuyen, hotline, email, email_ho_tro, gio_lam_viec FROM cau_hinh_cua_hang ORDER BY id LIMIT 1");
  return rows[0] ?? {};
}

export async function getChatContext(userId) {
  const [[settings], [faq], [orders], [products]] = await Promise.all([
    database.query("SELECT * FROM cau_hinh_cua_hang ORDER BY id LIMIT 1"),
    database.query("SELECT intent, noi_dung FROM cau_hoi_thuong_gap WHERE trang_thai='HOAT_DONG'"),
    database.execute(`SELECT ma_don_hang, trang_thai_don_hang, trang_thai_thanh_toan, ma_van_don
      FROM don_hang WHERE nguoi_dung_id=? ORDER BY ngay_tao DESC LIMIT 10`, [userId]),
    database.query(`SELECT id, ten_san_pham, duong_dan, gia_ban, thanh_phan, cong_dung,
      (so_luong_ton-so_luong_giu_cho) AS stock FROM san_pham
      WHERE trang_thai='DANG_BAN' AND so_luong_ton>so_luong_giu_cho ORDER BY la_noi_bat DESC, gia_ban LIMIT 20`),
  ]);
  return { settings: settings[0] ?? {}, faq: Object.fromEntries(faq.map((x) => [x.intent, x.noi_dung])), orders, products };
}

export async function saveChatExchange(userId, message, answer, intent) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [sessions] = await connection.execute("SELECT id FROM phien_chat WHERE nguoi_dung_id=? AND kenh='BOT' AND trang_thai='DANG_MO' ORDER BY id DESC LIMIT 1 FOR UPDATE", [userId]);
    let sessionId = sessions[0]?.id;
    if (!sessionId) {
      const [created] = await connection.execute("INSERT INTO phien_chat (nguoi_dung_id, kenh) VALUES (?, 'BOT')", [userId]);
      sessionId = created.insertId;
    }
    await connection.execute("INSERT INTO tin_nhan_chat (phien_chat_id, loai_nguoi_gui, noi_dung, intent) VALUES (?, 'KHACH_HANG', ?, ?), (?, 'BOT', ?, ?)", [sessionId, message, intent, sessionId, answer, intent]);
    await connection.commit();
    return sessionId;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

export async function findChatHistory(userId) {
  const [rows] = await database.execute(`SELECT t.id, t.loai_nguoi_gui, t.noi_dung, t.intent, t.ngay_gui
    FROM phien_chat p INNER JOIN tin_nhan_chat t ON t.phien_chat_id=p.id
    WHERE p.nguoi_dung_id=? AND p.kenh='BOT' ORDER BY t.id DESC LIMIT 100`, [userId]);
  return rows.reverse();
}

export async function transferChatToSeller(userId) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.execute("SELECT ho_ten, email, so_dien_thoai FROM nguoi_dung WHERE id=?", [userId]);
    const [messages] = await connection.execute(`SELECT t.loai_nguoi_gui, t.noi_dung FROM phien_chat p
      INNER JOIN tin_nhan_chat t ON t.phien_chat_id=p.id WHERE p.nguoi_dung_id=? AND p.kenh='BOT' ORDER BY t.id DESC LIMIT 20`, [userId]);
    const context = messages.reverse().map((item) => `${item.loai_nguoi_gui}: ${item.noi_dung}`).join("\n");
    const [session] = await connection.execute("INSERT INTO phien_chat (nguoi_dung_id, kenh) VALUES (?, 'NGUOI_BAN')", [userId]);
    await connection.execute("INSERT INTO tin_nhan_chat (phien_chat_id, loai_nguoi_gui, noi_dung, intent) VALUES (?, 'KHACH_HANG', ?, 'TRANSFER_TO_SELLER')", [session.insertId, context]);
    await connection.execute("INSERT INTO lien_he (ho_ten, email, so_dien_thoai, tieu_de, noi_dung) VALUES (?, ?, ?, 'Chuyển từ trợ lý tự động', ?)", [users[0].ho_ten, users[0].email, users[0].so_dien_thoai, context]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}
