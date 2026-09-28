import { type ProfileInput, type ProfileUpdateInput, profileInputSchema } from "../model/schemas";
import type { PublicProfile } from "../model/types";

type PracticeInput = Pick<
  ProfileInput,
  | "country"
  | "cityId"
  | "workFormats"
  | "clientTypes"
  | "approaches"
  | "languages"
  | "priceAmount"
  | "priceCurrency"
>;

/** Незаполненные данные психолога в виде значений формы: для онбординга. */
export function getEmptyPracticeInput(): PracticeInput {
  return {
    country: "",
    cityId: null,
    workFormats: [],
    clientTypes: [],
    approaches: [],
    languages: [],
    priceAmount: "",
    priceCurrency: "",
  };
}

/** Сохранённый профиль и контактная почта (`null` — её нет) в виде значений формы. */
export function toProfileInput(profile: PublicProfile, contactEmail: string | null): ProfileInput {
  return {
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    socialLinks: profile.socialLinks,
    contactEmail: contactEmail ?? "",
    country: profile.country ?? "",
    cityId: profile.city?.id ?? null,
    workFormats: profile.workFormats,
    clientTypes: profile.clientTypes,
    approaches: profile.approaches,
    languages: profile.languages,
    priceAmount: profile.price ? String(profile.price.amount) : "",
    priceCurrency: profile.price?.currency ?? "",
  };
}

// Связанные поля сервер проверяет вместе, поэтому отправляем группу целиком
const linkedFieldGroups: (keyof ProfileUpdateInput)[][] = [
  ["country", "cityId", "workFormats"],
  ["priceAmount", "priceCurrency"],
];

/**
 * Изменённые поля для `PATCH /api/profile` или `null`, если менять нечего. `saved` — значения
 * из `toProfileInput`. Сравниваем нормализованные значения: `@anna` и `https://t.me/anna` —
 * одна и та же ссылка.
 */
export function getProfileChanges(
  saved: ProfileInput,
  input: ProfileInput,
): ProfileUpdateInput | null {
  const parsed = profileInputSchema.safeParse(input);
  // Невалидные данные отправляем целиком: сервер ответит ошибками по полям
  if (!parsed.success) return input;

  const next = parsed.data;
  const changes: Record<string, unknown> = {};
  for (const key of Object.keys(next) as (keyof typeof next)[]) {
    if (JSON.stringify(next[key]) !== JSON.stringify(saved[key])) changes[key] = next[key];
  }
  for (const group of linkedFieldGroups) {
    if (!group.some((key) => key in changes)) continue;
    for (const key of group) changes[key] = next[key];
  }
  return Object.keys(changes).length > 0 ? (changes as ProfileUpdateInput) : null;
}
