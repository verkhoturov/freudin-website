import type { AvatarSource } from "@/entities/profile";

/**
 * Фото в форме: `current` — оставить как есть, `provider` — взять из аккаунта провайдера,
 * `file` — новое фото после кропа, `none` — без фото.
 */
export type AvatarValue =
  | { type: "current" }
  | { type: "provider" }
  | { type: "file"; file: Blob; previewUrl: string }
  | { type: "none" };

/** Что загрузить на сервер при сохранении, или `null`, если новое фото не выбрано. */
export function getAvatarSource(value: AvatarValue): AvatarSource | null {
  if (value.type === "provider") return { type: "provider" };
  if (value.type === "file") return { type: "file", file: value.file };
  return null;
}
