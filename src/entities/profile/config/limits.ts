export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const DISPLAY_NAME_MAX_LENGTH = 60;
export const BIO_MAX_LENGTH = 500;
export const SOCIAL_LINKS_MAX = 10;
/** Контактная почта: предел длины адреса по RFC 5321. */
export const CONTACT_EMAIL_MAX_LENGTH = 254;

// Данные психолога. Совпадают с CHECK-ограничениями миграции add_psychologist_profile_fields
export const APPROACHES_MAX = 5;
export const LANGUAGES_MAX = 5;
export const PRICE_AMOUNT_MAX = 100_000_000;
export const DOCUMENTS_MAX = 5;
export const DOCUMENT_TITLE_MAX_LENGTH = 100;

/** Адрес демо-профиля: слово зарезервировано, настоящий пользователь его не займёт. */
export const DEMO_USERNAME = "demo";
