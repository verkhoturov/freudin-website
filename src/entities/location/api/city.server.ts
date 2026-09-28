import "server-only";
import type { SupabaseClient } from "@/shared/api/index.server";
import { toSearchKey } from "@/shared/lib/transliterate";
import { CITY_COLUMNS, toCity } from "../lib/to-city";
import type { City } from "../model/types";

const CITY_SEARCH_LIMIT = 10;

/**
 * Города страны, название которых начинается с `query`, крупные первыми. Регистр, диакритика
 * и апострофы не важны: `zurich` находит Zürich, `тбилиси` — Tbilisi.
 */
export async function searchCities(
  supabase: SupabaseClient,
  country: string,
  query: string,
): Promise<City[]> {
  // В ключе только буквы, цифры и пробелы, поэтому символы шаблона LIKE экранировать не нужно
  const key = toSearchKey(query);
  if (!key) return [];

  const { data, error } = await supabase
    .from("cities")
    .select(CITY_COLUMNS)
    .eq("country_code", country)
    .like("search_name", `${key}%`)
    .order("population", { ascending: false })
    .limit(CITY_SEARCH_LIMIT);

  if (error) throw error;
  return data.map(toCity);
}
