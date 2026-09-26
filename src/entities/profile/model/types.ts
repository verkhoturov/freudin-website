import type { SocialLink } from "@/entities/social-link/@x/profile";

/** Публичный профиль — ответ `GET /api/profiles/[username]`. */
export type PublicProfile = {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  socialLinks: SocialLink[];
};

/** Ответ `GET /api/usernames/[username]`: `username` приведён к нижнему регистру. */
export type UsernameAvailability = {
  username: string;
  available: boolean;
};

/** Новое фото профиля: файл после кропа или копия фото из аккаунта провайдера входа. */
export type AvatarSource = { type: "file"; file: Blob } | { type: "provider" };
