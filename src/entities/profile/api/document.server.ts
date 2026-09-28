import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@/shared/api/index.server";
import { DOCUMENTS_MAX } from "../config/limits";
import { DOCUMENTS_BUCKET, IMAGE_CACHE_SECONDS, imageFileExtensions } from "../config/storage";
import type { DetectedImage } from "../lib/detect-image";
import type { StoredDocument } from "../model/schemas";
import type { PublicProfile } from "../model/types";
import { PUBLIC_PROFILE_COLUMNS, parseStoredDocuments, toPublicProfile } from "./profile.server";

export type DocumentUpdateResult =
  | { ok: true; profile: PublicProfile }
  | { ok: false; reason: "profile_missing" | "limit_reached" | "document_missing" };

type DocumentsChange =
  | { ok: true; documents: StoredDocument[] }
  | { ok: false; reason: "limit_reached" | "document_missing" };

const MAX_WRITE_ATTEMPTS = 3;

/**
 * Меняет список документов профиля. Список лежит в jsonb-колонке, поэтому пишем его целиком,
 * а чтобы не затереть параллельную правку (загрузка из двух вкладок), обновляем строку, только
 * если `updated_at` не изменился с чтения. Иначе перечитываем и пробуем снова.
 */
async function changeDocuments(
  supabase: SupabaseClient,
  userId: string,
  change: (documents: StoredDocument[]) => DocumentsChange,
): Promise<DocumentUpdateResult> {
  for (let attempt = 1; ; attempt++) {
    const { data: current, error: readError } = await supabase
      .from("profiles")
      .select("documents, updated_at")
      .eq("id", userId)
      .maybeSingle();
    if (readError) throw readError;
    if (!current) return { ok: false, reason: "profile_missing" };

    const result = change(parseStoredDocuments(current.documents));
    if (!result.ok) return result;

    const { data: row, error } = await supabase
      .from("profiles")
      .update({ documents: result.documents })
      .eq("id", userId)
      .eq("updated_at", current.updated_at)
      .select(PUBLIC_PROFILE_COLUMNS)
      .maybeSingle();
    if (error) throw error;
    if (row) return { ok: true, profile: toPublicProfile(supabase, row) };
    if (attempt === MAX_WRITE_ATTEMPTS) {
      throw new Error("Profile documents kept changing during the update");
    }
  }
}

// Лишний файл в Storage не ломает профиль, поэтому ошибку удаления только логируем
async function removeDocumentFiles(supabase: SupabaseClient, paths: string[]): Promise<void> {
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).remove(paths);
  if (error) console.warn(`Couldn't delete documents ${paths.join(", ")}:`, error.message);
}

async function uploadDocumentFile(
  supabase: SupabaseClient,
  path: string,
  image: DetectedImage,
): Promise<void> {
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, image.bytes, {
    contentType: image.contentType,
    cacheControl: IMAGE_CACHE_SECONDS,
  });
  if (error) throw error;
}

/** Изображение документа и его превью (`DOCUMENT_THUMBNAIL_SIZE`) с теми же пропорциями. */
export type DocumentImages = { image: DetectedImage; thumbnail: DetectedImage };

/** Сохраняет изображение документа и превью в Storage и добавляет документ в конец списка. */
export async function addProfileDocument(
  supabase: SupabaseClient,
  userId: string,
  { image, thumbnail }: DocumentImages,
  title: string,
): Promise<DocumentUpdateResult> {
  const id = randomUUID();
  const path = `${userId}/${id}.${imageFileExtensions[image.contentType]}`;
  const thumbnailPath = `${userId}/${id}-thumbnail.${imageFileExtensions[thumbnail.contentType]}`;
  const document: StoredDocument = {
    id,
    path,
    thumbnailPath,
    title,
    width: image.width,
    height: image.height,
  };

  try {
    await uploadDocumentFile(supabase, path, image);
    await uploadDocumentFile(supabase, thumbnailPath, thumbnail);
    const result = await changeDocuments(supabase, userId, (documents) =>
      documents.length >= DOCUMENTS_MAX
        ? { ok: false, reason: "limit_reached" }
        : { ok: true, documents: [...documents, document] },
    );
    if (!result.ok) await removeDocumentFiles(supabase, [path, thumbnailPath]);
    return result;
  } catch (error) {
    await removeDocumentFiles(supabase, [path, thumbnailPath]);
    throw error;
  }
}

/** Убирает документ из профиля, затем удаляет его файлы. */
export async function removeProfileDocument(
  supabase: SupabaseClient,
  userId: string,
  documentId: string,
): Promise<DocumentUpdateResult> {
  // Документ находим внутри changeDocuments: при повторной попытке список перечитывается
  const removed: { document?: StoredDocument } = {};
  const result = await changeDocuments(supabase, userId, (documents) => {
    removed.document = documents.find((document) => document.id === documentId);
    return removed.document
      ? { ok: true, documents: documents.filter((document) => document.id !== documentId) }
      : { ok: false, reason: "document_missing" };
  });

  if (result.ok && removed.document) {
    await removeDocumentFiles(supabase, [removed.document.path, removed.document.thumbnailPath]);
  }
  return result;
}

/**
 * Удаляет все файлы пользователя из bucket документов: перед удалением аккаунта. Сначала
 * очищает список в профиле, чтобы при сбое дальше профиль не ссылался на удалённые файлы.
 */
export async function removeUserDocumentFiles(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error: unlinkError } = await supabase
    .from("profiles")
    .update({ documents: [] })
    .eq("id", userId);
  if (unlinkError) throw unlinkError;

  const bucket = supabase.storage.from(DOCUMENTS_BUCKET);
  const { data: files, error } = await bucket.list(userId, { limit: 1000 });
  if (error) throw error;
  if (files.length === 0) return;

  const { error: removeError } = await bucket.remove(files.map((file) => `${userId}/${file.name}`));
  if (removeError) throw removeError;
}
