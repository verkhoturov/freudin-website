import { redirectAfterSignIn, redirectToLogin, withErrorHandling } from "@/app/api/_lib";
import { completeGoogleSignIn, takeGoogleSignInState } from "@/entities/viewer/index.server";
import { createSupabaseServerClient } from "@/shared/api/index.server";
import { apiRoutes } from "@/shared/config";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";

/**
 * Возврат от Google при входе без OAuth Supabase: проверка `state` по cookie попытки входа,
 * обмен кода на ID-токен и сессия Supabase по нему. Дальше — как в `/api/auth/callback`.
 */
export const GET = withErrorHandling(async (request) => {
  const { searchParams, origin } = new URL(request.url);
  const signInState = await takeGoogleSignInState();
  const next = getSafeRedirectPath(signInState?.next);

  const providerError = searchParams.get("error");
  if (providerError) {
    console.warn("Google returned a sign-in error:", providerError);
    return redirectToLogin(
      origin,
      providerError === "access_denied" ? "access_denied" : "oauth_failed",
      next,
    );
  }
  if (!signInState) return redirectToLogin(origin, "auth_expired", next);

  const code = searchParams.get("code");
  if (!code || searchParams.get("state") !== signInState.state) {
    return redirectToLogin(origin, "oauth_failed", next);
  }

  const supabase = await createSupabaseServerClient();
  const result = await completeGoogleSignIn(supabase, {
    code,
    redirectUri: new URL(apiRoutes.googleAuthCallback, origin).toString(),
    signInState,
  });
  if (!result.ok) return redirectToLogin(origin, "oauth_failed", next);

  return redirectAfterSignIn(supabase, result.userId, origin, next);
});
