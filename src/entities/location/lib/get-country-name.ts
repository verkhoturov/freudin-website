const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** Английское название страны по коду ISO 3166-1: `GE` → `Georgia`. */
export function getCountryName(code: string): string {
  return regionNames.of(code) ?? code;
}
