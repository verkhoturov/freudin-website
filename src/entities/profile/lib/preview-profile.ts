import type * as z from "zod";
import type { City } from "@/entities/location/@x/profile";
import { socialLinkSchema } from "@/entities/social-link/@x/profile";
import { contactTypeIds, isContactType } from "../config/contacts";
import { educationEntrySchema, type ProfileInput, profileFieldsSchema } from "../model/schemas";
import type { ProfileContacts, PublicProfile } from "../model/types";
import { normalizeSectionOrder } from "./section-order";
import { toProfileService } from "./services";

const fields = profileFieldsSchema.shape;

function parseOr<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const result = schema.safeParse(value);
  return result.success ? result.data : fallback;
}

type PreviewExtras = {
  /** Фото, выбранное в форме. */
  avatarUrl: string | null;
  /** Город для `cityId` формы: в значениях формы только id. */
  city: City | null;
};

/**
 * Публичная страница из несохранённых значений формы: превью в онбординге и настройках.
 * Каждое поле проверяется отдельно, и неверно введённое не попадает в превью, как не попало бы
 * на страницу. Закрытых данных (дата рождения, пол, запросы, контактная почта) в результате нет.
 * Документы сохраняются отдельно от формы, поэтому список пустой: его подставляет страница.
 */
export function toPreviewProfile(input: ProfileInput, extras: PreviewExtras): PublicProfile {
  const socialLinks = input.socialLinks.flatMap((link) => {
    const result = socialLinkSchema.safeParse(link);
    return result.success ? [result.data] : [];
  });

  const contacts: ProfileContacts = {};
  for (const type of contactTypeIds) {
    const value = parseOr(fields.contacts.shape[type], input.contacts[type], "");
    if (value) contacts[type] = value;
  }

  const country = parseOr(fields.country, input.country, "");
  const priceAmount = parseOr(fields.priceAmount, input.priceAmount, "");
  const priceCurrency = parseOr(fields.priceCurrency, input.priceCurrency, "");
  const { preferredContact } = input;
  const clientTypes = parseOr(fields.clientTypes, input.clientTypes, []);
  const hasPreferredContact = isContactType(preferredContact)
    ? Boolean(contacts[preferredContact])
    : socialLinks.some((link) => link.url === preferredContact);

  return {
    username: input.username.trim().toLowerCase(),
    displayName: input.displayName.trim(),
    bio: input.bio.trim(),
    avatarUrl: extras.avatarUrl,
    socialLinks,
    country: country || null,
    city: country && extras.city?.id === input.cityId ? extras.city : null,
    workFormats: parseOr(fields.workFormats, input.workFormats, []),
    clientTypes,
    approaches: parseOr(fields.approaches, input.approaches, []),
    languages: parseOr(fields.languages, input.languages, []),
    price:
      priceAmount && priceCurrency
        ? { amount: Number(priceAmount), currency: priceCurrency }
        : null,
    documents: [],
    sectionOrder: normalizeSectionOrder(input.sectionOrder),
    practiceStartedOn: parseOr(fields.practiceStartedOn, input.practiceStartedOn, "") || null,
    education: input.education.flatMap((entry) => {
      const result = educationEntrySchema.safeParse(entry);
      if (!result.success) return [];
      const { qualification, institution, year } = result.data;
      return [{ qualification, institution, year: year ? Number(year) : null }];
    }),
    contacts,
    preferredContact: hasPreferredContact ? preferredContact : null,
    faq: input.faq.flatMap((item) => {
      const result = fields.faq.element.safeParse(item);
      return result.success ? [result.data] : [];
    }),
    // Карточку для снятой в «Works with» категории, как и на странице, не показываем
    services: input.services.flatMap((service) => {
      const result = fields.services.element.safeParse(service);
      return result.success && clientTypes.includes(result.data.clientType)
        ? [toProfileService(result.data)]
        : [];
    }),
    highlightedSections: parseOr(fields.highlightedSections, input.highlightedSections, []),
    cover: parseOr(fields.cover, input.cover, "classic"),
    visibility: parseOr(fields.visibility, input.visibility, "public"),
  };
}
