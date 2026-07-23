const moneyScale = 100;

export function calculateWeightedAverageCost(currentStock, currentCost, incomingQuantity, incomingCost) {
  const stock = Number(currentStock);
  const cost = Number(currentCost);
  const quantity = Number(incomingQuantity);
  const purchaseCost = Number(incomingCost);
  if (![stock, cost, quantity, purchaseCost].every(Number.isFinite)
    || stock < 0 || cost < 0 || quantity <= 0 || purchaseCost < 0) {
    throw new TypeError("Dữ liệu tính giá vốn không hợp lệ");
  }
  const nextStock = stock + quantity;
  return Math.round((((stock * cost) + (quantity * purchaseCost)) / nextStock) * moneyScale) / moneyScale;
}
