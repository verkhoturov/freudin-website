import { siteConfig } from "@/shared/config";
import type { PublicProfile } from "../model/types";
import { DEMO_USERNAME } from "./limits";

/** Демо-профиль для ссылки «Пример страницы»: отдаётся без базы данных. */
export const demoProfile: PublicProfile = {
  username: DEMO_USERNAME,
  displayName: "Демо-профиль",
  bio: "Так выглядит личная страница: фото, имя, описание и ссылки на соцсети.",
  avatarUrl: null,
  socialLinks: [
    { platform: "telegram", url: "https://t.me/telegram" },
    { platform: "instagram", url: "https://www.instagram.com/instagram" },
    { platform: "website", url: `${siteConfig.url}/` },
  ],
};
