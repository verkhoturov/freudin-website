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
  /** Префикс имени в подписи ссылки, если в адресе его нет: `t.me/anna` → `@anna`. */
  handlePrefix?: string;
  placeholder: string;
};

export const socialPlatforms: Record<SocialPlatform, SocialPlatformConfig> = {
  telegram: {
    label: "Telegram",
    hosts: ["t.me", "telegram.me"],
    profileUrl: (handle) => `https://t.me/${handle}`,
    handlePrefix: "@",
    placeholder: "@username or t.me link",
  },
  instagram: {
    label: "Instagram",
    hosts: ["instagram.com"],
    profileUrl: (handle) => `https://www.instagram.com/${handle}`,
    handlePrefix: "@",
    placeholder: "@username or profile link",
  },
  vk: {
    label: "VK",
    hosts: ["vk.com", "vk.ru"],
    profileUrl: (handle) => `https://vk.com/${handle}`,
    placeholder: "Short name or vk.com link",
  },
  facebook: {
    label: "Facebook",
    hosts: ["facebook.com", "fb.com"],
    profileUrl: (handle) => `https://www.facebook.com/${handle}`,
    placeholder: "Username or profile link",
  },
  x: {
    label: "X",
    hosts: ["x.com", "twitter.com"],
    profileUrl: (handle) => `https://x.com/${handle}`,
    handlePrefix: "@",
    placeholder: "@username or x.com link",
  },
  youtube: {
    label: "YouTube",
    hosts: ["youtube.com", "youtu.be"],
    profileUrl: (handle) => `https://www.youtube.com/@${handle}`,
    placeholder: "@handle or channel link",
  },
  tiktok: {
    label: "TikTok",
    hosts: ["tiktok.com"],
    profileUrl: (handle) => `https://www.tiktok.com/@${handle}`,
    placeholder: "@username or profile link",
  },
  linkedin: {
    label: "LinkedIn",
    hosts: ["linkedin.com"],
    profileUrl: (handle) => `https://www.linkedin.com/in/${handle}`,
    placeholder: "Profile name or profile link",
  },
  threads: {
    label: "Threads",
    hosts: ["threads.net", "threads.com"],
    profileUrl: (handle) => `https://www.threads.com/@${handle}`,
    placeholder: "@username or profile link",
  },
  website: {
    label: "Website",
    hosts: [],
    placeholder: "https://example.com",
  },
};
