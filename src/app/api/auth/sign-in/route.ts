import { redirectTo, redirectToLogin, withErrorHandling } from "@/app/api/_lib";
import { authProviderSchema, getOAuthSignInUrl } from "@/entities/viewer/index.server";
import { createSupabaseServerClient } from "@/shared/api/index.server";
import { apiRoutes, routes } from "@/shared/config";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";

/** Старт входа: браузер приходит сюда по ссылке и уходит к провайдеру. Ошибки — на `/login`. */
export const GET = withErrorHandling(async (request) => {
  const { searchParams, origin } = new URL(request.url);
  const provider = authProviderSchema.safeParse(searchParams.get("provider"));
  const next = getSafeRedirectPath(searchParams.get("next"));
  if (!provider.success) return redirectToLogin(origin, "invalid_provider", next);

  const callbackUrl = new URL(apiRoutes.authCallback, origin);
  if (next !== routes.home) callbackUrl.searchParams.set("next", next);

  try {
    const supabase = await createSupabaseServerClient();
    const url = await getOAuthSignInUrl(supabase, provider.data, callbackUrl.toString());
    return url ? redirectTo(url) : redirectToLogin(origin, "auth_unavailable", next);
  } catch (error) {
    console.error(error);
    return redirectToLogin(origin, "oauth_failed", next);
  }
});
