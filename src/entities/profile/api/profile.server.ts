import "server-only";
import { CITY_COLUMNS, type CityRow, toCity } from "@/entities/location/@x/profile";
import { type SocialLink, socialLinkSchema } from "@/entities/social-link/@x/profile";
import type { Json, SupabaseClient, Tables, TablesUpdate } from "@/shared/api/index.server";
import { demoProfile } from "../config/demo-profile";
import { languageCodes } from "../config/languages";
import { DEMO_USERNAME, USERNAME_MAX_LENGTH } from "../config/limits";
import { approachIds, clientTypeIds, workFormatIds } from "../config/practice";
import { AVATARS_BUCKET, DOCUMENTS_BUCKET } from "../config/storage";
import { normalizeSectionOrder } from "../lib/section-order";
import {
  type ProfileData,
  type ProfileUpdateData,
  type StoredDocument,
  storedDocumentSchema,
} from "../model/schemas";
import type { PublicProfile } from "../model/types";
import { setContactEmail } from "./contact-email.server";

/** Колонки публичной страницы. Гостю (`anon`) миграциями открыты только они. */
export const PUBLIC_PROFILE_COLUMNS =
  `username, display_name, bio, avatar_path, social_links, country, work_formats, client_types, approaches, languages, price_amount, price_currency, documents, section_order, city:cities(${CITY_COLUMNS})` as const;

// Коды Postgres для нарушения уникальности и внешнего ключа и имена ограничений из миграций
const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";
const USERNAME_UNIQUE_CONSTRAINT = "profiles_username_key";
const CITY_FOREIGN_KEY = "profiles_city_fkey";

type PublicProfileRow = Pick<
  Tables<"profiles">,
  | "username"
  | "display_name"
  | "bio"
  | "avatar_path"
  | "social_links"
  | "country"
  | "work_formats"
  | "client_types"
  | "approaches"
  | "languages"
  | "price_amount"
  | "price_currency"
  | "documents"
  | "section_order"
> & { city: CityRow | null };

type PostgrestErrorLike = { code: string; message: string };

const languageCodeSet = new Set(languageCodes);

// Ссылки в БД уже нормализованы; невалидные (например, платформу убрали из справочника) пропускаем
function parseSocialLinks(value: Json): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const link = socialLinkSchema.safeParse(item);
    return link.success ? [link.data] : [];
  });
}

// Значение, которое убрали из справочника, со страницы пропадает
function pickKnown<T extends string>(values: string[], ids: readonly T[]): T[] {
  return values.filter((value): value is T => (ids as readonly string[]).includes(value));
}

/** Документы из jsonb-колонки `profiles.documents`; повреждённые записи пропускаем. */
export function parseStoredDocuments(value: Json): StoredDocument[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const document = storedDocumentSchema.safeParse(item);
    return document.success ? [document.data] : [];
  });
}

export function toPublicProfile(supabase: SupabaseClient, row: PublicProfileRow): PublicProfile {
  const documentsBucket = supabase.storage.from(DOCUMENTS_BUCKET);
  return {
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_path
      ? supabase.storage.from(AVATARS_BUCKET).getPublicUrl(row.avatar_path).data.publicUrl
      : null,
    socialLinks: parseSocialLinks(row.social_links),
    country: row.country,
    city: row.city ? toCity(row.city) : null,
    workFormats: pickKnown(row.work_formats, workFormatIds),
    clientTypes: pickKnown(row.client_types, clientTypeIds),
    approaches: pickKnown(row.approaches, approachIds),
    languages: row.languages.filter((code) => languageCodeSet.has(code)),
    price:
      row.price_amount !== null && row.price_currency !== null
        ? { amount: row.price_amount, currency: row.price_currency }
        : null,
    documents: parseStoredDocuments(row.documents).map((document) => ({
      id: document.id,
      url: documentsBucket.getPublicUrl(document.path).data.publicUrl,
      thumbnailUrl: documentsBucket.getPublicUrl(document.thumbnailPath).data.publicUrl,
      title: document.title,
      width: document.width,
      height: document.height,
    })),
    sectionOrder: normalizeSectionOrder(row.section_order),
  };
}

// Непереданные поля остаются undefined, и PostgREST их не меняет. Пустые строки формы — NULL
function toProfileRow(data: ProfileUpdateData): TablesUpdate<"profiles"> {
  return {
    username: data.username,
    display_name: data.displayName,
    bio: data.bio,
    social_links: data.socialLinks,
    country: data.country === undefined ? undefined : data.country || null,
    city_id: data.cityId,
    work_formats: data.workFormats,
    client_types: data.clientTypes,
    approaches: data.approaches,
    languages: data.languages,
    price_amount:
      data.priceAmount === undefined
        ? undefined
        : data.priceAmount
          ? Number(data.priceAmount)
          : null,
    price_currency: data.priceCurrency === undefined ? undefined : data.priceCurrency || null,
    section_order: data.sectionOrder,
  };
}

