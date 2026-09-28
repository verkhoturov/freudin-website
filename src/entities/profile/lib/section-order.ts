import { type ProfileSection, profileSectionIds } from "../config/sections";

/**
 * Полный порядок блоков из сохранённого: неизвестные и повторы отбрасываем, недостающие
 * (порядок не задан или блок появился позже) добавляем в конец в порядке по умолчанию.
 */
export function normalizeSectionOrder(order: readonly string[]): ProfileSection[] {
  const known = profileSectionIds.filter((id) => order.includes(id));
  known.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return [...known, ...profileSectionIds.filter((id) => !known.includes(id))];
}
