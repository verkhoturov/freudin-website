import {
  enforceRateLimits,
  getClientIp,
  HttpError,
  jsonOk,
  withErrorHandling,
} from "@/app/api/_lib";
import {
  isUsernameAvailable,
  type UsernameAvailability,
  usernameSchema,
} from "@/entities/profile/index.server";
import { createSupabasePublicClient } from "@/shared/api/index.server";

/**
 * Свободен ли адрес страницы. Неверный формат и зарезервированный адрес — 400. Ответ выдаёт
 * и скрытые адреса, поэтому перебор ограничен (шаг 67.4): 60 запросов с IP за 10 минут, дальше — 429.
 */
export const GET = withErrorHandling(
  async (request, { params }: RouteContext<"/api/usernames/[username]">) => {
    await enforceRateLimits(
      [{ scope: "username-check", subject: getClientIp(request), limit: 60, windowSeconds: 600 }],
      "username",
    );
    const result = usernameSchema.safeParse((await params).username);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid username.";
      throw new HttpError(400, "validation_error", message, { username: message });
    }

    const username = result.data;
    const available = await isUsernameAvailable(createSupabasePublicClient(), username);
    return jsonOk<UsernameAvailability>({ username, available });
  },
);
