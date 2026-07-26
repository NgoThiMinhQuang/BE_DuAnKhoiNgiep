import { database } from "../config/database.js";
import { calculateOrderReward, calculateReviewReward } from "../domain/loyalty.js";

async function ensureWallet(connection, userId) {
  const [wallets] = await connection.execute(
    "SELECT * FROM vi_xu WHERE nguoi_dung_id=? FOR UPDATE",
    [userId],
  );
  if (wallets[0]) return wallets[0];
  const [tiers] = await connection.execute(`
    SELECT id FROM hang_thanh_vien
    WHERE trang_thai='HOAT_DONG'
    ORDER BY chi_tieu_toi_thieu ASC LIMIT 1
  `);
  const [result] = await connection.execute(`
    INSERT INTO vi_xu (nguoi_dung_id, hang_thanh_vien_id)
    VALUES (?, ?)
  `, [userId, tiers[0].id]);
  return {
    id: result.insertId,
    nguoi_dung_id: userId,
    hang_thanh_vien_id: tiers[0].id,
    so_du_kha_dung: 0,
    so_du_giu_cho: 0,
    xu_cho_thu_hoi: 0,
    chi_tieu_xep_hang: 0,
  };
}

async function findTransaction(connection, reference) {
  const [rows] = await connection.execute(
    "SELECT * FROM giao_dich_xu WHERE ma_tham_chieu=? LIMIT 1",
    [reference],
  );
  return rows[0] ?? null;
}

