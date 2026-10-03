/**
 * Вариант обложки страницы. Пока только сохраняется: оформление вариантов появится отдельным
 * шагом, и до него страница выглядит одинаково.
 */
export const coverIds = ["classic", "banner", "hero"] as const;

export type ProfileCover = (typeof coverIds)[number];

export const coverLabels: Record<ProfileCover, string> = {
  classic: "Classic",
  banner: "Banner",
  hero: "Hero",
};
