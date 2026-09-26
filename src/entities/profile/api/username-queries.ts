import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { apiRoutes } from "@/shared/config";
import type { UsernameAvailability } from "../model/types";

export const usernameQueries = {
  all: () => ["usernames"] as const,
  /**
   * Свободен ли адрес страницы. Передавай username, уже прошедший `usernameSchema`:
   * на неверный формат и зарезервированный адрес API отвечает 400.
   * Свой текущий адрес сервер считает занятым: его форма настроек сравнивает сама.
   */
  availability: (username: string) =>
    queryOptions({
      queryKey: [...usernameQueries.all(), username],
      queryFn: ({ signal }) =>
        apiClient.get<UsernameAvailability>(apiRoutes.usernameAvailability(username), { signal }),
    }),
};
