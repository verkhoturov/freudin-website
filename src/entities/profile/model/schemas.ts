import { z } from "zod";
import { countryCodeSchema } from "@/entities/location/@x/profile";
import { socialLinkSchema } from "@/entities/social-link/@x/profile";
import { currencyCodes } from "../config/currencies";
import { languageCodes } from "../config/languages";
import {
  APPROACHES_MAX,
  BIO_MAX_LENGTH,
  CONTACT_EMAIL_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
  LANGUAGES_MAX,
  PRICE_AMOUNT_MAX,
  SOCIAL_LINKS_MAX,
} from "../config/limits";
import { approachIds, clientTypeIds, workFormatIds } from "../config/practice";
import { profileSectionIds } from "../config/sections";
import { usernameSchema } from "./username";

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your name")
  .max(DISPLAY_NAME_MAX_LENGTH, `Must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer`);

export const bioSchema = z
  .string()
  .trim()
  .max(BIO_MAX_LENGTH, `Must be ${BIO_MAX_LENGTH} characters or fewer`);

export const socialLinksSchema = z
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
export const contactEmailSchema = z
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
export const countrySchema = z
  .string()
  .refine(
    (value) => value === "" || countryCodeSchema.safeParse(value).success,
    "Choose a country from the list",
  );

/** Город из справочника (`cities.id`), `null` — не указан. Город должен быть из `country`. */
export const cityIdSchema = z.number().int().positive().nullable();

export const workFormatsSchema = z
  .array(z.enum(workFormatIds, "Choose a work format from the list"))
  .transform(inListOrder(workFormatIds));

export const clientTypesSchema = z
  .array(z.enum(clientTypeIds, "Choose from the list"))
  .transform(inListOrder(clientTypeIds));

/** Подходы в порядке, который выбрал психолог: первый — основной. */
export const approachesSchema = z
  .array(z.enum(approachIds, "Choose an approach from the list"))
  .max(APPROACHES_MAX, `Choose up to ${APPROACHES_MAX} approaches`)
  .refine(hasNoRepeats, "Approaches must not repeat");

/** Коды языков ISO 639-1 в порядке, который выбрал психолог. */
export const languagesSchema = z
  .array(z.enum(languageCodes, "Choose a language from the list"))
  .max(LANGUAGES_MAX, `Choose up to ${LANGUAGES_MAX} languages`)
  .refine(hasNoRepeats, "Languages must not repeat");

/**
 * Цена сессии «от»: целое число строкой, как в поле ввода; пустая строка — цены нет.
 * На выходе без ведущих нулей: `060` → `60`.
 */
export const priceAmountSchema = z
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
export const priceCurrencySchema = z
  .string()
  .refine((value) => value === "" || currencyCodeSet.has(value), "Choose a currency from the list");

/**
 * Порядок блоков страницы после фото и имени; пустой массив — порядок по умолчанию. Форма
 * настроек отправляет полный список.
 */
export const sectionOrderSchema = z
  .array(z.enum(profileSectionIds, "Choose a block from the list"))
  .max(profileSectionIds.length)
  .refine(hasNoRepeats, "Blocks must not repeat");

const profileFieldsSchema = z.object({
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
});

type ProfileFields = z.output<typeof profileFieldsSchema>;

/**
 * Поля, которые проверяются друг с другом. `PATCH /api/profile` передаёт группу целиком:
 * по одному полю не понять, согласуется ли оно с сохранёнными.
 */
const linkedFieldGroups: (keyof ProfileFields)[][] = [
  ["country", "cityId", "workFormats"],
  ["priceAmount", "priceCurrency"],
];

// Правила повторяют CHECK-ограничения миграции add_psychologist_profile_fields.
// Для частичного обновления проверяются только переданные поля
function checkLinkedFields(data: Partial<ProfileFields>, ctx: z.RefinementCtx) {
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

/** Данные профиля от пользователя: общая схема формы онбординга/настроек и API. */
export const profileInputSchema = profileFieldsSchema.superRefine(checkLinkedFields);

export type ProfileInput = z.input<typeof profileInputSchema>;
export type ProfileData = z.output<typeof profileInputSchema>;

/**
 * Обновление профиля (`PATCH /api/profile`): передаются только изменённые поля, связанные
 * (`linkedFieldGroups`) — группой.
 */
export const profileUpdateSchema = profileFieldsSchema.partial().superRefine((data, ctx) => {
  checkFieldGroups(data, ctx);
  checkLinkedFields(data, ctx);
});

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

/** Подпись документа: видна под изображением и служит его `alt`. */
export const documentTitleSchema = z
  .string("Enter a caption")
  .trim()
  .min(1, "Enter a caption")
  .max(DOCUMENT_TITLE_MAX_LENGTH, `Must be ${DOCUMENT_TITLE_MAX_LENGTH} characters or fewer`);

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
