import * as z from "zod";
import { countryCodeSchema } from "@/entities/location/@x/profile";
import { normalizeSocialLinkUrl, socialLinkSchema } from "@/entities/social-link/@x/profile";
import { concernIds, getAvailableConcerns } from "../config/concerns";
import { isContactType } from "../config/contacts";
import { coverIds } from "../config/cover";
import { ctaPlacementIds } from "../config/cta-placement";
import { currencyCodes } from "../config/currencies";
import { genderIds } from "../config/gender";
import { languageCodes } from "../config/languages";
import {
  APPROACHES_MAX,
  BIO_MAX_LENGTH,
  BIRTH_DATE_MIN,
  CONTACT_EMAIL_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
  EDUCATION_MAX,
  EDUCATION_TEXT_MAX_LENGTH,
  EDUCATION_YEAR_MIN,
  FAQ_ANSWER_MAX_LENGTH,
  FAQ_MAX,
  FAQ_QUESTION_MAX_LENGTH,
  LANGUAGES_MAX,
  MIN_AGE,
  PHONE_MAX_LENGTH,
  PRACTICE_START_MIN,
  PRICE_AMOUNT_MAX,
  SERVICE_DESCRIPTION_MAX_LENGTH,
  SERVICE_DURATION_MAX,
  SERVICE_TITLE_MAX_LENGTH,
  SERVICES_MAX,
  SOCIAL_LINKS_MAX,
} from "../config/limits";
import { pageThemeIds } from "../config/page-theme";
import { approachIds, clientTypeIds, clientTypeLabels, workFormatIds } from "../config/practice";
import { profileSectionIds } from "../config/sections";
import {
  PAGE_PASSWORD_MAX_LENGTH,
  PAGE_PASSWORD_MIN_LENGTH,
  visibilityIds,
} from "../config/visibility";
import { usernameSchema } from "./username";

const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your name")
  .max(DISPLAY_NAME_MAX_LENGTH, `Must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer`);

const bioSchema = z
  .string()
  .trim()
  .max(BIO_MAX_LENGTH, `Must be ${BIO_MAX_LENGTH} characters or fewer`);

const socialLinksSchema = z
  .array(socialLinkSchema)
  .max(SOCIAL_LINKS_MAX, `Up to ${SOCIAL_LINKS_MAX} links`)
  .refine(
    (links) => new Set(links.map((link) => link.url)).size === links.length,
    "Links must not repeat",
  );

/**
 * Контактная почта для аккаунта без email у провайдера входа. Необязательна: пустая строка —
 * почты нет. Хранится в `account_contacts` и видна только владельцу.
 */
const contactEmailSchema = z
  .string()
  .trim()
  .max(CONTACT_EMAIL_MAX_LENGTH, `Must be ${CONTACT_EMAIL_MAX_LENGTH} characters or fewer`)
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Enter a valid email address",
  );

function hasNoRepeats(items: readonly unknown[]): boolean {
  return new Set(items).size === items.length;
}

// Порядок этих значений ничего не значит: храним их в порядке справочника и без повторов
function inListOrder<T extends string>(ids: readonly T[]) {
  return (items: T[]) => ids.filter((id) => items.includes(id));
}

/** Страна: код ISO 3166-1 или пустая строка — не указана. */
const countrySchema = z
  .string()
  .refine(
    (value) => value === "" || countryCodeSchema.safeParse(value).success,
    "Choose a country from the list",
  );

/** Город из справочника (`cities.id`), `null` — не указан. Город должен быть из `country`. */
const cityIdSchema = z.number().int().positive().nullable();

const workFormatsSchema = z
  .array(z.enum(workFormatIds, "Choose a work format from the list"))
  .transform(inListOrder(workFormatIds));

const clientTypesSchema = z
  .array(z.enum(clientTypeIds, "Choose from the list"))
  .transform(inListOrder(clientTypeIds));

/** Подходы в порядке, который выбрал психолог: первый — основной. */
const approachesSchema = z
  .array(z.enum(approachIds, "Choose an approach from the list"))
  .max(APPROACHES_MAX, `Choose up to ${APPROACHES_MAX} approaches`)
  .refine(hasNoRepeats, "Approaches must not repeat");

/** Коды языков ISO 639-1 в порядке, который выбрал психолог. */
const languagesSchema = z
  .array(z.enum(languageCodes, "Choose a language from the list"))
  .max(LANGUAGES_MAX, `Choose up to ${LANGUAGES_MAX} languages`)
  .refine(hasNoRepeats, "Languages must not repeat");

