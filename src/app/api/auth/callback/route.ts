import { redirectTo, redirectToLogin, withErrorHandling } from "@/app/api/_lib";
import { getProfileByUserId } from "@/entities/profile/index.server";
import { exchangeAuthCode } from "@/entities/viewer/index.server";
import { createSupabaseServerClient } from "@/shared/api/index.server";
import { routes } from "@/shared/config";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";

/**
 * Возврат от провайдера через Supabase: обмен кода на сессию и переход дальше — на онбординг,
 * если профиля нет, иначе на `next` или на личную страницу. Ошибки — на `/login`.
 */
export const GET = withErrorHandling(async (request) => {
  const { searchParams, origin } = new URL(request.url);
  const next = getSafeRedirectPath(searchParams.get("next"));

  const providerError = searchParams.get("error");
  if (providerError) {
    console.warn(
      "The sign-in provider returned an error:",
      providerError,
      searchParams.get("error_description"),
    );
    return redirectToLogin(
      origin,
      providerError === "access_denied" ? "access_denied" : "oauth_failed",
      next,
    );
  }

  const code = searchParams.get("code");
  if (!code) return redirectToLogin(origin, "oauth_failed", next);

  const supabase = await createSupabaseServerClient();
  const result = await exchangeAuthCode(supabase, code);
  if (!result.ok) {
    return redirectToLogin(
      origin,
      result.reason === "expired" ? "auth_expired" : "oauth_failed",
      next,
    );
  }

  try {
    const profile = await getProfileByUserId(supabase, result.userId);
    if (!profile) return redirectTo(new URL(routes.onboarding, origin));
    const target = next === routes.home ? routes.profile(profile.username) : next;
    return redirectTo(new URL(target, origin));
  } catch (error) {
    // Сессия уже есть: дальше страницу выберет клиент по GET /api/me
    console.error(error);
    return redirectTo(new URL(next, origin));
  }
});
