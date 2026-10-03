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

// Совпадают с CHECK-ограничениями миграции add_psychologist_details
export const EDUCATION_MAX = 5;
export const EDUCATION_TEXT_MAX_LENGTH = 150;
export const EDUCATION_YEAR_MIN = 1950;
/** Номер телефона с кодом страны и разделителями: `+995 (555) 12-34-56`. */
export const PHONE_MAX_LENGTH = 30;
/** Психологу не меньше 18 лет. */
export const MIN_AGE = 18;
export const BIRTH_DATE_MIN = "1900-01-01";
export const PRACTICE_START_MIN = "1950-01-01";

// Содержимое страницы. Совпадают с CHECK-ограничениями миграции add_page_content
export const FAQ_MAX = 10;
export const FAQ_QUESTION_MAX_LENGTH = 150;
export const FAQ_ANSWER_MAX_LENGTH = 1000;
export const SERVICES_MAX = 10;
export const SERVICE_TITLE_MAX_LENGTH = 80;
export const SERVICE_DESCRIPTION_MAX_LENGTH = 500;
/** Длительность услуги в минутах. */
export const SERVICE_DURATION_MAX = 600;

/** Адрес демо-профиля: слово зарезервировано, настоящий пользователь его не займёт. */
export const DEMO_USERNAME = "demo";
