import { verifyAccessToken } from "../security/token.js";
import { database } from "../config/database.js";

const authError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

async function findAuthenticationUser(userId) {
  const [rows] = await database.execute(`
    SELECT id, vai_tro, trang_thai
    FROM nguoi_dung
    WHERE id=?
    LIMIT 1
  `, [userId]);
  return rows[0] ?? null;
}

export async function resolveAuthenticatedUser(token, findUser = findAuthenticationUser) {
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw authError("Token không hợp lệ hoặc đã hết hạn", 401);
  }

  const user = await findUser(payload.sub);
  if (!user || user.trang_thai !== "HOAT_DONG") {
    throw authError("Tài khoản không tồn tại hoặc đã bị khóa", 403);
  }
  return { userId: user.id, role: user.vai_tro };
}

export async function authenticate(request, _response, next) {
  const [scheme, token] = (request.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) return next(authError("Vui lòng đăng nhập", 401));

  try {
    request.auth = await resolveAuthenticatedUser(token);
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireAdmin(request, _response, next) {
  if (request.auth?.role !== "ADMIN") return next(authError("Bạn không có quyền quản trị", 403));
  return next();
}
