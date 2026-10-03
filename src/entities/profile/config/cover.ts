/**
 * Вариант обложки страницы: Classic — круглое фото, Banner — полоса цвета пресета и фото на её
 * краю, Hero — большое фото (без фото — Banner). Рисует `PageCover` в `profile-card`.
 */
export const coverIds = ["classic", "banner", "hero"] as const;

export type ProfileCover = (typeof coverIds)[number];

export const coverLabels: Record<ProfileCover, string> = {
  classic: "Classic",
  banner: "Banner",
  hero: "Hero",
};
