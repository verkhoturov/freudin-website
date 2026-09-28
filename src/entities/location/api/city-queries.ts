import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { apiRoutes } from "@/shared/config";
import type { City } from "../model/types";

// Справочник меняется только миграциями: повторять одинаковый поиск незачем
const CITY_SEARCH_STALE_TIME_MS = 60 * 60 * 1000;

export const cityQueries = {
  all: () => ["cities"] as const,
  /** Поиск города в стране по началу названия. Передавай непустой `query`: иначе API ответит 400. */
  search: (country: string, query: string) =>
    queryOptions({
      queryKey: [...cityQueries.all(), country, query],
      queryFn: ({ signal }) =>
        apiClient.get<City[]>(apiRoutes.cities, { query: { country, q: query }, signal }),
      staleTime: CITY_SEARCH_STALE_TIME_MS,
    }),
};
