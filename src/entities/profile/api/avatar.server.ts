import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@/shared/api/index.server";
import {
  AVATAR_MAX_BYTES,
  AVATAR_MAX_DIMENSION,
  AVATAR_SIZE,
  AVATARS_BUCKET,
  IMAGE_CACHE_SECONDS,
  imageFileExtensions,
} from "../config/storage";
import { type DetectedImage, detectImage } from "../lib/detect-image";
import type { PublicProfile } from "../model/types";
import { getProfileByUserId, PUBLIC_PROFILE_COLUMNS, toPublicProfile } from "./profile.server";

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

/** Фото не больше `AVATAR_MAX_DIMENSION` по каждой стороне. */
function isAvatarSizeAllowed(image: DetectedImage): boolean {
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
export async function fetchProviderAvatar(avatarUrl: string): Promise<DetectedImage | null> {
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
      const image = bytes ? detectImage(bytes) : null;
      return image && isAvatarSizeAllowed(image) ? image : null;
    }
  } catch (error) {
    console.warn("Couldn't download the provider photo:", error);
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
  if (error) console.warn(`Couldn't delete photo ${path}:`, error.message);
}

/** Сохраняет фото профиля в Storage, прописывает его в профиль и удаляет прежнее. */
export async function setProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  image: DetectedImage,
): Promise<AvatarUpdateResult> {
  const current = await getAvatarPath(supabase, userId);
  if (!current) return { ok: false, reason: "profile_missing" };

  const path = `${userId}/${randomUUID()}.${imageFileExtensions[image.contentType]}`;
  const upload = await supabase.storage.from(AVATARS_BUCKET).upload(path, image.bytes, {
    contentType: image.contentType,
    cacheControl: IMAGE_CACHE_SECONDS,
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
