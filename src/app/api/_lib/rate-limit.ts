import { createHmac } from "node:crypto";
import { createSupabaseAdminClient } from "@/shared/api/index.server";
import { getServerEnv } from "@/shared/config/index.server";
import { HttpError } from "./http-error";

export type RateLimitRule = {
  /** Что ограничиваем: часть ключа счётчика. */
  scope: string;
  /** По чему считаем: IP клиента, адрес страницы или их сочетание. */
  subject: string;
  limit: number;
  windowSeconds: number;
};

/** IP клиента. На Vercel `x-forwarded-for` выставляет платформа: клиент его не подделает. */
export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function formatWait(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

/**
 * Засчитывает запрос по каждому правилу. Превышен любой лимит — 429 с `Retry-After`; `field` —
 * у какого поля формы показать ошибку. Счётчики в базе (`consume_rate_limit`) общие для всех
 * экземпляров сервера; функция доступна только служебной роли.
 */
export async function enforceRateLimits(rules: RateLimitRule[], field?: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { SUPABASE_SECRET_KEY } = getServerEnv();
  const waits = await Promise.all(
    rules.map(async ({ scope, subject, limit, windowSeconds }) => {
      // В базу попадает HMAC, а не сам IP или адрес
      const hash = createHmac("sha256", SUPABASE_SECRET_KEY).update(subject).digest("base64url");
      const { data, error } = await admin.rpc("consume_rate_limit", {
        p_key: `${scope}:${hash}`,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });
      if (error) throw error;
      return data;
    }),
  );

  const retryAfter = Math.max(0, ...waits);
  if (retryAfter === 0) return;
  const message = `Too many attempts. Try again in ${formatWait(retryAfter)}.`;
  throw new HttpError(429, "too_many_requests", message, field ? { [field]: message } : undefined, {
    "Retry-After": String(retryAfter),
  });
}
