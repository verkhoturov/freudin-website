/** Пути страниц. Ссылки внутри приложения строим только через этот объект. */
export const routes = {
  home: "/",
  login: "/login",
  onboarding: "/onboarding",
  settings: "/settings",
  privacy: "/privacy",
  terms: "/terms",
  profile: (username: string) => `/${encodeURIComponent(username)}`,
} as const;

/** Пути API-роутов для apiClient. */
export const apiRoutes = {
  health: "/api/health",
  signIn: "/api/auth/sign-in",
  authCallback: "/api/auth/callback",
  /**
   * Возврат от провайдера при входе без OAuth Supabase. Адрес указан у провайдера: в OAuth-клиенте
   * Google и в Redirect URIs бота Telegram.
   */
  oidcAuthCallback: (provider: "google" | "telegram") => `/api/auth/callback/${provider}`,
  signOut: "/api/auth/sign-out",
  me: "/api/me",
  /** Профиль текущего пользователя: создание и обновление. */
  profile: "/api/profile",
  profileAvatar: "/api/profile/avatar",
  publicProfile: (username: string) => `/api/profiles/${encodeURIComponent(username)}`,
  usernameAvailability: (username: string) => `/api/usernames/${encodeURIComponent(username)}`,
} as const;
