import { withErrorHandling } from "@/app/api/_lib";
import { authProviderSchema } from "@/entities/viewer/index.server";
import { routes } from "@/shared/config";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";

/**
 * Заглушка до подключения Supabase (шаг 8 плана): проверяет параметры и возвращает
 * на страницу входа с ошибкой. На шаге 8 здесь появится редирект к провайдеру.
 */
export const GET = withErrorHandling((request) => {
  const { searchParams, origin } = new URL(request.url);
  const provider = authProviderSchema.safeParse(searchParams.get("provider"));
  const next = getSafeRedirectPath(searchParams.get("next"));

  const loginUrl = new URL(routes.login, origin);
  loginUrl.searchParams.set("error", provider.success ? "auth_unavailable" : "invalid_provider");
  if (next !== routes.home) loginUrl.searchParams.set("next", next);
  return Response.redirect(loginUrl, 302);
});
