import { siteConfig } from "@/shared/config";
import type { PublicProfile } from "../model/types";
import { DEMO_USERNAME } from "./limits";
import { profileSectionIds } from "./sections";

/** Демо-профиль для ссылки «Пример страницы»: отдаётся без базы данных. */
export const demoProfile: PublicProfile = {
  username: DEMO_USERNAME,
  displayName: "Demo profile",
  bio: "This is what a psychologist’s page looks like: a photo, name, bio, practice details, education, contacts, links, and documents.",
  avatarUrl: null,
  socialLinks: [
    { platform: "telegram", url: "https://t.me/telegram", title: "", highlighted: false },
    {
      platform: "instagram",
      url: "https://www.instagram.com/instagram",
      title: "",
      highlighted: false,
    },
    // Свой заголовок ссылки вместо адреса сайта, кнопка выделена
    { platform: "website", url: `${siteConfig.url}/`, title: "About Freudin", highlighted: true },
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
  practiceStartedOn: "2016-09-01",
  education: [
    {
      qualification: "MA in Clinical Psychology",
      institution: "Sample University",
      year: 2015,
    },
  ],
  // Адрес из зарезервированного домена example.com: письмо никому не уйдёт
  contacts: { email: "hello@example.com", telegram: "https://t.me/telegram" },
  preferredContact: "telegram",
  faq: [
    {
      question: "What happens in the first session?",
      answer:
        "We talk about what brings you here and what you’d like to change, and agree on how we’ll work together.",
    },
    {
      question: "Do you work online?",
      answer: "Yes. Online sessions take place over video, and in-person sessions are in Tbilisi.",
    },
  ],
  services: [
    {
      clientType: "individuals",
      title: "Individual session",
      description: "",
      durationMinutes: 50,
      price: { amount: 60, currency: "USD" },
      highlighted: false,
    },
    {
      clientType: "couples",
      title: "Couples session",
      description: "For partners who want to understand each other better.",
      durationMinutes: 80,
      price: { amount: 90, currency: "USD" },
      highlighted: true,
    },
  ],
  highlightedSections: ["bio"],
  cover: "classic",
  visibility: "public",
};
