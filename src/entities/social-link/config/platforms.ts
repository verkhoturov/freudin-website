export const socialPlatformIds = [
  "telegram",
  "instagram",
  "vk",
  "facebook",
  "x",
  "youtube",
  "tiktok",
  "linkedin",
  "threads",
  "website",
] as const;

export type SocialPlatform = (typeof socialPlatformIds)[number];

type SocialPlatformConfig = {
  label: string;
  /** Допустимые хосты ссылки (поддомены вроде `www.` и `m.` тоже подходят). Пусто — любой сайт. */
  hosts: string[];
  /** Ссылка на профиль по имени пользователя: `@anna` → `https://t.me/anna`. */
  profileUrl?: (handle: string) => string;
  placeholder: string;
};

export const socialPlatforms: Record<SocialPlatform, SocialPlatformConfig> = {
  telegram: {
    label: "Telegram",
    hosts: ["t.me", "telegram.me"],
    profileUrl: (handle) => `https://t.me/${handle}`,
    placeholder: "@username или ссылка t.me",
  },
  instagram: {
    label: "Instagram",
    hosts: ["instagram.com"],
    profileUrl: (handle) => `https://www.instagram.com/${handle}`,
    placeholder: "@username или ссылка на профиль",
  },
  vk: {
    label: "ВКонтакте",
    hosts: ["vk.com", "vk.ru"],
    profileUrl: (handle) => `https://vk.com/${handle}`,
    placeholder: "Короткое имя или ссылка vk.com",
  },
  facebook: {
    label: "Facebook",
    hosts: ["facebook.com", "fb.com"],
    profileUrl: (handle) => `https://www.facebook.com/${handle}`,
    placeholder: "Имя пользователя или ссылка на профиль",
  },
  x: {
    label: "X",
    hosts: ["x.com", "twitter.com"],
    profileUrl: (handle) => `https://x.com/${handle}`,
    placeholder: "@username или ссылка x.com",
  },
  youtube: {
    label: "YouTube",
    hosts: ["youtube.com", "youtu.be"],
    profileUrl: (handle) => `https://www.youtube.com/@${handle}`,
    placeholder: "@канал или ссылка на канал",
  },
  tiktok: {
    label: "TikTok",
    hosts: ["tiktok.com"],
    profileUrl: (handle) => `https://www.tiktok.com/@${handle}`,
    placeholder: "@username или ссылка на профиль",
  },
  linkedin: {
    label: "LinkedIn",
    hosts: ["linkedin.com"],
    profileUrl: (handle) => `https://www.linkedin.com/in/${handle}`,
    placeholder: "Имя профиля или ссылка на профиль",
  },
  threads: {
    label: "Threads",
    hosts: ["threads.net", "threads.com"],
    profileUrl: (handle) => `https://www.threads.com/@${handle}`,
    placeholder: "@username или ссылка на профиль",
  },
  website: {
    label: "Сайт",
    hosts: [],
    placeholder: "https://example.com",
  },
};
