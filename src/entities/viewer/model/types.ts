import type {
  PrivateProfileDetails,
  ProfileSuggestions,
  PublicProfile,
} from "@/entities/profile/@x/viewer";
import type { AuthProvider } from "../config/auth-providers";

/** Способ входа, привязанный к аккаунту. */
export type SignInMethod = {
  provider: AuthProvider;
  /** Как показать аккаунт провайдера: email или `@username`; `null` — провайдер их не дал. */
  accountLabel: string | null;
  /** Фото из аккаунта провайдера (https) для «Use account photo». */
  avatarUrl: string | null;
};

/** Ответ `POST /api/auth/identities`: адрес провайдера, куда уходит браузер для привязки. */
export type IdentityLinkStart = { url: string };

/** Текущий пользователь — ответ `GET /api/me`. */
export type Viewer = {
  user: {
    id: string;
    /** Email от провайдера входа. У Telegram и части аккаунтов Facebook его нет. */
    email: string | null;
    /**
     * Контактная почта, которую пользователь указал сам, если у провайдера email нет.
     * Не подтверждается и не используется для входа.
     */
    contactEmail: string | null;
    /**
     * Привязанные способы входа, от первого к последнему. Провайдеров, которых приложение
     * не знает, здесь нет.
     */
    signInMethods: SignInMethod[];
  };
  /** `null` — профиль ещё не создан: пользователь не прошёл онбординг. */
  profile: PublicProfile | null;
  /** Данные психолога, которые не показываются на странице: дата рождения, пол, запросы. */
  privateDetails: PrivateProfileDetails;
  /** Подсказки для онбординга из данных провайдера входа. */
  suggestions: ProfileSuggestions;
};
