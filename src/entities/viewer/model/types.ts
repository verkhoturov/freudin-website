import type { ProfileSuggestions, PublicProfile } from "@/entities/profile/@x/viewer";

/** Текущий пользователь — ответ `GET /api/me`. */
export type Viewer = {
  user: {
    id: string;
    /** У Telegram email нет. */
    email: string | null;
  };
  /** `null` — профиль ещё не создан: пользователь не прошёл онбординг. */
  profile: PublicProfile | null;
  /** Подсказки для онбординга из данных провайдера входа. */
  suggestions: ProfileSuggestions;
};
