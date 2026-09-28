import type { City } from "@/entities/location/@x/profile";
import type { SocialLink } from "@/entities/social-link/@x/profile";
import type { Approach, ClientType, WorkFormat } from "../config/practice";
import type { ProfileSection } from "../config/sections";

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
};

/** Ответ `GET /api/usernames/[username]`: `username` приведён к нижнему регистру. */
export type UsernameAvailability = {
  username: string;
  available: boolean;
};

/** Новое фото профиля: файл после кропа или копия фото из аккаунта провайдера входа. */
export type AvatarSource = { type: "file"; file: Blob } | { type: "provider"; provider?: string };
