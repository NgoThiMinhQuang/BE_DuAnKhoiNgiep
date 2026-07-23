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

test("API quản trị yêu cầu đăng nhập", async () => {
  const response = await request(app).get("/api/admin/dashboard").expect(401);

  assert.equal(response.body.success, false);
});

test("API social login giả không còn tồn tại", async () => {
  const response = await request(app)
    .post("/api/auth/social")
    .send({ provider: "google" })
    .expect(404);

  assert.equal(response.body.success, false);
});

test("API liên hệ kiểm tra email và nội dung", async () => {
  const response = await request(app)
    .post("/api/contact")
    .send({ fullName: "Khách thử", email: "email-sai", message: "" })
    .expect(400);

  assert.equal(response.body.success, false);
});

test("API bình luận bài viết kiểm tra dữ liệu đầu vào trước khi ghi cơ sở dữ liệu", async () => {
  const response = await request(app)
    .post("/api/news/1/comments")
    .send({ name: "Khách thử", email: "email-sai", content: "Nội dung bình luận" })
    .expect(400);

  assert.equal(response.body.success, false);
  assert.match(response.body.message, /Email/);
});

test("API quên mật khẩu kiểm tra định dạng email", async () => {
  const response = await request(app)
    .post("/api/auth/forgot-password")
    .send({ email: "email-sai" })
    .expect(400);

  assert.equal(response.body.success, false);
});

test("API đặt lại mật khẩu yêu cầu token hợp lệ", async () => {
  const response = await request(app)
    .post("/api/auth/reset-password")
    .send({ token: "", newPassword: "matkhau-moi" })
    .expect(400);

  assert.equal(response.body.success, false);
});