/**
 * Цена сессии «от»: целое число строкой, как в поле ввода; пустая строка — цены нет.
 * На выходе без ведущих нулей: `060` → `60`.
 */
const priceAmountSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value === "") return;
    if (!/^\d+$/.test(value)) {
      ctx.addIssue({ code: "custom", message: "Enter a whole number" });
    } else if (Number(value) < 1 || Number(value) > PRICE_AMOUNT_MAX) {
      const max = PRICE_AMOUNT_MAX.toLocaleString("en-US");
      ctx.addIssue({ code: "custom", message: `Enter a number from 1 to ${max}` });
    }
  })
  .transform((value) => (value === "" ? "" : String(Number(value))));

const currencyCodeSet = new Set(currencyCodes);

/** Валюта цены: код ISO 4217 или пустая строка. Указывается вместе с суммой. */
const priceCurrencySchema = z
  .string()
  .refine((value) => value === "" || currencyCodeSet.has(value), "Choose a currency from the list");

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/**
 * Дата `YYYY-MM-DD` по UTC `years` лет назад: так же считает БД (`current_date`). 29 февраля
 * в невисокосном году даёт строку, которая при сравнении ведёт себя как 28 февраля.
 */
function utcDateYearsAgo(years: number): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${Number(today.slice(0, 4)) - years}${today.slice(4)}`;
}

/** Дата `YYYY-MM-DD` или пустая строка — не указана. */
function optionalDateSchema(check: (value: string) => string | null) {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === "") return;
      const message = isValidIsoDate(value) ? check(value) : "Enter a valid date";
      if (message) ctx.addIssue({ code: "custom", message });
    });
}

/** Дата рождения: не показывается на странице, психологу не меньше 18 лет. */
const birthDateSchema = optionalDateSchema((value) => {
  if (value < BIRTH_DATE_MIN) return "Enter a valid date";
  return value > utcDateYearsAgo(MIN_AGE) ? `You must be at least ${MIN_AGE} years old` : null;
});

/** Дата начала практики: на странице — стаж в годах. */
const practiceStartedOnSchema = optionalDateSchema((value) => {
  if (value < PRACTICE_START_MIN) return "Enter a valid date";
  return value > utcDateYearsAgo(0) ? "The date can’t be in the future" : null;
});

/** Пол или пустая строка — не указан. На странице не показывается. */
const genderSchema = z.enum(["", ...genderIds], "Choose from the list");

/** Запросы клиентов: в порядке справочника и без повторов, на странице не показываются. */
const concernsSchema = z
  .array(z.enum(concernIds, "Choose from the list"))
  .transform(inListOrder(concernIds));

const educationTextSchema = (emptyMessage: string) =>
  z
    .string()
    .trim()
    .min(1, emptyMessage)
    .max(EDUCATION_TEXT_MAX_LENGTH, `Must be ${EDUCATION_TEXT_MAX_LENGTH} characters or fewer`);

/** Запись об образовании. Год — строкой, как в поле ввода; пустая строка — не указан. */
export const educationEntrySchema = z.object({
  qualification: educationTextSchema("Enter a degree or qualification"),
  institution: educationTextSchema("Enter a school or institution"),
  year: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === "") return;
      const maxYear = new Date().getUTCFullYear();
      if (!/^\d{4}$/.test(value) || Number(value) < EDUCATION_YEAR_MIN || Number(value) > maxYear) {
        ctx.addIssue({
          code: "custom",
          message: `Enter a year from ${EDUCATION_YEAR_MIN} to ${maxYear}`,
        });
      }
    }),
});

const educationSchema = z
  .array(educationEntrySchema)
  .max(EDUCATION_MAX, `Up to ${EDUCATION_MAX} entries`);

const PHONE_PATTERN = /^\+[\d\s().-]+$/;

/** Номер с кодом страны: `+995 555 12 34 56`. Храним как ввели, но без лишних пробелов. */
const phoneSchema = z.string().transform((input, ctx) => {
  const value = input.trim().replace(/\s+/g, " ");
  if (value === "") return "";
  const digits = value.replace(/\D/g, "").length;
  if (!PHONE_PATTERN.test(value) || value.length > PHONE_MAX_LENGTH || digits < 8 || digits > 15) {
    ctx.addIssue({ code: "custom", message: "Enter the number with the country code, like +995…" });
    return z.NEVER;
  }
  return value;
});

/**
 * Контакты для связи на странице; пустая строка — контакта нет. Telegram на выходе — ссылка
 * `https://t.me/…`, как у ссылок на соцсети.
 */
