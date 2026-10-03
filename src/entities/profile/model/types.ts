import type { City } from "@/entities/location/@x/profile";
import type { SocialLink } from "@/entities/social-link/@x/profile";
import type { Concern } from "../config/concerns";
import type { ContactType } from "../config/contacts";
import type { ProfileCover } from "../config/cover";
import type { CtaPlacement } from "../config/cta-placement";
import type { Gender } from "../config/gender";
import type { PageTheme } from "../config/page-theme";
import type { Approach, ClientType, WorkFormat } from "../config/practice";
import type { ProfileSection } from "../config/sections";
import type { ProfileVisibility } from "../config/visibility";

/** Цена сессии «от»: целая сумма и код валюты ISO 4217. */
export type ProfilePrice = { amount: number; currency: string };

/**
 * Изображение документа психолога: диплом, сертификат. `title` — подпись и `alt`. `url` — полное
 * изображение для просмотра, `thumbnailUrl` — превью с теми же пропорциями.
 */
export type ProfileDocument = {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  width: number;
  height: number;
};

/** Образование: год окончания может быть не указан. */
export type ProfileEducation = { qualification: string; institution: string; year: number | null };

/** Вопрос и ответ психолога о своей практике. */
export type ProfileFaqItem = { question: string; answer: string };

/**
 * Карточка услуги для одной из категорий «Works with». Длительность — в минутах. `highlighted` —
 * карточка выделена на странице.
 */
export type ProfileService = {
  clientType: ClientType;
  title: string;
  description: string;
  durationMinutes: number | null;
  price: ProfilePrice | null;
  highlighted: boolean;
};

/** Заполненные контакты для связи. Telegram — ссылка `https://t.me/…`. */
export type ProfileContacts = Partial<Record<ContactType, string>>;

/**
 * Данные психолога, которые не показываются на странице: для поиска и подбора. Видны только
 * владельцу (`GET /api/me`).
 */
export type PrivateProfileDetails = {
  /** `YYYY-MM-DD`. */
  birthDate: string | null;
  gender: Gender | null;
  concerns: Concern[];
  /** Пароль скрытой страницы или `null`, если не задан. Виден только владельцу. */
  pagePassword: string | null;
};

/** Публичный профиль — ответ `GET /api/profiles/[username]`. */
export type PublicProfile = {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  socialLinks: SocialLink[];
  /** Код страны ISO 3166-1 или `null`. */
  country: string | null;
  city: City | null;
  workFormats: WorkFormat[];
  clientTypes: ClientType[];
  approaches: Approach[];
  /** Коды языков ISO 639-1. */
  languages: string[];
  price: ProfilePrice | null;
  documents: ProfileDocument[];
  /** Порядок блоков после фото и имени: полный список, без повторов. */
  sectionOrder: ProfileSection[];
  /** Дата начала практики `YYYY-MM-DD`: на странице — стаж в годах. */
  practiceStartedOn: string | null;
  education: ProfileEducation[];
  contacts: ProfileContacts;
  /**
   * Предпочтительный способ связи: тип заполненного контакта или адрес ссылки из `socialLinks`.
   * На странице — главная кнопка под именем.
   */
  preferredContact: string | null;
  faq: ProfileFaqItem[];
  services: ProfileService[];
  /** Выделенные блоки страницы. */
  highlightedSections: ProfileSection[];
  cover: ProfileCover;
  /** Пресет оформления: фон за карточкой и карточка. */
  pageTheme: PageTheme;
  /** Иконки на кнопках ссылок и главной кнопке. */
  linkIcons: boolean;
  ctaPlacement: CtaPlacement;
  /** Кто видит страницу. Скрытую гость получает только по паролю, владелец — всегда. */
  visibility: ProfileVisibility;
};

/** Ответ `GET /api/usernames/[username]`: `username` приведён к нижнему регистру. */
export type UsernameAvailability = {
  username: string;
  available: boolean;
};

/** Новое фото профиля: файл после кропа или копия фото из аккаунта провайдера входа. */
export type AvatarSource = { type: "file"; file: Blob } | { type: "provider"; provider?: string };
