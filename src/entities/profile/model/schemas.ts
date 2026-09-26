import { z } from "zod";
import { socialLinkSchema } from "@/entities/social-link/@x/profile";
import { BIO_MAX_LENGTH, DISPLAY_NAME_MAX_LENGTH, SOCIAL_LINKS_MAX } from "../config/limits";
import { usernameSchema } from "./username";

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Укажите имя")
  .max(DISPLAY_NAME_MAX_LENGTH, `Максимум ${DISPLAY_NAME_MAX_LENGTH} символов`);

export const bioSchema = z
  .string()
  .trim()
  .max(BIO_MAX_LENGTH, `Максимум ${BIO_MAX_LENGTH} символов`);

export const socialLinksSchema = z
  .array(socialLinkSchema)
  .max(SOCIAL_LINKS_MAX, `Не больше ${SOCIAL_LINKS_MAX} ссылок`)
  .refine(
    (links) => new Set(links.map((link) => link.url)).size === links.length,
    "Ссылки не должны повторяться",
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
