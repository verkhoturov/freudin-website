import { z } from "zod";

/** Тело `DELETE /api/me`: username, который пользователь ввёл для подтверждения удаления. */
export const deleteAccountInputSchema = z.object({
  username: z.string({ error: "Type your username to confirm" }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountInputSchema>;
