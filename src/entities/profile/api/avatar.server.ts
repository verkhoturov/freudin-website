import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@/shared/api/index.server";
import {
  AVATAR_MAX_BYTES,
  AVATAR_MAX_DIMENSION,
  AVATAR_SIZE,
  AVATARS_BUCKET,
  type AvatarMimeType,
  avatarFileExtensions,
} from "../config/storage";
import { type ImageSize, readImageSize } from "../lib/read-image-size";
import type { PublicProfile } from "../model/types";
import { getProfileByUserId, PUBLIC_PROFILE_COLUMNS, toPublicProfile } from "./profile.server";

/** Картинка, формат и размеры которой прочитаны из заголовка файла. */
export type AvatarImage = ImageSize & { bytes: Uint8Array; contentType: AvatarMimeType };

export type AvatarUpdateResult =
  | { ok: true; profile: PublicProfile }
  | { ok: false; reason: "profile_missing" };

// Хосты, с которых провайдеры входа отдают фото: Google, Facebook, Telegram
const PROVIDER_AVATAR_HOSTS = [
  "googleusercontent.com",
  "fbsbx.com",
  "fbcdn.net",
  "facebook.com",
  "t.me",
  "telegram.org",
  "telesco.pe",
];
const PROVIDER_FETCH_TIMEOUT_MS = 5000;
const PROVIDER_MAX_REDIRECTS = 3;
// Имена файлов уникальны, поэтому картинку можно кешировать надолго
const AVATAR_CACHE_SECONDS = String(60 * 60 * 24 * 365);

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

/**
 * Формат картинки по первым байтам файла (заголовку `Content-Type` не доверяем) и её размеры.
 * `null` — это не JPEG, PNG или WebP либо заголовок файла повреждён.
 */
export function detectAvatarImage(bytes: Uint8Array): AvatarImage | null {
  let contentType: AvatarMimeType | null = null;
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

/** Фото не больше `AVATAR_MAX_DIMENSION` по каждой стороне. */
export function isAvatarSizeAllowed(image: AvatarImage): boolean {
  return image.width <= AVATAR_MAX_DIMENSION && image.height <= AVATAR_MAX_DIMENSION;
}

function hasHost(url: URL, host: string): boolean {
  return url.hostname === host || url.hostname.endsWith(`.${host}`);
}

function isAllowedProviderUrl(url: URL): boolean {
  return url.protocol === "https:" && PROVIDER_AVATAR_HOSTS.some((host) => hasHost(url, host));
}

// Google отдаёт фото 96 px (`…=s96-c`), размер задаётся в самой ссылке
function withLargerSize(url: URL): URL {
  if (!hasHost(url, "googleusercontent.com")) return url;
  return new URL(url.href.replace(/=s\d+(-c)?$/, `=s${AVATAR_SIZE}-c`));
}

async function readBodyWithLimit(response: Response, limit: number): Promise<Uint8Array | null> {
  if (Number(response.headers.get("content-length")) > limit) return null;
  if (!response.body) return null;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/**
 * Скачивает фото из аккаунта провайдера. Ссылки провайдеров со временем перестают работать,
 * поэтому фото копируем в Storage. Ходим только на хосты провайдеров, в том числе
 * при редиректах. `null` — фото недоступно, это не JPEG, PNG или WebP до 2 МБ или оно
 * больше `AVATAR_MAX_DIMENSION`.
 */
export async function fetchProviderAvatar(avatarUrl: string): Promise<AvatarImage | null> {
  let url: URL;
  try {
    url = withLargerSize(new URL(avatarUrl));
  } catch {
    return null;
  }

  const signal = AbortSignal.timeout(PROVIDER_FETCH_TIMEOUT_MS);
  try {
    for (let redirects = 0; redirects <= PROVIDER_MAX_REDIRECTS; redirects++) {
      if (!isAllowedProviderUrl(url)) return null;

      const response = await fetch(url, { redirect: "manual", signal, cache: "no-store" });
      const location = response.headers.get("location");
      if (response.status >= 300 && response.status < 400 && location) {
        url = new URL(location, url);
        continue;
      }
      if (!response.ok) return null;

      const bytes = await readBodyWithLimit(response, AVATAR_MAX_BYTES);
      const image = bytes ? detectAvatarImage(bytes) : null;
      return image && isAvatarSizeAllowed(image) ? image : null;
    }
  } catch (error) {
    console.warn("Не удалось скачать фото провайдера:", error);
  }
  return null;
}

async function getAvatarPath(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ avatarPath: string | null } | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? { avatarPath: data.avatar_path } : null;
}

// Лишний файл в Storage не ломает профиль, поэтому ошибку удаления только логируем
async function removeAvatarFile(supabase: SupabaseClient, path: string): Promise<void> {
  const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([path]);
  if (error) console.warn(`Не удалось удалить фото ${path}:`, error.message);
}

/** Сохраняет фото профиля в Storage, прописывает его в профиль и удаляет прежнее. */
export async function setProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  image: AvatarImage,
): Promise<AvatarUpdateResult> {
  const current = await getAvatarPath(supabase, userId);
  if (!current) return { ok: false, reason: "profile_missing" };

  const path = `${userId}/${randomUUID()}.${avatarFileExtensions[image.contentType]}`;
  const upload = await supabase.storage.from(AVATARS_BUCKET).upload(path, image.bytes, {
    contentType: image.contentType,
    cacheControl: AVATAR_CACHE_SECONDS,
  });
  if (upload.error) throw upload.error;

  const { data: row, error } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", userId)
    .select(PUBLIC_PROFILE_COLUMNS)
    .maybeSingle();

  if (error || !row) {
    await removeAvatarFile(supabase, path);
    if (error) throw error;
    return { ok: false, reason: "profile_missing" };
  }

  if (current.avatarPath) await removeAvatarFile(supabase, current.avatarPath);
  return { ok: true, profile: toPublicProfile(supabase, row) };
}

/**
 * Удаляет все файлы пользователя из bucket фото: перед удалением аккаунта. Сначала убирает фото
 * из профиля, чтобы при сбое дальше профиль не ссылался на удалённый файл.
 */
export async function removeUserAvatarFiles(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error: unlinkError } = await supabase
    .from("profiles")
    .update({ avatar_path: null })
    .eq("id", userId);
  if (unlinkError) throw unlinkError;

  const bucket = supabase.storage.from(AVATARS_BUCKET);
  const { data: files, error } = await bucket.list(userId, { limit: 1000 });
  if (error) throw error;
  if (files.length === 0) return;

  const { error: removeError } = await bucket.remove(files.map((file) => `${userId}/${file.name}`));
  if (removeError) throw removeError;
}

/** Убирает фото из профиля и удаляет файл из Storage. */
export async function removeProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
): Promise<AvatarUpdateResult> {
  const current = await getAvatarPath(supabase, userId);
  if (!current) return { ok: false, reason: "profile_missing" };

  if (!current.avatarPath) {
    const profile = await getProfileByUserId(supabase, userId);
    return profile ? { ok: true, profile } : { ok: false, reason: "profile_missing" };
  }

  const { data: row, error } = await supabase
    .from("profiles")
    .update({ avatar_path: null })
    .eq("id", userId)
    .select(PUBLIC_PROFILE_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  if (!row) return { ok: false, reason: "profile_missing" };

  await removeAvatarFile(supabase, current.avatarPath);
  return { ok: true, profile: toPublicProfile(supabase, row) };
}
