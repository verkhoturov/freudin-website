import "server-only";
import type * as z from "zod";
import { CITY_COLUMNS, type CityRow, toCity } from "@/entities/location/@x/profile";
import { type SocialLink, socialLinkSchema } from "@/entities/social-link/@x/profile";
import type { Json, SupabaseClient, Tables, TablesUpdate } from "@/shared/api/index.server";
import { contactTypeIds, isContactType } from "../config/contacts";
import { coverIds } from "../config/cover";
import { ctaPlacementIds } from "../config/cta-placement";
import { demoProfile } from "../config/demo-profile";
import { languageCodes } from "../config/languages";
import { DEMO_USERNAME, USERNAME_MAX_LENGTH } from "../config/limits";
import { pageThemeIds } from "../config/page-theme";
import { approachIds, clientTypeIds, workFormatIds } from "../config/practice";
import { profileSectionIds } from "../config/sections";
import { AVATARS_BUCKET, DOCUMENTS_BUCKET } from "../config/storage";
import { visibilityIds } from "../config/visibility";
import { pickKnown } from "../lib/pick-known";
import { normalizeSectionOrder } from "../lib/section-order";
import { toProfileService } from "../lib/services";
import {
  type ProfileData,
  type ProfileUpdateData,
  type StoredDocument,
  storedDocumentSchema,
  storedEducationSchema,
  storedFaqItemSchema,
  storedServiceSchema,
} from "../model/schemas";
import type { ProfileContacts, PublicProfile } from "../model/types";
import { setContactEmail } from "./contact-email.server";
import { getProfileVisibility, setProfileVisibility } from "./page-access.server";
import { setPrivateDetails } from "./private-details.server";

/** Колонки публичной страницы. Гостю (`anon`) миграциями открыты только они. */
export const PUBLIC_PROFILE_COLUMNS =
  `username, display_name, bio, avatar_path, social_links, country, work_formats, client_types, approaches, languages, price_amount, price_currency, documents, section_order, practice_started_on, education, contacts, preferred_contact, faq, services, highlighted_sections, cover, page_theme, link_icons, cta_placement, visibility, city:cities(${CITY_COLUMNS})` as const;

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
  | "practice_started_on"
  | "education"
  | "contacts"
  | "preferred_contact"
  | "faq"
  | "services"
  | "highlighted_sections"
  | "cover"
  | "page_theme"
  | "link_icons"
  | "cta_placement"
  | "visibility"
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

// Повреждённые записи jsonb-списков пропускаем
function parseList<T>(value: Json, schema: z.ZodType<T>): T[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const entry = schema.safeParse(item);
    return entry.success ? [entry.data] : [];
  });
}

// Тип, которого нет в справочнике, пропускаем
function parseContacts(value: Json): ProfileContacts {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const contacts: ProfileContacts = {};
  for (const type of contactTypeIds) {
    const contact = value[type];
    if (typeof contact === "string" && contact) contacts[type] = contact;
  }
  return contacts;
}

// Способ связи, которого нет среди контактов и ссылок, не показываем
function parsePreferredContact(
  value: string | null,
  contacts: ProfileContacts,
  socialLinks: SocialLink[],
): string | null {
  if (!value) return null;
  const exists = isContactType(value)
    ? Boolean(contacts[value])
    : socialLinks.some((link) => link.url === value);
  return exists ? value : null;
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
  const socialLinks = parseSocialLinks(row.social_links);
  const contacts = parseContacts(row.contacts);
  return {
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_path
      ? supabase.storage.from(AVATARS_BUCKET).getPublicUrl(row.avatar_path).data.publicUrl
      : null,
    socialLinks,
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
    practiceStartedOn: row.practice_started_on,
    education: parseList(row.education, storedEducationSchema),
    contacts,
    preferredContact: parsePreferredContact(row.preferred_contact, contacts, socialLinks),
    faq: parseList(row.faq, storedFaqItemSchema),
    services: parseList(row.services, storedServiceSchema),
    highlightedSections: pickKnown(row.highlighted_sections, profileSectionIds),
    cover: pickKnown([row.cover], coverIds)[0] ?? "classic",
    pageTheme: pickKnown([row.page_theme], pageThemeIds)[0] ?? "classic",
    linkIcons: row.link_icons,
    ctaPlacement: pickKnown([row.cta_placement], ctaPlacementIds)[0] ?? "inline",
    visibility: pickKnown([row.visibility], visibilityIds)[0] ?? "public",
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
    practice_started_on:
      data.practiceStartedOn === undefined ? undefined : data.practiceStartedOn || null,
    education: data.education?.map((entry) => ({
      qualification: entry.qualification,
      institution: entry.institution,
      year: entry.year ? Number(entry.year) : null,
    })),
    // В БД — только заполненные контакты
    contacts:
      data.contacts === undefined
        ? undefined
        : Object.fromEntries(Object.entries(data.contacts).filter(([, value]) => value)),
    preferred_contact:
      data.preferredContact === undefined ? undefined : data.preferredContact || null,
    faq: data.faq,
    services: data.services?.map(toProfileService),
    highlighted_sections: data.highlightedSections,
    cover: data.cover,
    page_theme: data.pageTheme,
    link_icons: data.linkIcons,
    cta_placement: data.ctaPlacement,
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
  // Скрытые профили гость в profiles не видит: режим по адресу отдаёт функция базы
  return (await getProfileVisibility(supabase, username)) === null;
}

export type CreateProfileResult =
  | { ok: true; profile: PublicProfile }
  | { ok: false; reason: "username_taken" | "profile_exists" | "city_invalid" };

/**
 * Создаёт профиль пользователя (онбординг). Контактную почту и закрытые данные сохраняем
 * первыми: повторная запись безопасна, поэтому сбой на любом шаге лечится повторной отправкой
 * формы.
 */
export async function createProfile(
  supabase: SupabaseClient,
  userId: string,
  data: ProfileData,
): Promise<CreateProfileResult> {
  if (data.contactEmail) await setContactEmail(supabase, userId, data.contactEmail);
  // На онбординге этих полей нет: строку profile_private заводим, только если что-то заполнено
  if (data.birthDate || data.gender || data.concerns.length > 0) {
    await setPrivateDetails(supabase, userId, data);
  }

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
  | {
      ok: false;
      reason: "username_taken" | "profile_missing" | "city_invalid" | "page_password_required";
    };

/**
 * Обновляет переданные поля профиля пользователя, а также контактную почту, закрытые данные
 * (`profile_private`) и режим страницы с паролем, если они переданы.
 */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  data: ProfileUpdateData,
): Promise<UpdateProfileResult> {
  if (data.contactEmail !== undefined) await setContactEmail(supabase, userId, data.contactEmail);
  await setPrivateDetails(supabase, userId, data);
  if (data.visibility !== undefined) {
    const result = await setProfileVisibility(supabase, data.visibility, data.pagePassword);
    if (!result.ok) return result;
  }

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
