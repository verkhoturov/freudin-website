import { z } from "zod";
import { socialLinkSchema } from "@/entities/social-link/@x/profile";
import { BIO_MAX_LENGTH, DISPLAY_NAME_MAX_LENGTH, SOCIAL_LINKS_MAX } from "../config/limits";
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

/** Данные профиля от пользователя: общая схема формы онбординга/настроек и API. */
export const profileInputSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  bio: bioSchema,
  socialLinks: socialLinksSchema,
});

export type ProfileInput = z.input<typeof profileInputSchema>;
export type ProfileData = z.output<typeof profileInputSchema>;

/** Обновление профиля (`PATCH /api/profile`): передаются только изменённые поля. */
export const profileUpdateSchema = profileInputSchema.partial();

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;
export type ProfileUpdateData = z.output<typeof profileUpdateSchema>;

/** Тело `POST /api/profile/avatar` в JSON: скопировать фото из аккаунта провайдера входа. */
export const providerAvatarRequestSchema = z.object({ source: z.literal("provider") });

export type ProviderAvatarRequest = z.infer<typeof providerAvatarRequestSchema>;
