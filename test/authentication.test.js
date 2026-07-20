import test from "node:test";
import assert from "node:assert/strict";

import { resolveAuthenticatedUser } from "../src/middleware/authenticate.js";
import { createAccessToken } from "../src/security/token.js";

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
