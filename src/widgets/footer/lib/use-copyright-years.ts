import { useSyncExternalStore } from "react";

/** Год запуска сайта: с него начинается диапазон лет в подвале. */
const START_YEAR = 2026;

const subscribe = () => () => {};
const getCurrentYear = () => new Date().getFullYear();
const getStartYear = () => START_YEAR;

/**
 * Годы для строки © в подвале: `2026`, затем `2026–2027`, `2026–2028` и так далее.
 * Страница собирается заранее, и год сборки мог устареть, поэтому сервер и гидратация
 * показывают год запуска, а текущий год браузер подставляет сразу после гидратации.
 */
export function useCopyrightYears(): string {
  const currentYear = useSyncExternalStore(subscribe, getCurrentYear, getStartYear);
  return currentYear > START_YEAR ? `${START_YEAR}–${currentYear}` : String(START_YEAR);
}