export const contactsSchema = z.object({
  email: contactEmailSchema,
  phone: phoneSchema,
  whatsapp: phoneSchema,
  telegram: z.string().transform((input, ctx) => {
    const value = input.trim();
    if (value === "") return "";
    const url = normalizeSocialLinkUrl("telegram", value);
    if (!url) {
      ctx.addIssue({ code: "custom", message: "Enter a Telegram username or t.me link" });
      return z.NEVER;
    }
    return url;
  }),
});

/**
 * Предпочтительный способ связи: тип заполненного контакта (`whatsapp`) или адрес ссылки
 * на соцсеть; пустая строка — не выбран. Согласованность с контактами и ссылками проверяет
 * `dropStalePreferredContact`.
 */
const preferredContactSchema = z.string().max(2048);

/**
 * Порядок блоков страницы после фото и имени; пустой массив — порядок по умолчанию. Форма
 * настроек отправляет полный список.
 */
const sectionOrderSchema = z
  .array(z.enum(profileSectionIds, "Choose a block from the list"))
  .max(profileSectionIds.length)
  .refine(hasNoRepeats, "Blocks must not repeat");

const maxLengthMessage = (max: number) => `Must be ${max} characters or fewer`;

/** Вопрос и ответ психолога. Ответ пишет он сам: пустой вопрос без ответа не сохраняем. */
const faqItemSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Enter a question")
    .max(FAQ_QUESTION_MAX_LENGTH, maxLengthMessage(FAQ_QUESTION_MAX_LENGTH)),
  answer: z
    .string()
    .trim()
    .min(1, "Enter an answer")
    .max(FAQ_ANSWER_MAX_LENGTH, maxLengthMessage(FAQ_ANSWER_MAX_LENGTH)),
});

const faqSchema = z.array(faqItemSchema).max(FAQ_MAX, `Up to ${FAQ_MAX} questions`);

/** Длительность в минутах строкой, как в поле ввода; пустая строка — не указана. */
const serviceDurationSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value === "") return;
    if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > SERVICE_DURATION_MAX) {
      ctx.addIssue({
        code: "custom",
        message: `Enter minutes from 1 to ${SERVICE_DURATION_MAX}`,
      });
    }
  })
  .transform((value) => (value === "" ? "" : String(Number(value))));

/**
 * Карточка услуги: для какой категории «Works with», название, описание, длительность и цена.
 * Сумма и валюта — строками, как у цены сессии, и указываются вместе.
 */
const serviceSchema = z
  .object({
    clientType: z.enum(clientTypeIds, "Choose who this service is for"),
    title: z
      .string()
      .trim()
      .min(1, "Enter a service name")
      .max(SERVICE_TITLE_MAX_LENGTH, maxLengthMessage(SERVICE_TITLE_MAX_LENGTH)),
    description: z
      .string()
      .trim()
      .max(SERVICE_DESCRIPTION_MAX_LENGTH, maxLengthMessage(SERVICE_DESCRIPTION_MAX_LENGTH)),
    durationMinutes: serviceDurationSchema,
    priceAmount: priceAmountSchema,
    priceCurrency: priceCurrencySchema,
    highlighted: z.boolean(),
  })
  .superRefine((service, ctx) => {
    if (service.priceAmount && service.priceCurrency === "") {
      ctx.addIssue({ code: "custom", path: ["priceCurrency"], message: "Choose a currency" });
    }
    if (service.priceAmount === "" && service.priceCurrency) {
      ctx.addIssue({ code: "custom", path: ["priceAmount"], message: "Enter a price" });
    }
  });

const servicesSchema = z.array(serviceSchema).max(SERVICES_MAX, `Up to ${SERVICES_MAX} services`);

/** Выделенные блоки страницы: в порядке справочника и без повторов. */
const highlightedSectionsSchema = z
  .array(z.enum(profileSectionIds, "Choose a block from the list"))
  .transform(inListOrder(profileSectionIds));

const coverSchema = z.enum(coverIds, "Choose a cover from the list");

const pageThemeSchema = z.enum(pageThemeIds, "Choose a theme from the list");

const ctaPlacementSchema = z.enum(ctaPlacementIds, "Choose where to show the contact button");

const visibilitySchema = z.enum(visibilityIds, "Choose who can see your page");

