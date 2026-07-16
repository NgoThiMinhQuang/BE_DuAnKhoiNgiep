export function notFound(request, response) {
  response.status(404).json({
    success: false,
    message: `Không tìm thấy ${request.method} ${request.originalUrl}`,
  });
}

export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode ?? error.status ?? 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Lỗi máy chủ" : error.message,
  });
}

