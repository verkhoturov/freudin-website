import { HttpError } from "./http-error";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Защита от CSRF поверх cookies с `SameSite=Lax`: изменяющий запрос принимаем, только если
 * браузер отправил его с нашего сайта. Браузер всегда ставит `Sec-Fetch-Site` или `Origin`,
 * и подделать их из JavaScript нельзя. Запрос без обоих заголовков пришёл не из браузера
 * (curl, вебхук): cookies посетителя у него нет, поэтому его пропускаем.
 */
export function assertSameOrigin(request: Request): void {
  if (SAFE_METHODS.has(request.method)) return;

  const fetchSite = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  const isSameOrigin = fetchSite
    ? fetchSite === "same-origin"
    : origin === null || origin === new URL(request.url).origin;

  if (!isSameOrigin) {
    throw new HttpError(403, "forbidden", "Request rejected: it was sent from another site.");
  }
}
