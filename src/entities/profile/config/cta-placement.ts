/**
 * Где главная кнопка на телефоне: под именем или закреплена внизу экрана. На компьютере она
 * всегда под именем.
 */
export const ctaPlacementIds = ["inline", "sticky"] as const;

export type CtaPlacement = (typeof ctaPlacementIds)[number];
