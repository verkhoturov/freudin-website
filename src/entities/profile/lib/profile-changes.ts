import { type ProfileInput, type ProfileUpdateInput, profileInputSchema } from "../model/schemas";
import type { PublicProfile } from "../model/types";

/** Сохранённый профиль и контактная почта (`null` — её нет) в виде значений формы. */
export function toProfileInput(profile: PublicProfile, contactEmail: string | null): ProfileInput {
  return {
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    socialLinks: profile.socialLinks,
    contactEmail: contactEmail ?? "",
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
  const changes: ProfileUpdateInput = {};
  if (next.username !== saved.username) changes.username = next.username;
  if (next.displayName !== saved.displayName) changes.displayName = next.displayName;
  if (next.bio !== saved.bio) changes.bio = next.bio;
  if (JSON.stringify(next.socialLinks) !== JSON.stringify(saved.socialLinks)) {
    changes.socialLinks = next.socialLinks;
  }
  if (next.contactEmail !== saved.contactEmail) changes.contactEmail = next.contactEmail;
  return Object.keys(changes).length > 0 ? changes : null;
}
