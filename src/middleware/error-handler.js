export function notFound(request, response) {
  response.status(404).json({
    success: false,
    message: `Không tìm thấy ${request.method} ${request.originalUrl}`,
  });
}

export function errorHandler(error, _request, response, _next) {
  const databaseStatuses = {
    ER_DUP_ENTRY: 409,
    ER_NO_REFERENCED_ROW_2: 400,
    ER_ROW_IS_REFERENCED_2: 409,
    ER_DATA_TOO_LONG: 400,
    WARN_DATA_TRUNCATED: 400,
  };
  const statusCode = error.statusCode ?? error.status ?? databaseStatuses[error.code] ?? 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    message: statusCode >= 500
      ? "Lỗi máy chủ"
      : (databaseStatuses[error.code] ? "Dữ liệu không hợp lệ hoặc đã tồn tại" : error.message),
  });
}

