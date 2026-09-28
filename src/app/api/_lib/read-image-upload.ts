import { type DetectedImage, detectImage } from "@/entities/profile/index.server";
import { HttpError } from "./http-error";

// Запас на заголовки частей multipart и короткие текстовые поля поверх самих файлов
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

type ImageFieldOptions = {
  /** Поле формы с файлом. */
  field: string;
  maxBytes: number;
  /** Наибольшая сторона картинки, px. */
  maxDimension: number;
  /** Как картинка называется в сообщениях: `photo`, `image`. */
  noun: string;
};

function tooLargeMessage(noun: string, maxBytes: number): string {
  const size = maxBytes >= 1024 * 1024 ? `${maxBytes / 1024 / 1024} MB` : `${maxBytes / 1024} KB`;
  return `The ${noun} must be ${size} or smaller.`;
}

/**
 * Читает тело `multipart/form-data`. `maxBytes` — сумма лимитов всех файлов: больший
 * `Content-Length` сразу получает 413 с `message`.
 */
export async function readMultipart(
  request: Request,
  maxBytes: number,
  message = "The files are too large.",
): Promise<FormData> {
  if (Number(request.headers.get("content-length")) > maxBytes + MULTIPART_OVERHEAD_BYTES) {
    throw new HttpError(413, "payload_too_large", message);
  }
  try {
    return await request.formData();
  } catch {
    throw new HttpError(400, "bad_request", "Couldn’t read the file.");
  }
}

/**
 * Картинка из поля формы: JPEG, PNG или WebP по сигнатуре, не больше `maxBytes` (иначе 413)
 * и `maxDimension` по каждой стороне (иначе 400 с `fields[field]`).
 */
export async function readImageField(
  formData: FormData,
  { field, maxBytes, maxDimension, noun }: ImageFieldOptions,
): Promise<DetectedImage> {
  const invalid = (message: string) =>
    new HttpError(400, "validation_error", `${message}.`, { [field]: message });

  const file = formData.get(field);
  if (!(file instanceof File)) {
    throw invalid(`Choose ${/^[aeiou]/.test(noun) ? "an" : "a"} ${noun}`);
  }
  if (file.size > maxBytes) {
    throw new HttpError(413, "payload_too_large", tooLargeMessage(noun, maxBytes));
  }

  const image = detectImage(new Uint8Array(await file.arrayBuffer()));
  if (!image) throw invalid(`Upload a JPEG, PNG, or WebP ${noun}`);
  if (image.width > maxDimension || image.height > maxDimension) {
    throw invalid(`The ${noun} must be at most ${maxDimension}×${maxDimension} pixels`);
  }
  return image;
}

/** Одна картинка в поле `file` формы `multipart/form-data`: для фото профиля. */
export async function readImageUpload(
  request: Request,
  options: Omit<ImageFieldOptions, "field">,
): Promise<DetectedImage> {
  const message = tooLargeMessage(options.noun, options.maxBytes);
  const formData = await readMultipart(request, options.maxBytes, message);
  return readImageField(formData, { ...options, field: "file" });
}
