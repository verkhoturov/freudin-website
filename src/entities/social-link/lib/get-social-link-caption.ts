import { socialPlatforms } from "../config/platforms";
import type { SocialLink } from "../model/schema";

// Служебные сегменты, после которых идёт имя: linkedin.com/in/anna, youtube.com/channel/UC…
const PATH_PREFIXES = new Set(["in", "company", "school", "channel", "c", "user"]);

function decodePath(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

// Имя профиля из пути ссылки: https://t.me/anna → anna. `null` — имени в пути нет
function getProfileHandle(url: URL): string | null {
  const [first, second] = decodePath(url.pathname).split("/").filter(Boolean);
  const handle = first && PATH_PREFIXES.has(first.toLowerCase()) ? second : first;
  // facebook.com/profile.php?id=… — служебная страница, а не имя
  return handle && !handle.endsWith(".php") ? handle : null;
}

/**
 * Подпись кнопки ссылки: платформа и имя профиля (`Telegram · @anna`), у сайта — адрес без
 * протокола (`example.com/blog`). Так различаются две ссылки одной платформы.
 */
export function getSocialLinkCaption(link: SocialLink): string {
  const { label, handlePrefix } = socialPlatforms[link.platform];
  let url: URL;
  try {
    url = new URL(link.url);
  } catch {
    return label;
  }

  if (link.platform === "website") {
    const host = url.hostname.replace(/^www\./, "");
    return host + decodePath(url.pathname).replace(/\/+$/, "");
  }

  const handle = getProfileHandle(url);
  if (!handle) return label;
  const prefix = handlePrefix && !handle.startsWith(handlePrefix) ? handlePrefix : "";
  return `${label} · ${prefix}${handle}`;
}
