export function getHealth(_request, response) {
  response.status(200).json({
    success: true,
    message: "API đang hoạt động",
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}

