import { redirectAfterSignIn, redirectToLogin, withErrorHandling } from "@/app/api/_lib";
import {
  completeOidcSignIn,
  getOAuthErrorCode,
  oidcProviderSchema,
  takeOidcSignInState,
} from "@/entities/viewer/index.server";
import { createSupabaseServerClient } from "@/shared/api/index.server";
import { apiRoutes, routes } from "@/shared/config";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";

/**
 * Возврат от Google или Telegram при входе без OAuth Supabase: проверка `state` по cookie попытки
 * входа, обмен кода на ID-токен и сессия Supabase по нему. Дальше — как в `/api/auth/callback`.
 */
export const GET = withErrorHandling(
  async (request, { params }: RouteContext<"/api/auth/callback/[provider]">) => {
    const { searchParams, origin } = new URL(request.url);
    const provider = oidcProviderSchema.safeParse((await params).provider);
    if (!provider.success) return redirectToLogin(origin, "invalid_provider", routes.home);

    const signInState = await takeOidcSignInState(provider.data);
    const next = getSafeRedirectPath(signInState?.next);

    const providerError = searchParams.get("error");
    if (providerError) {
      const description = searchParams.get("error_description");
      console.warn(`${provider.data} returned a sign-in error:`, providerError, description);
      return redirectToLogin(origin, getOAuthErrorCode(providerError, description), next);
    }
    if (!signInState) return redirectToLogin(origin, "auth_expired", next);

    const code = searchParams.get("code");
    if (!code || searchParams.get("state") !== signInState.state) {
      return redirectToLogin(origin, "oauth_failed", next);
    }

    const supabase = await createSupabaseServerClient();
    const result = await completeOidcSignIn(supabase, provider.data, {
      code,
      redirectUri: new URL(apiRoutes.oidcAuthCallback(provider.data), origin).toString(),
      signInState,
    });
    if (!result.ok) return redirectToLogin(origin, "oauth_failed", next);

    return redirectAfterSignIn(supabase, result.userId, origin, next);
  },
);
