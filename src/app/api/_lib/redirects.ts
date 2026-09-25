import type { AuthErrorCode } from "@/entities/viewer/index.server";
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
