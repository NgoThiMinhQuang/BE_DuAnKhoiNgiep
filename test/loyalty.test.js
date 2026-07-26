import assert from "node:assert/strict";
import test from "node:test";

import { calculateOrderReward, calculateReviewReward } from "../src/domain/loyalty.js";

test("đánh giá có sao nhận 300 xu và nội dung đủ 30 ký tự nhận 1.000 xu", () => {
  assert.equal(calculateReviewReward("Tốt"), 300);
  assert.equal(calculateReviewReward("Sản phẩm rất tốt, đóng gói kỹ và giao hàng nhanh."), 1000);
});

test("thưởng đánh giá không vượt quá 3.000 xu mỗi đơn", () => {
  assert.equal(calculateReviewReward("Sản phẩm rất tốt, đóng gói kỹ và giao hàng nhanh.", 2500), 500);
  assert.equal(calculateReviewReward("Sản phẩm rất tốt, đóng gói kỹ và giao hàng nhanh.", 3000), 0);
});

test("xu đơn hàng tính trên tiền hàng sau giảm giá và không tính phí vận chuyển", () => {
  assert.deepEqual(calculateOrderReward(500_000, 50_000, 0.02), {
    eligibleSpend: 450_000,
    coins: 9_000,
  });
});
