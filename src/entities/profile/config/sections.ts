/**
 * Блоки личной страницы после фото и имени, в порядке по умолчанию. Порядок пользователь
 * меняет в настройках; значения хранятся в `profiles.section_order`, БД проверяет только формат.
 */
export const profileSectionIds = [
  "bio",
  "approaches",
  "client-types",
  "work-formats",
  "location",
  "languages",
  "price",
  "links",
  "documents",
] as const;

export type ProfileSection = (typeof profileSectionIds)[number];

/** Названия блоков: в настройках и в подписях данных практики на странице. */
export const profileSectionLabels: Record<ProfileSection, string> = {
  bio: "Bio",
  approaches: "Approaches",
  "client-types": "Works with",
  "work-formats": "Format",
  location: "Location",
  languages: "Languages",
  price: "Price",
  links: "Links",
  documents: "Documents",
};
