import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { apiRoutes } from "@/shared/config";
import type { PublicProfile } from "../model/types";

export const profileQueries = {
  all: () => ["profiles"] as const,
  detail: (username: string) =>
    queryOptions({
      queryKey: [...profileQueries.all(), username],
      queryFn: ({ signal }) =>
        apiClient.get<PublicProfile>(apiRoutes.profile(username), { signal }),
    }),
};
