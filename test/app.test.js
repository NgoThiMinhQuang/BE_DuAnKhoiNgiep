import assert from "node:assert/strict";
import { test } from "node:test";

import request from "supertest";

import { app } from "../src/app.js";

test("GET / trả về thông tin API", async () => {
  const response = await request(app).get("/").expect(200);

  assert.equal(response.body.success, true);
  assert.match(response.body.message, /Dự Án Khởi Nghiệp/);
});

test("GET /api/health trả về trạng thái ok", async () => {
  const response = await request(app).get("/api/health").expect(200);

  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, "ok");
  assert.ok(response.body.data.timestamp);
});

test("route không tồn tại trả về 404", async () => {
  const response = await request(app).get("/api/khong-ton-tai").expect(404);

  assert.equal(response.body.success, false);
});

