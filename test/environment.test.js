import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const importEnvironment = (authSecret) => spawnSync(
  process.execPath,
  ["--input-type=module", "--eval", "import './src/config/env.js'"],
  { cwd: process.cwd(), encoding: "utf8", env: { ...process.env, NODE_ENV: "production", AUTH_SECRET: authSecret } },
);

test("production refuses to start without AUTH_SECRET", () => {
  const result = importEnvironment("");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /AUTH_SECRET is required/);
});

test("production accepts a configured AUTH_SECRET", () => {
  const result = importEnvironment("test-only-strong-secret");
  assert.equal(result.status, 0, result.stderr);
});