const PAGE_PASSWORD_LENGTH_MESSAGE = `Use ${PAGE_PASSWORD_MIN_LENGTH} to ${PAGE_PASSWORD_MAX_LENGTH} characters`;

/**
 * Пароль скрытой страницы; пустая строка — пароль не задан (режиму password он обязателен).
 * Пробелы не обрезаем: это часть пароля. Хранится в `profile_page_access`, виден только владельцу.
 */
const pagePasswordSchema = z
  .string()
  .refine(
    (value) =>
      value === "" ||
      (value.length >= PAGE_PASSWORD_MIN_LENGTH && value.length <= PAGE_PASSWORD_MAX_LENGTH),
    PAGE_PASSWORD_LENGTH_MESSAGE,
  );

export const profileFieldsSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  bio: bioSchema,
  socialLinks: socialLinksSchema,
  contactEmail: contactEmailSchema,
  country: countrySchema,
  cityId: cityIdSchema,
  workFormats: workFormatsSchema,
  clientTypes: clientTypesSchema,
  approaches: approachesSchema,
  languages: languagesSchema,
  priceAmount: priceAmountSchema,
  priceCurrency: priceCurrencySchema,
  sectionOrder: sectionOrderSchema,
  practiceStartedOn: practiceStartedOnSchema,
  education: educationSchema,
  contacts: contactsSchema,
  preferredContact: preferredContactSchema,
  faq: faqSchema,
  services: servicesSchema,
  highlightedSections: highlightedSectionsSchema,
  cover: coverSchema,
  pageTheme: pageThemeSchema,
  linkIcons: z.boolean(),
  ctaPlacement: ctaPlacementSchema,
  // Кто видит страницу и новый пароль: пишутся функцией set_profile_visibility
  visibility: visibilitySchema,
  pagePassword: pagePasswordSchema,
  // Не показываются на странице: хранятся в profile_private
  birthDate: birthDateSchema,
  gender: genderSchema,
  concerns: concernsSchema,
});

type ProfileFields = z.output<typeof profileFieldsSchema>;

/**
 * Поля, которые проверяются друг с другом. `PATCH /api/profile` передаёт группу целиком:
 * по одному полю не понять, согласуется ли оно с сохранёнными.
 */
export const linkedFieldGroups = [
  ["country", "cityId", "workFormats"],
  ["priceAmount", "priceCurrency"],
  ["socialLinks", "contacts", "preferredContact"],
  ["clientTypes", "concerns", "services"],
  // Режиму password нужен пароль: они проверяются вместе
  ["visibility", "pagePassword"],
] as const satisfies readonly (readonly (keyof ProfileFields)[])[];

// Правила повторяют CHECK-ограничения миграции add_psychologist_profile_fields.
// Для частичного обновления проверяются только переданные поля
function checkLinkedFields(data: Partial<ProfileFields>, ctx: z.RefinementCtx) {
  if (data.visibility === "password" && data.pagePassword === "") {
    ctx.addIssue({
      code: "custom",
      path: ["pagePassword"],
      message: "Set a password for your page",
    });
  }
  if (data.cityId != null && data.country === "") {
    ctx.addIssue({ code: "custom", path: ["cityId"], message: "Choose a country first" });
  }
  if (data.workFormats?.includes("in-person") && data.cityId === null) {
    ctx.addIssue({
      code: "custom",
      path: ["cityId"],
      message: "Choose the city where you see clients in person",
    });
  }
  if (data.priceAmount && data.priceCurrency === "") {
    ctx.addIssue({ code: "custom", path: ["priceCurrency"], message: "Choose a currency" });
  }
  if (data.priceAmount === "" && data.priceCurrency) {
    ctx.addIssue({ code: "custom", path: ["priceAmount"], message: "Enter a price" });
  }
  // Карточку не удаляем молча, когда категорию сняли в «Works with»: психолог выберет другую
  const { services, clientTypes } = data;
  if (services && clientTypes) {
    services.forEach((service, index) => {
      if (clientTypes.includes(service.clientType)) return;
      ctx.addIssue({
        code: "custom",
        path: ["services", index, "clientType"],
        message: `${clientTypeLabels[service.clientType]} isn’t selected in Works with`,
      });
    });
  }
}

function checkFieldGroups(data: Partial<ProfileFields>, ctx: z.RefinementCtx) {
  for (const group of linkedFieldGroups) {
    const missing = group.filter((key) => data[key] === undefined);
    if (missing.length === 0 || missing.length === group.length) continue;
    for (const key of missing) {
      ctx.addIssue({ code: "custom", path: [key], message: `Send ${group.join(", ")} together` });
    }
  }
}

