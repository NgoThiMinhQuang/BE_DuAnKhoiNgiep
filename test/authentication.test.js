import test from "node:test";
import assert from "node:assert/strict";

import { resolveAuthenticatedUser } from "../src/middleware/authenticate.js";
import { createAccessToken, verifyAccessToken } from "../src/security/token.js";

test("remembered sessions receive a longer access token", () => {
  const now = Math.floor(Date.now() / 1000);
  const regular = verifyAccessToken(createAccessToken(42));
  const remembered = verifyAccessToken(createAccessToken(42, true));

  assert.ok(regular.exp >= now + 7 * 24 * 60 * 60 - 1);
  assert.ok(regular.exp <= now + 7 * 24 * 60 * 60 + 1);
  assert.ok(remembered.exp >= now + 30 * 24 * 60 * 60 - 1);
  assert.ok(remembered.exp <= now + 30 * 24 * 60 * 60 + 1);
});

test("active customers are authenticated with their database role", async () => {
  const auth = await resolveAuthenticatedUser(createAccessToken(42), async () => ({
    id: 42, vai_tro: "KHACH_HANG", trang_thai: "HOAT_DONG",
  }));
  assert.deepEqual(auth, { userId: 42, role: "KHACH_HANG" });
});

test("a locked customer is rejected even when the token is still valid", async () => {
  await assert.rejects(
    resolveAuthenticatedUser(createAccessToken(42), async () => ({
      id: 42, vai_tro: "KHACH_HANG", trang_thai: "BI_KHOA",
    })),
    (error) => error.statusCode === 403 && /bị khóa/.test(error.message),
  );
});

test("a deleted customer is rejected even when the token is still valid", async () => {
  await assert.rejects(
    resolveAuthenticatedUser(createAccessToken(42), async () => null),
    (error) => error.statusCode === 403,
  );
});

test("an invalid token is rejected before querying the database", async () => {
  let queried = false;
  await assert.rejects(
    resolveAuthenticatedUser("invalid-token", async () => { queried = true; }),
    (error) => error.statusCode === 401,
  );
  assert.equal(queried, false);
});
