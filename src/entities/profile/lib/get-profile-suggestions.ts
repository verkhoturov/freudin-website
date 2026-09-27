import { transliterate } from "@/shared/lib/transliterate";
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

const EDGE_SEPARATORS = /^[_-]+|[_-]+$/g;

// «Анна Смирнова» → «anna-smirnova», «anna.smirnova+work» → «anna-smirnova-work»
function toUsernameCandidate(value: string): string | null {
  const candidate = transliterate(value)
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(EDGE_SEPARATORS, "")
    .slice(0, USERNAME_MAX_LENGTH)
    .replace(EDGE_SEPARATORS, "");
  return usernameSchema.safeParse(candidate).success ? candidate : null;
}

// Первый источник, из которого получился допустимый адрес
function suggestUsername(sources: (string | null | undefined)[]): string | null {
  for (const source of sources) {
    const candidate = source ? toUsernameCandidate(source) : null;
    if (candidate) return candidate;
  }
  return null;
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
 * Имя, адрес страницы и фото из `user_metadata` провайдера. Имя лежит в `full_name`/`name`,
 * фото — в `avatar_url`/`picture`. Адрес — username провайдера (у Telegram
 * `preferred_username`), иначе имя латиницей. Часть email до «@» — только запасной вариант:
 * публичный адрес выдал бы логин почты. Свободен ли адрес, проверяет онбординг.
 */
export function getProfileSuggestions(
  metadata: Record<string, unknown> | undefined,
  email: string | null,
): ProfileSuggestions {
  const data = metadata ?? {};
  const displayName = readString(data, ["full_name", "name"]);
  const username = suggestUsername([
    readString(data, ["preferred_username", "user_name"]),
    displayName,
    email?.split("@")[0],
  ]);

  return {
    displayName: displayName ? displayName.slice(0, DISPLAY_NAME_MAX_LENGTH) : null,
    username,
    avatarUrl: toHttpsUrl(readString(data, ["avatar_url", "picture"])),
  };
}