function isViolation(error: PostgrestErrorLike, code: string, constraint?: string): boolean {
  return error.code === code && (!constraint || error.message.includes(constraint));
}

/** Профиль пользователя или `null`, если он ещё не прошёл онбординг. */
export async function getProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? toPublicProfile(supabase, data) : null;
}

/** Публичный профиль по адресу страницы (регистр не важен) или `null`, если его нет. */
export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string,
): Promise<PublicProfile | null> {
  const normalized = username.trim().toLowerCase();
  if (normalized === DEMO_USERNAME) return demoProfile;
  if (!normalized || normalized.length > USERNAME_MAX_LENGTH) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("username", normalized)
    .maybeSingle();

  if (error) throw error;
  return data ? toPublicProfile(supabase, data) : null;
}

/**
 * Свободен ли адрес страницы. Ожидает username после `usernameSchema`: формат
 * и зарезервированные адреса уже проверены.
 */
export async function isUsernameAvailable(
  supabase: SupabaseClient,
  username: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("profiles")
    .select("username", { count: "exact", head: true })
    .eq("username", username);

  if (error) throw error;
  return count === 0;
}

export type CreateProfileResult =
  | { ok: true; profile: PublicProfile }
  | { ok: false; reason: "username_taken" | "profile_exists" | "city_invalid" };

/**
 * Создаёт профиль пользователя (онбординг). Контактную почту сохраняем первой: повторная
 * запись безопасна, поэтому сбой на любом шаге лечится повторной отправкой формы.
 */
export async function createProfile(
  supabase: SupabaseClient,
  userId: string,
  data: ProfileData,
): Promise<CreateProfileResult> {
  if (data.contactEmail) await setContactEmail(supabase, userId, data.contactEmail);

  const { data: row, error } = await supabase
    .from("profiles")
    .insert({
      ...toProfileRow(data),
      id: userId,
      username: data.username,
      display_name: data.displayName,
    })
    .select(PUBLIC_PROFILE_COLUMNS)
    .single();

  if (error) {
    if (isViolation(error, UNIQUE_VIOLATION, USERNAME_UNIQUE_CONSTRAINT)) {
      return { ok: false, reason: "username_taken" };
    }
    // Остальное нарушение уникальности — первичный ключ: профиль у пользователя уже есть
    if (isViolation(error, UNIQUE_VIOLATION)) return { ok: false, reason: "profile_exists" };
    if (isViolation(error, FOREIGN_KEY_VIOLATION, CITY_FOREIGN_KEY)) {
      return { ok: false, reason: "city_invalid" };
    }
    throw error;
  }
  return { ok: true, profile: toPublicProfile(supabase, row) };
}

export type UpdateProfileResult =
  | { ok: true; profile: PublicProfile }
  | { ok: false; reason: "username_taken" | "profile_missing" | "city_invalid" };

/** Обновляет переданные поля профиля пользователя и контактную почту, если она передана. */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  data: ProfileUpdateData,
): Promise<UpdateProfileResult> {
  if (data.contactEmail !== undefined) await setContactEmail(supabase, userId, data.contactEmail);

  const changes = toProfileRow(data);
  const hasChanges = Object.values(changes).some((value) => value !== undefined);

  // Пустое обновление PostgREST не принимает: просто возвращаем текущий профиль
  if (!hasChanges) {
    const profile = await getProfileByUserId(supabase, userId);
    return profile ? { ok: true, profile } : { ok: false, reason: "profile_missing" };
  }

  const { data: row, error } = await supabase
    .from("profiles")
    .update(changes)
    .eq("id", userId)
    .select(PUBLIC_PROFILE_COLUMNS)
    .maybeSingle();

  if (error) {
    if (isViolation(error, UNIQUE_VIOLATION, USERNAME_UNIQUE_CONSTRAINT)) {
      return { ok: false, reason: "username_taken" };
    }
    // Города нет в справочнике или он из другой страны
    if (isViolation(error, FOREIGN_KEY_VIOLATION, CITY_FOREIGN_KEY)) {
      return { ok: false, reason: "city_invalid" };
    }
    throw error;
  }
  if (!row) return { ok: false, reason: "profile_missing" };
  return { ok: true, profile: toPublicProfile(supabase, row) };
}
