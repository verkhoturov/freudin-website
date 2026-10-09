export const authProviders = ["google", "facebook", "telegram"] as const;

export type AuthProvider = (typeof authProviders)[number];

/**
 * Провайдеры, подключённые в Supabase. Только их кнопки видны на `/login`, остальные
 * `/api/auth/sign-in` отправляет на «Способ входа недоступен». Facebook скрыт до подтверждения
 * компании в Meta (этап G в `docs/PLAN.md`).
 */
export const enabledAuthProviders: readonly AuthProvider[] = ["google", "telegram"];

export const authProviderLabels: Record<AuthProvider, string> = {
  google: "Google",
  facebook: "Facebook",
  telegram: "Telegram",
};
