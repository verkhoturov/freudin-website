import { z } from "zod";
import { socialPlatformIds, socialPlatforms } from "../config/platforms";
import { normalizeSocialLinkUrl } from "./normalize";

/** Ссылка на соцсеть: на входе — то, что ввёл пользователь, на выходе — нормализованный URL. */
export const socialLinkSchema = z
  .object({
    platform: z.enum(socialPlatformIds),
    url: z.string().trim().min(1, "Enter a link"),
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
    return { platform: link.platform, url };
  });

export type SocialLinkInput = z.input<typeof socialLinkSchema>;
export type SocialLink = z.output<typeof socialLinkSchema>;