/**
 * Способ связи, которого больше нет (контакт стёрли, ссылку удалили или изменили), сбрасываем,
 * а не считаем ошибкой: психолог увидит пустой выбор. При частичном обновлении проверяем, только
 * если группа передана.
 */
function dropStalePreferredContact<T extends Partial<ProfileFields>>(data: T): T {
  const { preferredContact, contacts, socialLinks } = data;
  if (!preferredContact || contacts === undefined || socialLinks === undefined) return data;
  const exists = isContactType(preferredContact)
    ? contacts[preferredContact] !== ""
    : socialLinks.some((link) => link.url === preferredContact);
  return exists ? data : { ...data, preferredContact: "" };
}

/** Запросы пар без «Couples» в «Works with» отбрасываем: так же, как недоступную группу в форме. */
function dropUnavailableConcerns<T extends Partial<ProfileFields>>(data: T): T {
  const { concerns, clientTypes } = data;
  if (concerns === undefined || clientTypes === undefined) return data;
  const available = getAvailableConcerns(concerns, clientTypes);
  return available.length === concerns.length ? data : { ...data, concerns: available };
}

function normalizeLinkedFields<T extends Partial<ProfileFields>>(data: T): T {
  return dropUnavailableConcerns(dropStalePreferredContact(data));
}

/** Данные профиля от пользователя: общая схема формы онбординга/настроек и API. */
export const profileInputSchema = profileFieldsSchema
  .superRefine(checkLinkedFields)
  .transform(normalizeLinkedFields);

export type ProfileInput = z.input<typeof profileInputSchema>;
export type ProfileData = z.output<typeof profileInputSchema>;

/**
 * Обновление профиля (`PATCH /api/profile`): передаются только изменённые поля, связанные
 * (`linkedFieldGroups`) — группой.
 */
export const profileUpdateSchema = profileFieldsSchema
  .partial()
  .superRefine((data, ctx) => {
    checkFieldGroups(data, ctx);
    checkLinkedFields(data, ctx);
  })
  .transform(normalizeLinkedFields);

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;
export type ProfileUpdateData = z.output<typeof profileUpdateSchema>;

/**
 * JSON-тело `POST /api/profile/avatar`: копия фото из аккаунта провайдера входа. `provider` —
 * чьё фото взять, если способов входа несколько; без него — первое найденное.
 */
export const providerAvatarRequestSchema = z.object({
  source: z.literal("provider"),
  provider: z.string().min(1).optional(),
});

export type ProviderAvatarRequest = z.infer<typeof providerAvatarRequestSchema>;

/** Пароль, который гость вводит на скрытой странице (`POST /api/profiles/[username]/access`). */
export const pageAccessInputSchema = z.object({
  password: z
    .string("Enter the password")
    .min(1, "Enter the password")
    .max(PAGE_PASSWORD_MAX_LENGTH, "Wrong password"),
});

export type PageAccessInput = z.infer<typeof pageAccessInputSchema>;

/** Подпись документа: видна под изображением и служит его `alt`. */
export const documentTitleSchema = z
  .string("Enter a caption")
  .trim()
  .min(1, "Enter a caption")
  .max(DOCUMENT_TITLE_MAX_LENGTH, `Must be ${DOCUMENT_TITLE_MAX_LENGTH} characters or fewer`);

/** Запись в jsonb-колонке `profiles.education`: год — число или `null`. */
export const storedEducationSchema = z.object({
  qualification: z.string(),
  institution: z.string(),
  year: z.number().int().nullable(),
});

/** Вопрос в jsonb-колонке `profiles.faq`. */
export const storedFaqItemSchema = z.object({ question: z.string(), answer: z.string() });

/** Карточка услуги в jsonb-колонке `profiles.services`: числа — числами, цена — объектом. */
export const storedServiceSchema = z.object({
  clientType: z.enum(clientTypeIds),
  title: z.string(),
  description: z.string(),
  durationMinutes: z.number().int().nullable(),
  price: z.object({ amount: z.number().int(), currency: z.string() }).nullable(),
  highlighted: z.boolean(),
});

/** Документ в jsonb-колонке `profiles.documents`: `width` и `height` — полного изображения. */
export const storedDocumentSchema = z.object({
  id: z.uuid(),
  path: z.string().min(1),
  thumbnailPath: z.string().min(1),
  title: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export type StoredDocument = z.infer<typeof storedDocumentSchema>;
