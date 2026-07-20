import { database } from "../config/database.js";

export async function expirePendingBankTransfers() {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [payments] = await connection.execute(`
      SELECT gdt.id, gdt.don_hang_id, dh.khuyen_mai_id
      FROM giao_dich_thanh_toan gdt
      INNER JOIN don_hang dh ON dh.id=gdt.don_hang_id
      WHERE gdt.trang_thai='CHO_THANH_TOAN'
        AND gdt.het_han_luc IS NOT NULL AND gdt.het_han_luc<=NOW()
        AND dh.trang_thai_thanh_toan='CHUA_THANH_TOAN'
        AND dh.trang_thai_don_hang='CHO_XAC_NHAN'
      FOR UPDATE
    `);

    for (const payment of payments) {
      const [items] = await connection.execute(`
        SELECT san_pham_id, so_luong FROM chi_tiet_don_hang
        WHERE don_hang_id=? AND san_pham_id IS NOT NULL FOR UPDATE
      `, [payment.don_hang_id]);
      for (const item of items) {
        await connection.execute(`
          UPDATE san_pham
          SET so_luong_giu_cho=GREATEST(so_luong_giu_cho-?, 0)
          WHERE id=?
        `, [item.so_luong, item.san_pham_id]);
      }
      await connection.execute("UPDATE giao_dich_thanh_toan SET trang_thai='HET_HAN' WHERE id=?", [payment.id]);
      await connection.execute(`
        UPDATE don_hang
        SET trang_thai_don_hang='DA_HUY', ly_do_huy='Hết thời hạn thanh toán chuyển khoản'
        WHERE id=?
      `, [payment.don_hang_id]);
      await connection.execute(`
        UPDATE phieu_xuat SET trang_thai='DA_HUY'
        WHERE don_hang_id=? AND trang_thai='NHAP_TAM'
      `, [payment.don_hang_id]);
      if (payment.khuyen_mai_id) {
        await connection.execute("DELETE FROM lich_su_su_dung_khuyen_mai WHERE don_hang_id=?", [payment.don_hang_id]);
        await connection.execute(`
          UPDATE khuyen_mai SET so_luot_da_su_dung=GREATEST(so_luot_da_su_dung-1, 0)
          WHERE id=?
        `, [payment.khuyen_mai_id]);
      }
    }
    await connection.commit();
    return payments.length;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
