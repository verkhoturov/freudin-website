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

/** Форматы фото и расширения файлов. Совпадают с `allowed_mime_types` bucket. */
export const avatarFileExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type AvatarMimeType = keyof typeof avatarFileExtensions;
