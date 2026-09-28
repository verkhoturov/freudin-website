import type { City } from "../model/types";

/** Регион, если он отличает город от одноимённых: у Tbilisi регион тоже Tbilisi — не нужен. */
export function getCityRegion(city: City): string | null {
  return city.region && city.region !== city.name ? city.region : null;
}

/** Город с регионом: `Portland, Oregon`, `Tbilisi`. */
export function getCityLabel(city: City): string {
  const region = getCityRegion(city);
  return region ? `${city.name}, ${region}` : city.name;
}
