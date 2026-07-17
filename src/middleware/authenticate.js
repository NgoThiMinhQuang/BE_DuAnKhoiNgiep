import { verifyAccessToken } from "../security/token.js";
import { database } from "../config/database.js";

export function authenticate(request, _response, next) {
  try {
    const [scheme, token] = (request.headers.authorization ?? "").split(" ");
    if (scheme !== "Bearer" || !token) {
      const error = new Error("Vui lòng đăng nhập");
      error.statusCode = 401;
      throw error;
    }
    request.auth = { userId: verifyAccessToken(token).sub };
    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
}

export async function requireAdmin(request, _response, next) {
  try {
    const [rows] = await database.execute(`
      SELECT id, vai_tro, trang_thai
      FROM nguoi_dung
      WHERE id=?
      LIMIT 1
    `, [request.auth?.userId]);
    const user = rows[0];
    if (!user || user.trang_thai !== "HOAT_DONG") {
      const error = new Error("Tài khoản không tồn tại hoặc đã bị khóa");
      error.statusCode = 403;
      throw error;
    }
    if (user.vai_tro !== "ADMIN") {
      const error = new Error("Bạn không có quyền quản trị");
      error.statusCode = 403;
      throw error;
    }
    request.auth.role = user.vai_tro;
    next();
  } catch (error) {
    next(error);
  }
}
