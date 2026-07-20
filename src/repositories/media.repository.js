import { database } from "../config/database.js";

export async function insertUploadedImage({ uploaderId, fileName, mimeType, size, data }) {
  const [result] = await database.execute(`
    INSERT INTO tep_anh (
      nguoi_tai_len_id, ten_tep, loai_mime, kich_thuoc, du_lieu
    ) VALUES (?, ?, ?, ?, ?)
  `, [uploaderId, fileName, mimeType, size, data]);
  return result.insertId;
}

export async function findUploadedImage(imageId) {
  const [rows] = await database.execute(`
    SELECT id, ten_tep, loai_mime, kich_thuoc, du_lieu
    FROM tep_anh
    WHERE id=?
    LIMIT 1
  `, [imageId]);
  return rows[0] ?? null;
}
