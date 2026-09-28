import { siteConfig } from "@/shared/config";
import type { PublicProfile } from "../model/types";
import { DEMO_USERNAME } from "./limits";
import { profileSectionIds } from "./sections";

/** Демо-профиль для ссылки «Пример страницы»: отдаётся без базы данных. */
export const demoProfile: PublicProfile = {
  username: DEMO_USERNAME,
  displayName: "Demo profile",
  bio: "This is what a psychologist’s page looks like: a photo, name, bio, practice details, links, and documents.",
  avatarUrl: null,
  socialLinks: [
    { platform: "telegram", url: "https://t.me/telegram" },
    { platform: "instagram", url: "https://www.instagram.com/instagram" },
    { platform: "website", url: `${siteConfig.url}/` },
  ],
  country: "GE",
  city: { id: 611717, name: "Tbilisi", region: "Tbilisi", countryCode: "GE" },
  workFormats: ["online", "in-person"],
  clientTypes: ["individuals", "couples"],
  approaches: ["cbt", "act", "schema"],
  languages: ["en", "ru", "ka"],
  price: { amount: 60, currency: "USD" },
  // Файл лежит в public: у демо-профиля нет записи в Storage
  documents: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      url: "/demo-certificate.svg",
      thumbnailUrl: "/demo-certificate.svg",
      title: "Sample certificate",
      width: 1400,
      height: 1000,
    },
  ],
  sectionOrder: [...profileSectionIds],
};
