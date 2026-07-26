export function calculateReviewReward(content, rewardedForOrder = 0) {
  const requested = 300 + (String(content ?? "").trim().length >= 30 ? 700 : 0);
  return Math.max(0, Math.min(requested, 3000 - Number(rewardedForOrder)));
}

export function calculateOrderReward(subtotal, discount, earningRate) {
  const eligibleSpend = Math.max(0, Number(subtotal) - Number(discount));
  return {
    eligibleSpend,
    coins: Math.floor(eligibleSpend * Number(earningRate)),
  };
}
