import type { ImageMimeType } from "../config/storage";
import { type ImageSize, readImageSize } from "./read-image-size";

/** Картинка, формат и размеры которой прочитаны из заголовка файла. */
export type DetectedImage = ImageSize & { bytes: Uint8Array; contentType: ImageMimeType };

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

/**
 * Формат картинки по первым байтам файла (заголовку `Content-Type` не доверяем) и её размеры.
 * `null` — это не JPEG, PNG или WebP либо заголовок файла повреждён.
 */
export function detectImage(bytes: Uint8Array): DetectedImage | null {
  let contentType: ImageMimeType | null = null;
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) contentType = "image/jpeg";
  else if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    contentType = "image/png";
  } else if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    contentType = "image/webp";
  }
  if (!contentType) return null;

  const size = readImageSize(bytes, contentType);
  return size ? { ...size, bytes, contentType } : null;
}
