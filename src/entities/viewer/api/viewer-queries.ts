import { queryOptions, useQuery } from "@tanstack/react-query";
import { ApiError, apiClient } from "@/shared/api";
import { apiRoutes } from "@/shared/config";
import type { Viewer } from "../model/types";

export const viewerQueries = {
  all: () => ["viewer"] as const,
  /** Текущий пользователь или `null` для гостя: 401 здесь — не ошибка. */
  me: () =>
    queryOptions({
      queryKey: viewerQueries.all(),
      queryFn: async ({ signal }): Promise<Viewer | null> => {
        try {
          return await apiClient.get<Viewer>(apiRoutes.me, { signal });
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) return null;
          throw error;
        }
      },
    }),
};

export function useViewerQuery() {
  return useQuery(viewerQueries.me());
}
