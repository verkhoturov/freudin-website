import { z } from "zod";
import { reservedUsernames } from "@/shared/config";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "../config/limits";

// Латиница в нижнем регистре, цифры, «-» и «_»; начало и конец — буква или цифра
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

/** Адрес личной страницы: `https://www.freud.in/<username>`. Регистр приводится к нижнему. */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(USERNAME_MIN_LENGTH, `Минимум ${USERNAME_MIN_LENGTH} символа`)
  .max(USERNAME_MAX_LENGTH, `Максимум ${USERNAME_MAX_LENGTH} символов`)
  .regex(
    USERNAME_PATTERN,
    "Латинские буквы, цифры, «-» и «_»; первый и последний символ — буква или цифра",
  )
  .refine((username) => !reservedUsernames.has(username), "Этот адрес занят системой");
