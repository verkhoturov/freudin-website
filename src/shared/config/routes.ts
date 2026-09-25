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
