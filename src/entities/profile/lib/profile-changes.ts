import { type ProfileInput, type ProfileUpdateInput, profileInputSchema } from "../model/schemas";
import type { PublicProfile } from "../model/types";

/** Профиль в виде значений формы. */
export function toProfileInput(profile: PublicProfile): ProfileInput {
  return {
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    socialLinks: profile.socialLinks,
  };
}

/**
 * Изменённые поля для `PATCH /api/profile` или `null`, если менять нечего. Сравниваем
 * нормализованные значения: `@anna` и `https://t.me/anna` — одна и та же ссылка.
 */
export function getProfileChanges(
  profile: PublicProfile,
  input: ProfileInput,
): ProfileUpdateInput | null {
  const parsed = profileInputSchema.safeParse(input);
  // Невалидные данные отправляем целиком: сервер ответит ошибками по полям
  if (!parsed.success) return input;

  const next = parsed.data;
  const changes: ProfileUpdateInput = {};
  if (next.username !== profile.username) changes.username = next.username;
  if (next.displayName !== profile.displayName) changes.displayName = next.displayName;
  if (next.bio !== profile.bio) changes.bio = next.bio;
  if (JSON.stringify(next.socialLinks) !== JSON.stringify(profile.socialLinks)) {
    changes.socialLinks = next.socialLinks;
  }
  return Object.keys(changes).length > 0 ? changes : null;
}
