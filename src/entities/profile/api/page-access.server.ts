import "server-only";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@/shared/api/index.server";
import { type ProfileVisibility, visibilityIds } from "../config/visibility";
import { pickKnown } from "../lib/pick-known";

/** Сколько действует введённый гостем пароль страницы: 30 дней (решение пользователя). */
const PAGE_ACCESS_MAX_AGE = 60 * 60 * 24 * 30;

/** Cookie с токеном доступа к странице с паролем: своя у каждой страницы. */
function getPageAccessCookieName(username: string): string {
  return `freudin-page-access-${username}`;
}

/** Токен доступа к странице из cookie запроса (серверный рендер и route handlers). */
export async function readPageAccessToken(username: string): Promise<string | undefined> {
  return (await cookies()).get(getPageAccessCookieName(username))?.value;
}

/** Запоминает введённый пароль: httpOnly-cookie с токеном доступа на 30 дней. */
export async function setPageAccessCookie(username: string, token: string): Promise<void> {
  (await cookies()).set(getPageAccessCookieName(username), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PAGE_ACCESS_MAX_AGE,
  });
}

/**
 * Режим страницы по адресу или `null`, если адреса нет. Скрытые профили гость в `profiles` не
 * видит, поэтому режим отдаёт функция базы.
 */
export async function getProfileVisibility(
  supabase: SupabaseClient,
  username: string,
): Promise<ProfileVisibility | null> {
  const { data, error } = await supabase.rpc("get_profile_visibility", { p_username: username });
  if (error) throw error;
  return data ? (pickKnown([data], visibilityIds)[0] ?? null) : null;
}

export type SetProfileVisibilityResult =
  | { ok: true }
  | { ok: false; reason: "page_password_required" };

/**
 * Режим страницы текущего пользователя и новый пароль (пустая строка — пароль не меняется).
 * Новый пароль или смена режима отзывают доступ, выданный гостям раньше.
 */
export async function setProfileVisibility(
  supabase: SupabaseClient,
  visibility: ProfileVisibility,
  password: string | undefined,
): Promise<SetProfileVisibilityResult> {
  const { error } = await supabase.rpc("set_profile_visibility", {
    p_visibility: visibility,
    p_password: password || undefined,
  });
  if (!error) return { ok: true };
  // Режим password без заданного пароля: исключение из функции базы
  if (error.message === "page_password_required") {
    return { ok: false, reason: "page_password_required" };
  }
  throw error;
}

/** Токен доступа к странице с паролем, если пароль верный, иначе `null`. */
export async function unlockProfilePage(
  supabase: SupabaseClient,
  username: string,
  password: string,
): Promise<string | null> {
  const { data, error } = await supabase.rpc("unlock_profile_page", {
    p_username: username,
    p_password: password,
  });
  if (error) throw error;
  return data ?? null;
}
