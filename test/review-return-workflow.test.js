import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryPath = new URL("../src/repositories/admin.repository.js", import.meta.url);
const servicePath = new URL("../src/services/admin.service.js", import.meta.url);
const schemaPath = new URL("../CSDL/CSDL.sql", import.meta.url);

test("đánh giá quản trị chỉ được ẩn mềm, không xóa vật lý", async () => {
  const repository = await readFile(repositoryPath, "utf8");
  assert.doesNotMatch(repository, /DELETE\s+FROM\s+danh_gia/i);
  assert.match(repository, /status:\s*"DA_AN"/);
});

test("luồng giao thất bại và hoàn hàng có đủ các trạng thái bắt buộc", async () => {
  const [service, schema] = await Promise.all([
    readFile(servicePath, "utf8"),
    readFile(schemaPath, "utf8"),
  ]);
  for (const status of ["GIAO_THAT_BAI", "GIAO_LAI", "DANG_HOAN_HANG", "DA_HOAN_HANG"]) {
    assert.match(service, new RegExp(status));
    assert.match(schema, new RegExp(status));
  }
  assert.match(service, /returnCondition/);
  assert.match(schema, /NHAP_HOAN_HANG/);
});
