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
  .min(USERNAME_MIN_LENGTH, `Must be at least ${USERNAME_MIN_LENGTH} characters`)
  .max(USERNAME_MAX_LENGTH, `Must be ${USERNAME_MAX_LENGTH} characters or fewer`)
  .regex(
    USERNAME_PATTERN,
    "Use letters a–z, digits, “-” and “_”; start and end with a letter or digit",
  )
  .refine((username) => !reservedUsernames.has(username), "This username is reserved");
