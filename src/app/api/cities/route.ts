import { jsonOk, parseSearchParams, withErrorHandling } from "@/app/api/_lib";
import { type City, citySearchParamsSchema, searchCities } from "@/entities/location/index.server";
import { createSupabasePublicClient } from "@/shared/api/index.server";

// Справочник меняется только миграциями, поэтому ответ можно кешировать и браузеру, и CDN
const CACHE_HEADERS = { "Cache-Control": "public, max-age=3600, s-maxage=86400" };

/** Поиск города в стране по началу названия: до 10 городов, крупные первыми. */
export const GET = withErrorHandling(async (request) => {
  const { country, q } = parseSearchParams(request, citySearchParamsSchema);
  const cities = await searchCities(createSupabasePublicClient(), country, q);
  return jsonOk<City[]>(cities, { headers: CACHE_HEADERS });
});
