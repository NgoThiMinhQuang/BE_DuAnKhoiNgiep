const moneyScale = 100;

function roundMoney(value) {
  return Math.round(value * moneyScale) / moneyScale;
}

export function calculateProfitability(netRevenue, costOfGoodsSold) {
  const revenue = Number(netRevenue);
  const cost = Number(costOfGoodsSold);
  if (![revenue, cost].every(Number.isFinite) || revenue < 0 || cost < 0) {
    throw new TypeError("Dữ liệu tính lợi nhuận không hợp lệ");
  }

  const grossProfit = roundMoney(revenue - cost);
  const grossMargin = revenue > 0
    ? Math.round((grossProfit / revenue) * 1000) / 10
    : 0;

  return { netRevenue: revenue, costOfGoodsSold: cost, grossProfit, grossMargin };
}
