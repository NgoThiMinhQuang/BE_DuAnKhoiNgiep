import { getUploadedImage, saveUploadedImage } from "../services/media.service.js";

function readFileName(request) {
  const value = String(request.headers["x-file-name"] ?? "article-image");
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function uploadImage(request, response, next) {
  try {
    const data = await saveUploadedImage(request.auth.userId, {
      fileName: readFileName(request),
      mimeType: request.headers["content-type"]?.split(";")[0]?.trim().toLowerCase(),
      data: request.body,
    });
    response.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function showImage(request, response, next) {
  try {
    const image = await getUploadedImage(request.params.id);
    response.set({
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(image.kich_thuoc),
      "Content-Type": image.loai_mime,
      "Cross-Origin-Resource-Policy": "cross-origin",
      "X-Content-Type-Options": "nosniff",
    });
    response.send(image.du_lieu);
  } catch (error) {
    next(error);
  }
}
