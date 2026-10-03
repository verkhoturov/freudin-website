import { HttpError, parseJsonBody, withErrorHandling } from "@/app/api/_lib";
import {
  pageAccessInputSchema,
  setPageAccessCookie,
  unlockProfilePage,
} from "@/entities/profile/index.server";
import { createSupabasePublicClient } from "@/shared/api/index.server";

const WRONG_PASSWORD_MESSAGE = "Wrong password";

/**
 * Пароль скрытой страницы: верный — cookie доступа на 30 дней и 204, неверный или страница
 * не защищена паролем — 400. Защиты от перебора нет: это мягкий замок (решение пользователя).
 */
export const POST = withErrorHandling(
  async (request, { params }: RouteContext<"/api/profiles/[username]/access">) => {
    const username = (await params).username.trim().toLowerCase();
    const { password } = await parseJsonBody(request, pageAccessInputSchema);
    const token = await unlockProfilePage(createSupabasePublicClient(), username, password);

    if (!token) {
      throw new HttpError(400, "validation_error", `${WRONG_PASSWORD_MESSAGE}.`, {
        password: WRONG_PASSWORD_MESSAGE,
      });
    }
    await setPageAccessCookie(username, token);
    return new Response(null, { status: 204 });
  },
);
