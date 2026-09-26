import "server-only";
import { type SocialLink, socialLinkSchema } from "@/entities/social-link/@x/profile";
import type { Json, SupabaseClient, Tables, TablesUpdate } from "@/shared/api/index.server";
import { demoProfile } from "../config/demo-profile";
import { DEMO_USERNAME, USERNAME_MAX_LENGTH } from "../config/limits";
import { AVATARS_BUCKET } from "../config/storage";
import type { ProfileData, ProfileUpdateData } from "../model/schemas";
import type { PublicProfile } from "../model/types";

export const PUBLIC_PROFILE_COLUMNS = "username, display_name, bio, avatar_path, social_links";

// Код Postgres для нарушения уникальности и имена ограничений из миграции profiles
const UNIQUE_VIOLATION = "23505";
const USERNAME_UNIQUE_CONSTRAINT = "profiles_username_key";

type PublicProfileRow = Pick<
  Tables<"profiles">,
  "username" | "display_name" | "bio" | "avatar_path" | "social_links"
>;

type PostgrestErrorLike = { code: string; message: string };

// Ссылки в БД уже нормализованы; невалидные (например, платформу убрали из справочника) пропускаем
function parseSocialLinks(value: Json): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const link = socialLinkSchema.safeParse(item);
    return link.success ? [link.data] : [];
  });
}

export function toPublicProfile(supabase: SupabaseClient, row: PublicProfileRow): PublicProfile {
  return {
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_path
      ? supabase.storage.from(AVATARS_BUCKET).getPublicUrl(row.avatar_path).data.publicUrl
      : null,
    socialLinks: parseSocialLinks(row.social_links),
  };
}

function toProfileRow(data: ProfileUpdateData): TablesUpdate<"profiles"> {
  return {
    username: data.username,
    display_name: data.displayName,
    bio: data.bio,
    social_links: data.socialLinks,
  };
}

function isUniqueViolation(error: PostgrestErrorLike, constraint?: string): boolean {
  return error.code === UNIQUE_VIOLATION && (!constraint || error.message.includes(constraint));
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
  | { ok: false; reason: "username_taken" | "profile_exists" };

/** Создаёт профиль пользователя (онбординг). */
export async function createProfile(
  supabase: SupabaseClient,
  userId: string,
  data: ProfileData,
): Promise<CreateProfileResult> {
  const { data: row, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username: data.username,
      display_name: data.displayName,
      bio: data.bio,
      social_links: data.socialLinks,
    })
    .select(PUBLIC_PROFILE_COLUMNS)
    .single();

  if (error) {
    if (isUniqueViolation(error, USERNAME_UNIQUE_CONSTRAINT)) {
      return { ok: false, reason: "username_taken" };
    }
    // Остальное нарушение уникальности — первичный ключ: профиль у пользователя уже есть
    if (isUniqueViolation(error)) return { ok: false, reason: "profile_exists" };
    throw error;
  }
  return { ok: true, profile: toPublicProfile(supabase, row) };
}

export type UpdateProfileResult =
  | { ok: true; profile: PublicProfile }
  | { ok: false; reason: "username_taken" | "profile_missing" };

/** Обновляет переданные поля профиля пользователя. */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  data: ProfileUpdateData,
): Promise<UpdateProfileResult> {
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
    if (isUniqueViolation(error, USERNAME_UNIQUE_CONSTRAINT)) {
      return { ok: false, reason: "username_taken" };
    }
    throw error;
  }
  if (!row) return { ok: false, reason: "profile_missing" };
  return { ok: true, profile: toPublicProfile(supabase, row) };
}
