import { siteConfig } from "@/shared/config";
import type { PublicProfile } from "../model/types";
import { DEMO_USERNAME } from "./limits";

/** Демо-профиль для ссылки «Пример страницы»: отдаётся без базы данных. */
export const demoProfile: PublicProfile = {
  username: DEMO_USERNAME,
  displayName: "Demo profile",
  bio: "This is what a personal page looks like: a photo, name, bio, and social links.",
  avatarUrl: null,
  socialLinks: [
    { platform: "telegram", url: "https://t.me/telegram" },
    { platform: "instagram", url: "https://www.instagram.com/instagram" },
    { platform: "website", url: `${siteConfig.url}/` },
  ],
};
