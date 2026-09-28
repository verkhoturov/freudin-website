import type { City } from "../model/types";

/** Колонки `cities`, из которых собирается `City`: для поиска и для города в профиле. */
export const CITY_COLUMNS = "id, name, region, country_code";

export type CityRow = { id: number; name: string; region: string; country_code: string };

export function toCity(row: CityRow): City {
  return { id: row.id, name: row.name, region: row.region, countryCode: row.country_code };
}
