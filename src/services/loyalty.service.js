import { findCustomerLoyalty, rewardDailyCheckIn } from "../repositories/loyalty.repository.js";

export async function checkInCustomerDaily(userId) {
  return rewardDailyCheckIn(userId);
}

export async function getCustomerLoyalty(userId, query = {}) {
  const page = Math.max(Number.parseInt(query.page ?? "1", 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit ?? "20", 10) || 20, 1), 100);
  const result = await findCustomerLoyalty(userId, { limit, offset: (page - 1) * limit });
  const summary = result.summary;
  const nextTier = result.nextTier;
  return {
    wallet: {
      availableCoins: Number(summary.so_du_kha_dung),
      reservedCoins: Number(summary.so_du_giu_cho),
      pendingRecoveryCoins: Number(summary.xu_cho_thu_hoi),
    },
    member: {
      tierCode: summary.ma_hang,
      tierName: summary.ten_hang,
      earningRate: Number(summary.ty_le_tich_xu),
      eligibleSpend: Number(summary.chi_tieu_xep_hang),
      nextTier: nextTier ? {
        code: nextTier.ma_hang,
        name: nextTier.ten_hang,
        minimumSpend: Number(nextTier.chi_tieu_toi_thieu),
        earningRate: Number(nextTier.ty_le_tich_xu),
        remainingSpend: Math.max(0, Number(nextTier.chi_tieu_toi_thieu) - Number(summary.chi_tieu_xep_hang)),
      } : null,
    },
    dailyCheckIn: {
      rewardCoins: 100,
      claimedToday: Boolean(summary.da_diem_danh_hom_nay),
    },
    transactions: result.transactions.map((item) => ({
      id: String(item.id),
      type: item.loai_giao_dich,
      coins: Number(item.so_xu),
      balanceAfter: Number(item.so_du_sau_giao_dich),
      reference: item.ma_tham_chieu,
      content: item.noi_dung,
      createdAt: item.ngay_tao,
    })),
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}