async function addCoins(connection, {
  userId, orderId = null, reviewId = null, type, amount, reference, content, actorId = null,
}) {
  if (amount <= 0 || await findTransaction(connection, reference)) return false;
  const wallet = await ensureWallet(connection, userId);
  const recovered = Math.min(Number(wallet.xu_cho_thu_hoi), amount);
  const credited = amount - recovered;
  const balance = Number(wallet.so_du_kha_dung) + credited;
  await connection.execute(`
    UPDATE vi_xu
    SET so_du_kha_dung=?, xu_cho_thu_hoi=GREATEST(xu_cho_thu_hoi-?, 0)
    WHERE id=?
  `, [balance, recovered, wallet.id]);
  await connection.execute(`
    INSERT INTO giao_dich_xu (
      nguoi_dung_id, don_hang_id, danh_gia_id, loai_giao_dich,
      so_xu, so_du_sau_giao_dich, ma_tham_chieu, noi_dung, nguoi_thuc_hien_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [userId, orderId, reviewId, type, amount, balance, reference,
    recovered ? `${content} (${recovered.toLocaleString("vi-VN")} xu được dùng để thu hồi công nợ)` : content,
    actorId]);
  return true;
}

async function removeCoins(connection, {
  userId, orderId = null, reviewId = null, type, amount, reference, content, actorId = null,
}) {
  if (amount <= 0 || await findTransaction(connection, reference)) return false;
  const wallet = await ensureWallet(connection, userId);
  const deducted = Math.min(Number(wallet.so_du_kha_dung), amount);
  const debt = amount - deducted;
  const balance = Number(wallet.so_du_kha_dung) - deducted;
  await connection.execute(`
    UPDATE vi_xu
    SET so_du_kha_dung=?, xu_cho_thu_hoi=xu_cho_thu_hoi+?
    WHERE id=?
  `, [balance, debt, wallet.id]);
  await connection.execute(`
    INSERT INTO giao_dich_xu (
      nguoi_dung_id, don_hang_id, danh_gia_id, loai_giao_dich,
      so_xu, so_du_sau_giao_dich, ma_tham_chieu, noi_dung, nguoi_thuc_hien_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [userId, orderId, reviewId, type, -amount, balance, reference,
    debt ? `${content} (${debt.toLocaleString("vi-VN")} xu chờ thu hồi)` : content,
    actorId]);
  return true;
}

async function updateMemberTier(connection, wallet, reason) {
  const [tiers] = await connection.execute(`
    SELECT * FROM hang_thanh_vien
    WHERE trang_thai='HOAT_DONG' AND chi_tieu_toi_thieu<=?
    ORDER BY chi_tieu_toi_thieu DESC LIMIT 1
  `, [wallet.chi_tieu_xep_hang]);
  const nextTier = tiers[0];
  if (!nextTier || Number(nextTier.id) === Number(wallet.hang_thanh_vien_id)) return;
  const [currentTiers] = await connection.execute(
    "SELECT chi_tieu_toi_thieu FROM hang_thanh_vien WHERE id=?",
    [wallet.hang_thanh_vien_id],
  );
  if (Number(nextTier.chi_tieu_toi_thieu) <= Number(currentTiers[0]?.chi_tieu_toi_thieu ?? 0)) return;
  await connection.execute("UPDATE vi_xu SET hang_thanh_vien_id=? WHERE id=?", [nextTier.id, wallet.id]);
  await connection.execute(`
    INSERT INTO lich_su_hang_thanh_vien (
      nguoi_dung_id, hang_cu_id, hang_moi_id, chi_tieu_tai_thoi_diem, ly_do
    ) VALUES (?, ?, ?, ?, ?)
  `, [wallet.nguoi_dung_id, wallet.hang_thanh_vien_id, nextTier.id, wallet.chi_tieu_xep_hang, reason]);
}

export async function rewardApprovedReview(connection, review, actorId) {
  const reference = `REVIEW_REWARD:${review.id}`;
  if (await findTransaction(connection, reference)) return 0;
  const [totals] = await connection.execute(`
    SELECT COALESCE(SUM(gdx.so_xu), 0) AS rewarded
    FROM giao_dich_xu gdx
    WHERE gdx.don_hang_id=? AND gdx.loai_giao_dich='THUONG_DANH_GIA'
  `, [review.don_hang_id]);
  const reward = calculateReviewReward(review.noi_dung, Number(totals[0].rewarded));
  await addCoins(connection, {
    userId: review.nguoi_dung_id, orderId: review.don_hang_id, reviewId: review.id,
    type: "THUONG_DANH_GIA", amount: reward, reference,
    content: `Thưởng đánh giá sản phẩm #${review.san_pham_id}`, actorId,
  });
  return reward;
}

export async function reverseReviewReward(connection, review, actorId) {
  const reward = await findTransaction(connection, `REVIEW_REWARD:${review.id}`);
  if (!reward) return 0;
  const amount = Math.abs(Number(reward.so_xu));
  await removeCoins(connection, {
    userId: review.nguoi_dung_id, orderId: review.don_hang_id, reviewId: review.id,
    type: "HOAN_TAC_DANH_GIA", amount, reference: `REVIEW_REVERSAL:${review.id}`,
    content: `Thu hồi thưởng đánh giá #${review.id}`, actorId,
  });
  return amount;
}

export async function rewardDeliveredOrder(connection, order, actorId) {
  const reference = `ORDER_REWARD:${order.id}`;
  if (await findTransaction(connection, reference)) return 0;
  const wallet = await ensureWallet(connection, order.nguoi_dung_id);
  const [tiers] = await connection.execute(
    "SELECT * FROM hang_thanh_vien WHERE id=? FOR UPDATE",
    [wallet.hang_thanh_vien_id],
  );
  const rate = Number(tiers[0].ty_le_tich_xu);
  const { eligibleSpend, coins: reward } = calculateOrderReward(
    order.tong_tien_hang,
    order.tien_giam,
    rate,
  );
  await addCoins(connection, {
    userId: order.nguoi_dung_id, orderId: order.id, type: "TICH_LUY_DON_HANG",
    amount: reward, reference, content: `Tích xu đơn ${order.ma_don_hang}`, actorId,
  });
  const nextSpend = Number(wallet.chi_tieu_xep_hang) + eligibleSpend;
  await connection.execute(`
    UPDATE vi_xu SET chi_tieu_xep_hang=? WHERE id=?
  `, [nextSpend, wallet.id]);
  await connection.execute(`
    UPDATE don_hang SET gia_tri_tich_luy=?, ty_le_tich_xu=?, xu_duoc_nhan=? WHERE id=?
  `, [eligibleSpend, rate, reward, order.id]);
  await updateMemberTier(connection, { ...wallet, chi_tieu_xep_hang: nextSpend }, `Hoàn tất đơn ${order.ma_don_hang}`);
  return reward;
}

export async function reverseReturnedOrderReward(connection, order, actorId) {
  const reward = await findTransaction(connection, `ORDER_REWARD:${order.id}`);
  if (!reward) return 0;
  const amount = Math.abs(Number(reward.so_xu));
  await removeCoins(connection, {
    userId: order.nguoi_dung_id, orderId: order.id, type: "THU_HOI_XU_HOAN_HANG",
    amount, reference: `ORDER_REWARD_REVERSAL:${order.id}`,
    content: `Thu hồi xu do hoàn đơn ${order.ma_don_hang}`, actorId,
  });
  const wallet = await ensureWallet(connection, order.nguoi_dung_id);
  await connection.execute(`
    UPDATE vi_xu SET chi_tieu_xep_hang=GREATEST(chi_tieu_xep_hang-?, 0) WHERE id=?
  `, [Number(order.gia_tri_tich_luy), wallet.id]);
  return amount;
}

export async function findCustomerLoyalty(userId, { limit = 20, offset = 0 } = {}) {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const wallet = await ensureWallet(connection, userId);
    await connection.commit();
    const [[summary], [nextTiers], [transactions], [counts]] = await Promise.all([
      database.execute(`
        SELECT vx.*, h.ma_hang, h.ten_hang, h.ty_le_tich_xu, h.chi_tieu_toi_thieu
        FROM vi_xu vx INNER JOIN hang_thanh_vien h ON h.id=vx.hang_thanh_vien_id
        WHERE vx.nguoi_dung_id=?
      `, [userId]),
      database.execute(`
        SELECT id, ma_hang, ten_hang, chi_tieu_toi_thieu, ty_le_tich_xu
        FROM hang_thanh_vien
        WHERE trang_thai='HOAT_DONG' AND chi_tieu_toi_thieu>?
        ORDER BY chi_tieu_toi_thieu ASC LIMIT 1
      `, [wallet.chi_tieu_xep_hang]),
      database.query(`
        SELECT id, loai_giao_dich, so_xu, so_du_sau_giao_dich,
          ma_tham_chieu, noi_dung, ngay_tao
        FROM giao_dich_xu WHERE nguoi_dung_id=?
        ORDER BY id DESC LIMIT ? OFFSET ?
      `, [userId, limit, offset]),
      database.execute("SELECT COUNT(*) AS total FROM giao_dich_xu WHERE nguoi_dung_id=?", [userId]),
    ]);
    return { summary: summary[0], nextTier: nextTiers[0] ?? null, transactions, total: Number(counts[0].total) };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
