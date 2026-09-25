import { routes } from "@/shared/config";

/** Ссылка на страницу входа. `next` — куда вернуть пользователя после входа. */
export function getLoginHref(next?: string): string {
  if (!next || next === routes.home || next === routes.login) return routes.login;
  return `${routes.login}?${new URLSearchParams({ next })}`;
}
