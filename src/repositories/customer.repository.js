import { database } from "../config/database.js";

export async function findUserByEmail(email) {
  const [rows] = await database.execute("SELECT * FROM nguoi_dung WHERE email=? LIMIT 1", [email]);
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await database.execute("SELECT * FROM nguoi_dung WHERE id=? LIMIT 1", [id]);
  return rows[0] ?? null;
}

export async function findAddressesByUserId(userId) {
  const [rows] = await database.execute(`
    SELECT * FROM dia_chi_nguoi_dung
    WHERE nguoi_dung_id=?
    ORDER BY la_mac_dinh DESC, id DESC
  `, [userId]);
  return rows;
}

export async function insertUser({ fullName, email, phone, passwordHash }) {
  const [result] = await database.execute(`
    INSERT INTO nguoi_dung (ho_ten, email, so_dien_thoai, mat_khau_hash, vai_tro, trang_thai)
    VALUES (?, ?, NULLIF(?, ''), ?, 'KHACH_HANG', 'HOAT_DONG')
  `, [fullName, email, phone, passwordHash]);
  return result.insertId;
}

export async function updateUserProfile(userId, { fullName, email, phone, avatar }) {
  await database.execute(`
    UPDATE nguoi_dung
    SET ho_ten=?, email=?, so_dien_thoai=NULLIF(?, ''), anh_dai_dien_url=?
    WHERE id=?
  `, [fullName, email, phone, avatar || null, userId]);
}

export async function updateUserPassword(userId, passwordHash) {
  await database.execute("UPDATE nguoi_dung SET mat_khau_hash=? WHERE id=?", [passwordHash, userId]);
}

export async function insertAddress(userId, input) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [[countRow]] = await connection.execute("SELECT COUNT(*) AS total FROM dia_chi_nguoi_dung WHERE nguoi_dung_id=?", [userId]);
    const isDefault = countRow.total === 0 || input.isDefault;
    if (isDefault) await connection.execute("UPDATE dia_chi_nguoi_dung SET la_mac_dinh=0 WHERE nguoi_dung_id=?", [userId]);
    const [result] = await connection.execute(`
      INSERT INTO dia_chi_nguoi_dung (
        nguoi_dung_id, ten_nguoi_nhan, so_dien_thoai, tinh_thanh,
        quan_huyen, phuong_xa, dia_chi_chi_tiet, la_mac_dinh
      ) VALUES (?, ?, ?, ?, '', ?, ?, ?)
    `, [userId, input.recipientName, input.phone, input.provinceName, input.wardName, input.detail, isDefault ? 1 : 0]);
    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function setDefaultAddress(userId, addressId) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [target] = await connection.execute("SELECT id FROM dia_chi_nguoi_dung WHERE id=? AND nguoi_dung_id=?", [addressId, userId]);
    if (!target.length) return false;
    await connection.execute("UPDATE dia_chi_nguoi_dung SET la_mac_dinh=0 WHERE nguoi_dung_id=?", [userId]);
    await connection.execute("UPDATE dia_chi_nguoi_dung SET la_mac_dinh=1 WHERE id=? AND nguoi_dung_id=?", [addressId, userId]);
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteAddress(userId, addressId) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute("SELECT la_mac_dinh FROM dia_chi_nguoi_dung WHERE id=? AND nguoi_dung_id=?", [addressId, userId]);
    if (!rows.length) return false;
    await connection.execute("DELETE FROM dia_chi_nguoi_dung WHERE id=? AND nguoi_dung_id=?", [addressId, userId]);
    if (rows[0].la_mac_dinh) {
      await connection.execute(`
        UPDATE dia_chi_nguoi_dung SET la_mac_dinh=1
        WHERE id=(SELECT id FROM (SELECT id FROM dia_chi_nguoi_dung WHERE nguoi_dung_id=? ORDER BY id DESC LIMIT 1) next_address)
      `, [userId]);
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
