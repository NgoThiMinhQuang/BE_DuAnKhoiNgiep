import assert from "node:assert/strict";
import test from "node:test";

import { calculateProfitability } from "../src/domain/profitability.js";

test("tính lãi gộp và tỷ suất lãi từ doanh thu thuần và giá vốn", () => {
  assert.deepEqual(calculateProfitability(750_000, 600_000), {
    netRevenue: 750_000,
    costOfGoodsSold: 600_000,
    grossProfit: 150_000,
    grossMargin: 20,
  });
});

test("ghi nhận lỗ khi giá vốn lớn hơn doanh thu thuần", () => {
  assert.deepEqual(calculateProfitability(500_000, 650_000), {
    netRevenue: 500_000,
    costOfGoodsSold: 650_000,
    grossProfit: -150_000,
    grossMargin: -30,
  });
});

test("doanh thu bằng không không tạo tỷ suất không xác định", () => {
  assert.deepEqual(calculateProfitability(0, 0), {
    netRevenue: 0,
    costOfGoodsSold: 0,
    grossProfit: 0,
    grossMargin: 0,
  });
});
