import { database } from "../config/database.js";

export async function createContact(input) {
  const [result] = await database.execute(`
    INSERT INTO lien_he (ho_ten, email, so_dien_thoai, tieu_de, noi_dung)
    VALUES (?, ?, ?, ?, ?)
  `, [input.fullName, input.email, input.phone, input.subject, input.message]);
  return result.insertId;
}

export async function findContactsByEmail(email) {
  const [rows] = await database.execute(`
    SELECT id, tieu_de, noi_dung, trang_thai, ghi_chu_admin, ngay_tao
    FROM lien_he
    WHERE email=?
    ORDER BY ngay_tao ASC
  `, [email]);
  return rows;
}

export async function updateContactReplies(contactId, email, adminNote) {
  const [result] = await database.execute(`
    UPDATE lien_he SET ghi_chu_admin=? WHERE id=? AND email=?
  `, [adminNote, contactId, email]);
  return result.affectedRows > 0;
}
