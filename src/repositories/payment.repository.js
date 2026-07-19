import { database } from "../config/database.js";

export async function findCustomerPayment(userId, orderId) {
  const [rows] = await database.execute(`
    SELECT gdt.*, dh.ma_don_hang, dh.trang_thai_thanh_toan
    FROM giao_dich_thanh_toan gdt
    INNER JOIN don_hang dh ON dh.id=gdt.don_hang_id
    WHERE dh.id=? AND dh.nguoi_dung_id=? AND dh.phuong_thuc_thanh_toan='CHUYEN_KHOAN'
    LIMIT 1
  `, [orderId, userId]);
  return rows[0] ?? null;
}

async function updateWebhookLog(connection, transactionId, status, reason, orderId = null) {
  await connection.execute(`
    UPDATE sepay_webhook_log
    SET trang_thai=?, ly_do=?, don_hang_id=?
    WHERE sepay_transaction_id=?
  `, [status, reason, orderId, transactionId]);
}

export async function handleSePayTransaction({
  payload, transactionId, transferAmount, paymentCode, expectedAccountNumber,
}) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [insertResult] = await connection.execute(`
      INSERT IGNORE INTO sepay_webhook_log (
        sepay_transaction_id, ma_thanh_toan, payload_json, trang_thai
      ) VALUES (?, ?, ?, 'DA_NHAN')
    `, [transactionId, paymentCode, JSON.stringify(payload)]);

    if (!insertResult.affectedRows) {
      await connection.commit();
      return;
    }

    if (String(payload.transferType ?? "").toLowerCase() !== "in") {
      await updateWebhookLog(connection, transactionId, "BO_QUA", "Không phải giao dịch tiền vào");
      await connection.commit();
      return;
    }

    const receivedAccountNumbers = [payload.accountNumber, payload.subAccount]
      .map((accountNumber) => String(accountNumber ?? "").trim())
      .filter(Boolean);
    if (!receivedAccountNumbers.includes(String(expectedAccountNumber).trim())) {
      await updateWebhookLog(connection, transactionId, "BO_QUA", "Không đúng tài khoản nhận tiền");
      await connection.commit();
      return;
    }

    if (!paymentCode) {
      await updateWebhookLog(connection, transactionId, "KHONG_KHOP", "Không nhận diện được mã thanh toán");
      await connection.commit();
      return;
    }

    const [payments] = await connection.execute(`
      SELECT gdt.id, gdt.don_hang_id, gdt.so_tien, gdt.trang_thai,
        dh.phuong_thuc_thanh_toan, dh.trang_thai_thanh_toan, dh.trang_thai_don_hang
      FROM giao_dich_thanh_toan gdt
      INNER JOIN don_hang dh ON dh.id=gdt.don_hang_id
      WHERE gdt.ma_thanh_toan=?
      FOR UPDATE
    `, [paymentCode]);
    const payment = payments[0];

    if (!payment) {
      await updateWebhookLog(connection, transactionId, "KHONG_KHOP", "Không tìm thấy đơn hàng theo mã thanh toán");
      await connection.commit();
      return;
    }

    if (Number(payment.so_tien) !== transferAmount) {
      await updateWebhookLog(
        connection, transactionId, "SAI_SO_TIEN",
        `Cần ${Number(payment.so_tien)} nhưng nhận ${transferAmount}`,
        payment.don_hang_id,
      );
      await connection.commit();
      return;
    }

    if (
      payment.phuong_thuc_thanh_toan !== "CHUYEN_KHOAN"
      || payment.trang_thai_thanh_toan !== "CHUA_THANH_TOAN"
      || payment.trang_thai !== "CHO_THANH_TOAN"
      || payment.trang_thai_don_hang === "DA_HUY"
    ) {
      await updateWebhookLog(connection, transactionId, "BO_QUA", "Đơn hàng không còn chờ thanh toán", payment.don_hang_id);
      await connection.commit();
      return;
    }

    const transactionDate = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(payload.transactionDate ?? ""))
      ? payload.transactionDate
      : null;
    await connection.execute(`
      UPDATE giao_dich_thanh_toan
      SET trang_thai='DA_THANH_TOAN', ma_giao_dich_nha_cung_cap=?,
        ngay_thanh_toan=COALESCE(?, NOW())
      WHERE id=? AND trang_thai='CHO_THANH_TOAN'
    `, [transactionId, transactionDate, payment.id]);
    await connection.execute(`
      UPDATE don_hang
      SET trang_thai_thanh_toan='DA_THANH_TOAN'
      WHERE id=? AND trang_thai_thanh_toan='CHUA_THANH_TOAN'
    `, [payment.don_hang_id]);
    await updateWebhookLog(connection, transactionId, "DA_XU_LY", null, payment.don_hang_id);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
