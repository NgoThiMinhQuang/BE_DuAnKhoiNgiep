import { verifyAccessToken } from "../security/token.js";

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
