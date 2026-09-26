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
  signOut: "/api/auth/sign-out",
  me: "/api/me",
  /** Профиль текущего пользователя: создание и обновление. */
  profile: "/api/profile",
  publicProfile: (username: string) => `/api/profiles/${encodeURIComponent(username)}`,
  usernameAvailability: (username: string) => `/api/usernames/${encodeURIComponent(username)}`,
} as const;
