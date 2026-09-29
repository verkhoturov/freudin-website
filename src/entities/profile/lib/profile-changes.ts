import {
  linkedFieldGroups,
  type ProfileInput,
  type ProfileUpdateInput,
  profileInputSchema,
} from "../model/schemas";
import type { PrivateProfileDetails, PublicProfile } from "../model/types";

type SettingsInput = Pick<
  ProfileInput,
  | "country"
  | "cityId"
  | "workFormats"
  | "clientTypes"
  | "approaches"
  | "languages"
  | "priceAmount"
  | "priceCurrency"
  | "sectionOrder"
  | "practiceStartedOn"
  | "education"
  | "contacts"
  | "preferredContact"
  | "birthDate"
  | "gender"
  | "concerns"
>;

/**
 * Поля, которые заполняются только в настройках (данные психолога, порядок блоков),
 * незаполненными в виде значений формы: для онбординга.
 */
export function getEmptySettingsInput(): SettingsInput {
  return {
    country: "",
    cityId: null,
    workFormats: [],
    clientTypes: [],
    approaches: [],
    languages: [],
    priceAmount: "",
    priceCurrency: "",
    sectionOrder: [],
    practiceStartedOn: "",
    education: [],
    contacts: { email: "", phone: "", whatsapp: "", telegram: "" },
    preferredContact: "",
    birthDate: "",
    gender: "",
    concerns: [],
  };
}

/**
 * Сохранённый профиль, контактная почта (`null` — её нет) и закрытые данные в виде значений
 * формы. Порядок ключей вложенных объектов — как в схемах: `getProfileChanges` сравнивает JSON.
 */
export function toProfileInput(
  profile: PublicProfile,
  contactEmail: string | null,
  privateDetails: PrivateProfileDetails,
): ProfileInput {
  const { contacts } = profile;
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
    sectionOrder: profile.sectionOrder,
    practiceStartedOn: profile.practiceStartedOn ?? "",
    education: profile.education.map((entry) => ({
      qualification: entry.qualification,
      institution: entry.institution,
      year: entry.year === null ? "" : String(entry.year),
    })),
    contacts: {
      email: contacts.email ?? "",
      phone: contacts.phone ?? "",
      whatsapp: contacts.whatsapp ?? "",
      telegram: contacts.telegram ?? "",
    },
    preferredContact: profile.preferredContact ?? "",
    birthDate: privateDetails.birthDate ?? "",
    gender: privateDetails.gender ?? "",
    concerns: privateDetails.concerns,
  };
}

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
  // Связанные поля сервер проверяет вместе, поэтому отправляем группу целиком
  for (const group of linkedFieldGroups) {
    if (!group.some((key) => key in changes)) continue;
    for (const key of group) changes[key] = next[key];
  }
  return Object.keys(changes).length > 0 ? (changes as ProfileUpdateInput) : null;
}
