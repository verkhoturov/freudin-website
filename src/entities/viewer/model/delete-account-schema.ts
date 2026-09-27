import { z } from "zod";

/**
 * Тело `DELETE /api/me`: username, который пользователь ввёл для подтверждения удаления.
 * У аккаунта без профиля подтверждать нечего, поле можно не передавать.
 */
export const deleteAccountInputSchema = z.object({
  username: z.string({ error: "Type your username to confirm" }).optional(),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountInputSchema>;
