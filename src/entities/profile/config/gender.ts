/** Пол психолога: на странице не показывается, нужен для поиска (`profile_private.gender`). */
export const genderIds = ["female", "male", "other"] as const;

export type Gender = (typeof genderIds)[number];

export const genderLabels: Record<Gender, string> = {
  female: "Female",
  male: "Male",
  other: "Other",
};
