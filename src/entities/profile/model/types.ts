import type { SocialLink } from "@/entities/social-link/@x/profile";

/** Публичный профиль — ответ `GET /api/profiles/[username]`. */
export type PublicProfile = {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  socialLinks: SocialLink[];
};
