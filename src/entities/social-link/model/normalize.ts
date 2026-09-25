import { type SocialPlatform, socialPlatforms } from "../config/platforms";

const HANDLE_PATTERN = /^@?([\w.-]{1,64})$/;

function parseUrl(value: string): URL | null {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function matchesHost(hostname: string, hosts: string[]): boolean {
  return hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

/**
 * Приводит ввод пользователя к ссылке на профиль:
 * `@anna` → `https://t.me/anna`, `t.me/anna` → `https://t.me/anna`.
 * Возвращает `null`, если ввод не похож на ссылку этой платформы.
 */
export function normalizeSocialLinkUrl(platform: SocialPlatform, input: string): string | null {
  const value = input.trim();
  const config = socialPlatforms[platform];
  if (!value) return null;

  // Имя пользователя: «@anna» или «anna.smith» без слеша и без домена платформы
  const handle = HANDLE_PATTERN.exec(value)?.[1];
  const looksLikeUrl = value.includes("/") || matchesHost(value.toLowerCase(), config.hosts);
  if (config.profileUrl && handle && !looksLikeUrl) {
    return config.profileUrl(handle);
  }

  const url = parseUrl(value);
  if (!url || !url.hostname.includes(".")) return null;
  if (config.hosts.length === 0) return url.toString();

  if (!matchesHost(url.hostname.toLowerCase(), config.hosts) || url.pathname.length <= 1) {
    return null;
  }
  url.protocol = "https:";
  return url.toString();
}
