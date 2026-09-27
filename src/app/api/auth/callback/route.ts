import {
  redirectAfterSignIn,
  redirectToLogin,
  redirectToSettings,
  withErrorHandling,
} from "@/app/api/_lib";
import {
  authProviderSchema,
  exchangeAuthCode,
  getOAuthErrorCode,
  getOAuthLinkError,
} from "@/entities/viewer/index.server";
import { createSupabaseServerClient } from "@/shared/api/index.server";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";

/**
 * Возврат от провайдера через OAuth Supabase (Facebook, Telegram на localhost): обмен кода
 * на сессию и переход дальше — на онбординг, если профиля нет, иначе на `next` или на личную
 * страницу. Ошибки — на `/login`. С `mode=link` это привязка способа входа из настроек:
 * итог показывают настройки. Google возвращается на `/api/auth/callback/google`.
 */
export const GET = withErrorHandling(async (request) => {
  const { searchParams, origin } = new URL(request.url);
  const next = getSafeRedirectPath(searchParams.get("next"));
  const isLink = searchParams.get("mode") === "link";
  const provider = authProviderSchema.safeParse(searchParams.get("provider"));

  const providerError = searchParams.get("error");
  if (providerError) {
    const errorCode = searchParams.get("error_code");
    const description = searchParams.get("error_description");
    console.warn("The sign-in provider returned an error:", providerError, errorCode, description);
    if (isLink) {
      return redirectToSettings(origin, {
        error: getOAuthLinkError(providerError, errorCode, description),
      });
    }
    return redirectToLogin(origin, getOAuthErrorCode(providerError, description), next);
  }

  const code = searchParams.get("code");
  if (!code) {
    return isLink
      ? redirectToSettings(origin, { error: "link_failed" })
      : redirectToLogin(origin, "oauth_failed", next);
  }

  const supabase = await createSupabaseServerClient();
  const result = await exchangeAuthCode(supabase, code, provider.success ? provider.data : null);
  if (isLink) {
    return result.ok && provider.success
      ? redirectToSettings(origin, { linked: provider.data })
      : redirectToSettings(origin, { error: "link_failed" });
  }
  if (!result.ok) {
    return redirectToLogin(
      origin,
      result.reason === "expired" ? "auth_expired" : "oauth_failed",
      next,
    );
  }

  return redirectAfterSignIn(supabase, result.userId, origin, next);
});
