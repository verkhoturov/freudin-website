/** Значения из справочника; убранное из справочника значение пропадает. */
export function pickKnown<T extends string>(values: readonly string[], ids: readonly T[]): T[] {
  return values.filter((value): value is T => (ids as readonly string[]).includes(value));
}
