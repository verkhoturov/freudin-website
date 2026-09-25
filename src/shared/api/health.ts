import { queryOptions } from "@tanstack/react-query";
import { apiRoutes } from "@/shared/config";
import { apiClient } from "./api-client";

export type HealthResponse = { status: "ok" };

export const healthQueryOptions = () =>
  queryOptions({
    queryKey: ["health"],
    queryFn: ({ signal }) => apiClient.get<HealthResponse>(apiRoutes.health, { signal }),
  });
