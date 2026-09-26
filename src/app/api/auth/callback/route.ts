import { redirectAfterSignIn, redirectToLogin, withErrorHandling } from "@/app/api/_lib";
import {
  authProviderSchema,
  exchangeAuthCode,
  getOAuthErrorCode,
} from "@/entities/viewer/index.server";
import { createSupabaseServerClient } from "@/shared/api/index.server";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";

/**
 * Возврат от провайдера через OAuth Supabase (Facebook, Telegram): обмен кода на сессию
 * и переход дальше — на онбординг, если профиля нет, иначе на `next` или на личную страницу.
 * Ошибки — на `/login`. Google возвращается на `/api/auth/callback/google`.
 */
export const GET = withErrorHandling(async (request) => {
  const { searchParams, origin } = new URL(request.url);
  const next = getSafeRedirectPath(searchParams.get("next"));

  const providerError = searchParams.get("error");
  if (providerError) {
    const description = searchParams.get("error_description");
    console.warn("The sign-in provider returned an error:", providerError, description);
    return redirectToLogin(origin, getOAuthErrorCode(providerError, description), next);
  }

  const code = searchParams.get("code");
  if (!code) return redirectToLogin(origin, "oauth_failed", next);

  const provider = authProviderSchema.safeParse(searchParams.get("provider"));
  const supabase = await createSupabaseServerClient();
  const result = await exchangeAuthCode(supabase, code, provider.success ? provider.data : null);
  if (!result.ok) {
    return redirectToLogin(
      origin,
      result.reason === "expired" ? "auth_expired" : "oauth_failed",
      next,
    );
  }

  return redirectAfterSignIn(supabase, result.userId, origin, next);
});
