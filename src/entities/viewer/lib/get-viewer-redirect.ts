import { routes } from "@/shared/config";
import type { Viewer } from "../model/types";
import { getLoginHref } from "./get-login-href";

/**
 * Кому доступна страница: `guest` — только гостям (вход), `without-profile` — вошедшим без
 * профиля (онбординг), `with-profile` — вошедшим с профилем (настройки).
 */
export type ViewerAccess = "guest" | "without-profile" | "with-profile";

/** Главная страница пользователя: его личная страница или онбординг, если профиля ещё нет. */
export function getViewerHomePath(viewer: Viewer): string {
  return viewer.profile ? routes.profile(viewer.profile.username) : routes.onboarding;
}

/** Куда перенаправить со страницы с доступом `access`, или `null`, если оставаться. */
export function getViewerRedirect(
  access: ViewerAccess,
  viewer: Viewer | null,
  { pathname, next }: { pathname: string; next?: string },
): string | null {
  if (access === "guest") {
    if (!viewer) return null;
    return next && next !== routes.login ? next : getViewerHomePath(viewer);
  }
  if (!viewer) return getLoginHref(pathname);
  // С профилем онбординг уже пройден: ведём на личную страницу, в том числе сразу после создания
  if (access === "without-profile") return viewer.profile ? getViewerHomePath(viewer) : null;
  return viewer.profile ? null : routes.onboarding;
}
