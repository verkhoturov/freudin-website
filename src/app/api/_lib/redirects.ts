import { getProfileByUserId } from "@/entities/profile/index.server";
import type { AuthErrorCode } from "@/entities/viewer/index.server";
import type { SupabaseServerClient } from "@/shared/api/index.server";
import { routes } from "@/shared/config";
import { NO_STORE_HEADERS } from "./responses";

/** Редирект браузера. Ответ может нести cookies сессии, поэтому не кешируется. */
export function redirectTo(url: URL | string): Response {
  return new Response(null, {
    status: 302,
    headers: { ...NO_STORE_HEADERS, Location: url.toString() },
  });
}

/** Возврат на страницу входа с кодом ошибки для `?error=` и сохранённым `next`. */
export function redirectToLogin(origin: string, error: AuthErrorCode, next: string): Response {
  const url = new URL(routes.login, origin);
  url.searchParams.set("error", error);
  if (next !== routes.home) url.searchParams.set("next", next);
  return redirectTo(url);
}

/**
 * Редирект после успешного входа: на онбординг, если профиля нет, иначе на `next` или на личную
 * страницу. Если профиль прочитать не удалось, страницу выберет клиент по `GET /api/me`.
 */
export async function redirectAfterSignIn(
  supabase: SupabaseServerClient,
  userId: string,
  origin: string,
  next: string,
): Promise<Response> {
  try {
    const profile = await getProfileByUserId(supabase, userId);
    if (!profile) return redirectTo(new URL(routes.onboarding, origin));
    const target = next === routes.home ? routes.profile(profile.username) : next;
    return redirectTo(new URL(target, origin));
  } catch (error) {
    console.error(error);
    return redirectTo(new URL(next, origin));
  }
}
