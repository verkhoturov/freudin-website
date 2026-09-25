import { DISPLAY_NAME_MAX_LENGTH, USERNAME_MAX_LENGTH } from "../config/limits";
import { usernameSchema } from "../model/username";

/** Подсказки для онбординга из данных провайдера входа. Поля без подходящих данных — `null`. */
export type ProfileSuggestions = {
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

function readString(metadata: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

// «Anna.Smirnova+work» → «annasmirnovawork»: оставляем только допустимые символы
function toUsernameCandidate(value: string): string | null {
  const candidate = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, USERNAME_MAX_LENGTH)
    .replace(/^[_-]+|[_-]+$/g, "");
  return usernameSchema.safeParse(candidate).success ? candidate : null;
}

function toHttpsUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

/**
 * Имя, адрес страницы и фото из `user_metadata` провайдера. У Google и Facebook имя лежит
 * в `full_name`/`name`, фото — в `avatar_url`/`picture`; адрес берём из части email до «@».
 * Свободен ли адрес, проверяет онбординг.
 */
export function getProfileSuggestions(
  metadata: Record<string, unknown> | undefined,
  email: string | null,
): ProfileSuggestions {
  const data = metadata ?? {};
  const displayName = readString(data, ["full_name", "name"]);
  const usernameSource =
    readString(data, ["preferred_username", "user_name"]) ?? email?.split("@")[0];

  return {
    displayName: displayName ? displayName.slice(0, DISPLAY_NAME_MAX_LENGTH) : null,
    username: usernameSource ? toUsernameCandidate(usernameSource) : null,
    avatarUrl: toHttpsUrl(readString(data, ["avatar_url", "picture"])),
  };
}
