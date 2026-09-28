/** Bucket Supabase Storage с фото профилей: объекты лежат по пути `<user_id>/<uuid>.<ext>`. */
export const AVATARS_BUCKET = "avatars";

/** Лимит файла фото. Совпадает с `file_size_limit` bucket в миграции. */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/** Сторона квадратного фото после кропа на клиенте, px. */
export const AVATAR_SIZE = 512;

/**
 * Наибольшая сторона фото, которое принимает сервер, px. Клиент присылает `AVATAR_SIZE`,
 * запас нужен для фото провайдеров. Иначе в обход кропа можно загрузить PNG 20000×20000,
 * и его декодировал бы браузер каждого посетителя.
 */
export const AVATAR_MAX_DIMENSION = 1024;

/** Bucket с изображениями документов психолога: `<user_id>/<uuid>.<ext>`. */
export const DOCUMENTS_BUCKET = "documents";

/** Лимит файла документа. Совпадает с `file_size_limit` bucket в миграции. */
export const DOCUMENT_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Наибольшая сторона изображения документа, px: до неё клиент уменьшает картинку, больше неё
 * сервер не принимает. Текст диплома при этом читается.
 */
export const DOCUMENT_MAX_DIMENSION = 2048;

/**
 * Длинная сторона превью документа, px. Превью показываем на странице, полное изображение —
 * только в просмотре: так пять документов не весят несколько мегабайт.
 */
export const DOCUMENT_THUMBNAIL_SIZE = 480;

/** Лимит файла превью документа. */
export const DOCUMENT_THUMBNAIL_MAX_BYTES = 256 * 1024;

/**
 * Форматы изображений (фото и документы) и расширения файлов. Совпадают с `allowed_mime_types`
 * bucket.
 */
export const imageFileExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type ImageMimeType = keyof typeof imageFileExtensions;

/** `cacheControl` загрузки в Storage: имена файлов уникальны, поэтому картинку кешируем на год. */
export const IMAGE_CACHE_SECONDS = String(60 * 60 * 24 * 365);
