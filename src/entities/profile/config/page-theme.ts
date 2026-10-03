/**
 * Пресет оформления личной страницы: фон за карточкой и карточка одним выбором. Цвета —
 * в `globals.css`, раздел «Оформление личной страницы». Classic — вид без карточки, как раньше.
 */
export const pageThemeIds = ["classic", "paper", "lavender", "orchid", "sage", "sky"] as const;

export type PageTheme = (typeof pageThemeIds)[number];

export const pageThemeLabels: Record<PageTheme, string> = {
  classic: "Classic",
  paper: "Paper",
  lavender: "Lavender",
  orchid: "Orchid",
  sage: "Sage",
  sky: "Sky",
};
