import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let serverEnv: ServerEnv | undefined;

/**
 * Серверные переменные окружения. Проверяются при первом обращении, а не при импорте:
 * так `next build` проходит без секретов, а ошибка конфигурации видна в первом же запросе.
 */
export function getServerEnv(): ServerEnv {
  if (!serverEnv) {
    const result = serverEnvSchema.safeParse(process.env);
    if (!result.success) {
      throw new Error(`Некорректные переменные окружения:\n${z.prettifyError(result.error)}`);
    }
    serverEnv = result.data;
  }
  return serverEnv;
}
