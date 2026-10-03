import * as z from "zod";
import { socialPlatformIds, socialPlatforms } from "../config/platforms";
import { normalizeSocialLinkUrl } from "./normalize";

/** Свой заголовок ссылки: кнопка на странице в одну строку. */
export const SOCIAL_LINK_TITLE_MAX_LENGTH = 40;

/**
 * Ссылка на соцсеть: на входе — то, что ввёл пользователь, на выходе — нормализованный URL.
 * `title` — свой заголовок кнопки; пустая строка — подпись по платформе и адресу.
 * `highlighted` — кнопка выделена на странице.
 */
export const socialLinkSchema = z
  .object({
    platform: z.enum(socialPlatformIds),
    url: z.string().trim().min(1, "Enter a link"),
    // Ссылки, сохранённые до появления заголовков, приходят без него
    title: z
      .string()
      .trim()
      .max(
        SOCIAL_LINK_TITLE_MAX_LENGTH,
        `Must be ${SOCIAL_LINK_TITLE_MAX_LENGTH} characters or fewer`,
      )
      .default(""),
    highlighted: z.boolean().default(false),
  })
  .transform((link, ctx) => {
    const url = normalizeSocialLinkUrl(link.platform, link.url);
    if (!url) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: `This doesn’t look like a ${socialPlatforms[link.platform].label} link`,
      });
      return z.NEVER;
    }
    return { platform: link.platform, url, title: link.title, highlighted: link.highlighted };
  });

export type SocialLinkInput = z.input<typeof socialLinkSchema>;
export type SocialLink = z.output<typeof socialLinkSchema>;
