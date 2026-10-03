/**
 * Кто видит личную страницу: все, только владелец или те, кто знает пароль. Пароль — мягкий
 * замок (решение пользователя 02.10.2026): от 4 до 8 символов, без защиты от перебора.
 */
export const visibilityIds = ["public", "private", "password"] as const;

export type ProfileVisibility = (typeof visibilityIds)[number];

/** Режимы скрытой страницы: подписи вариантов в настройках. */
export const hiddenVisibilityLabels: Record<Exclude<ProfileVisibility, "public">, string> = {
  private: "Only me",
  password: "Anyone with the password",
};

export const PAGE_PASSWORD_MIN_LENGTH = 4;
export const PAGE_PASSWORD_MAX_LENGTH = 8;
