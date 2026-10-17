import { siteConfig } from "@/shared/config";
import type { PublicProfile } from "../model/types";
import { DEMO_USERNAME } from "./limits";
import { profileSectionIds } from "./sections";

/**
 * Демо-профиль для ссылки «Пример страницы»: отдаётся без базы данных. Психолог вымышленный
 * (шаг 95): на странице есть пометка о примере, контакты никуда не ведут.
 */
export const demoProfile: PublicProfile = {
  username: DEMO_USERNAME,
  displayName: "Maria Example",
  professionalRole: "Clinical psychologist",
  bio: "I help adults and couples with anxiety, burnout, and relationship difficulties. In our first sessions we look at what brings you here and agree on goals. I combine CBT and ACT and give you practical tools to use between sessions. I work online and in person in Tbilisi, in English and Russian.",
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
  currency: "USD",
  price: { amount: 60, currency: "USD" },
  priceType: "from",
  acceptingClients: "accepting",
  inPersonArea: "Vake, near Vake Park",
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
    {
      qualification: "Cognitive behavioral therapy, 2-year program",
      institution: "Sample Institute",
      year: 2018,
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
      description: "For anxiety, stress, and life changes.",
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
    {
      clientType: "individuals",
      title: "Introductory call",
      description: "A short call to see whether we’re a good fit.",
      durationMinutes: 20,
      price: null,
      highlighted: false,
    },
  ],
  highlightedSections: ["bio"],
  cover: "classic",
  pageTheme: "classic",
  linkIcons: true,
  ctaPlacement: "inline",
  visibility: "public",
};
