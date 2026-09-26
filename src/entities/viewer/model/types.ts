import type { ProfileSuggestions, PublicProfile } from "@/entities/profile/@x/viewer";
import type { AuthProvider } from "../config/auth-providers";

/** Текущий пользователь — ответ `GET /api/me`. */
export type Viewer = {
  user: {
    id: string;
    /** У Telegram email нет. */
    email: string | null;
    /** Способ входа; `null` — провайдер, которого приложение не знает. */
    provider: AuthProvider | null;
  };
  /** `null` — профиль ещё не создан: пользователь не прошёл онбординг. */
  profile: PublicProfile | null;
  /** Подсказки для онбординга из данных провайдера входа. */
  suggestions: ProfileSuggestions;
};
