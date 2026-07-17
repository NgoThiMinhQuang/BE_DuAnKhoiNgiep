import { database } from "../config/database.js";

export async function createContact(input) {
  const [result] = await database.execute(`
    INSERT INTO lien_he (ho_ten, email, so_dien_thoai, tieu_de, noi_dung)
    VALUES (?, ?, ?, ?, ?)
  `, [input.fullName, input.email, input.phone, input.subject, input.message]);
  return result.insertId;
}
