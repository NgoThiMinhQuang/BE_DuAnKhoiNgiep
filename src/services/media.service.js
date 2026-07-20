import { findUploadedImage, insertUploadedImage } from "../repositories/media.repository.js";

const maximumImageSize = 5 * 1024 * 1024;
const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const httpError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

export async function saveUploadedImage(userId, input) {
  if (!supportedImageTypes.has(input.mimeType)) {
    throw httpError("Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc GIF", 415);
  }
  if (!Buffer.isBuffer(input.data) || input.data.length === 0) {
    throw httpError("Tệp ảnh không có dữ liệu", 400);
  }
  if (input.data.length > maximumImageSize) {
    throw httpError("Ảnh bài viết không được vượt quá 5MB", 413);
  }

  const fileName = String(input.fileName || "article-image")
    .replace(/[\r\n]/g, "")
    .trim()
    .slice(0, 255) || "article-image";
  const id = await insertUploadedImage({
    uploaderId: userId,
    fileName,
    mimeType: input.mimeType,
    size: input.data.length,
    data: input.data,
  });

  return { id: String(id), url: `/media/${id}` };
}

export async function getUploadedImage(imageId) {
  const id = Number(imageId);
  if (!Number.isInteger(id) || id < 1) throw httpError("Ảnh không hợp lệ", 404);
  const image = await findUploadedImage(id);
  if (!image) throw httpError("Không tìm thấy ảnh", 404);
  return image;
}
