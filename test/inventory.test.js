import assert from "node:assert/strict";
import test from "node:test";

import { calculateWeightedAverageCost } from "../src/domain/inventory.js";

test("giá vốn bình quân kết hợp tồn cũ và lô nhập mới", () => {
  assert.equal(calculateWeightedAverageCost(10, 100_000, 5, 130_000), 110_000);
});

test("giá vốn của lô đầu tiên bằng đúng giá nhập", () => {
  assert.equal(calculateWeightedAverageCost(0, 0, 8, 75_500), 75_500);
});

test("từ chối dữ liệu tồn kho hoặc giá vốn không hợp lệ", () => {
  assert.throws(() => calculateWeightedAverageCost(5, 100_000, 0, 90_000), /không hợp lệ/);
  assert.throws(() => calculateWeightedAverageCost(-1, 100_000, 2, 90_000), /không hợp lệ/);
});
