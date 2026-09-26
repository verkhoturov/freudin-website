export const authProviders = ["google", "facebook", "telegram"] as const;

export type AuthProvider = (typeof authProviders)[number];

/**
 * Провайдеры, подключённые в Supabase. Только их кнопки видны на `/login`, остальные
 * `/api/auth/sign-in` отправляет на «Способ входа недоступен».
 */
export const enabledAuthProviders: readonly AuthProvider[] = ["google"];

export const authProviderLabels: Record<AuthProvider, string> = {
  google: "Google",
  facebook: "Facebook",
  telegram: "Telegram",
};
