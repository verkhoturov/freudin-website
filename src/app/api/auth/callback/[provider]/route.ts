import {
  redirectAfterSignIn,
  redirectToLogin,
  redirectToSettings,
  withErrorHandling,
} from "@/app/api/_lib";
import {
  completeOidcLink,
  completeOidcSignIn,
  getOAuthErrorCode,
  getOAuthLinkError,
  oidcProviderSchema,
  takeOidcSignInState,
} from "@/entities/viewer/index.server";
import { createSupabaseServerClient } from "@/shared/api/index.server";
import { apiRoutes, routes } from "@/shared/config";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";

/**
 * Возврат от Google или Telegram при входе без OAuth Supabase: проверка `state` по cookie попытки
 * входа, обмен кода на ID-токен и сессия Supabase по нему. Дальше — как в `/api/auth/callback`.
 * Если попытку начали из настроек (`linkUserId` в cookie), способ входа привязывается к аккаунту,
 * а итог показывают настройки.
 */
export const GET = withErrorHandling(
  async (request, { params }: RouteContext<"/api/auth/callback/[provider]">) => {
    const { searchParams, origin } = new URL(request.url);
    const provider = oidcProviderSchema.safeParse((await params).provider);
    if (!provider.success) return redirectToLogin(origin, "invalid_provider", routes.home);

    const signInState = await takeOidcSignInState(provider.data);
    const next = getSafeRedirectPath(signInState?.next);
    const isLink = Boolean(signInState?.linkUserId);

    const providerError = searchParams.get("error");
    if (providerError) {
      const description = searchParams.get("error_description");
      console.warn(`${provider.data} returned a sign-in error:`, providerError, description);
      if (isLink) {
        return redirectToSettings(origin, {
          error: getOAuthLinkError(providerError, null, description),
        });
      }
      return redirectToLogin(origin, getOAuthErrorCode(providerError, description), next);
    }
    if (!signInState) return redirectToLogin(origin, "auth_expired", next);

    const code = searchParams.get("code");
    if (!code || searchParams.get("state") !== signInState.state) {
      return isLink
        ? redirectToSettings(origin, { error: "link_failed" })
        : redirectToLogin(origin, "oauth_failed", next);
    }

    const supabase = await createSupabaseServerClient();
    const redirectUri = new URL(apiRoutes.oidcAuthCallback(provider.data), origin).toString();
    if (isLink) {
      const result = await completeOidcLink(supabase, provider.data, {
        code,
        redirectUri,
        signInState,
      });
      return redirectToSettings(
        origin,
        result.ok ? { linked: provider.data } : { error: result.error },
      );
    }

    const result = await completeOidcSignIn(supabase, provider.data, {
      code,
      redirectUri,
      signInState,
    });
    if (!result.ok) return redirectToLogin(origin, "oauth_failed", next);

    return redirectAfterSignIn(supabase, result.userId, origin, next);
  },
);
