import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "../config/env.js";

const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const sign = (value) => createHmac("sha256", env.authSecret).update(value).digest("base64url");

export function createAccessToken(userId, remember = false) {
  const lifetimeInDays = remember ? 30 : 7;
  const payload = encode({
    sub: Number(userId),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * lifetimeInDays,
  });
  return `${payload}.${sign(payload)}`;
}

export function verifyAccessToken(token) {
  const [payload, signature] = String(token).split(".");
  if (!payload || !signature) throw new Error("Token không hợp lệ");
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("Token không hợp lệ");
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!data.sub || data.exp < Math.floor(Date.now() / 1000)) throw new Error("Token đã hết hạn");
  return data;
}
