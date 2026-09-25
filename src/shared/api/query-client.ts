import { isServer, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-error";

const MAX_QUERY_RETRIES = 2;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        // Ошибки 4xx повтором не лечатся.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return failureCount < MAX_QUERY_RETRIES;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/** На сервере (SSR) — новый клиент на каждый запрос, в браузере — один на вкладку. */
export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
