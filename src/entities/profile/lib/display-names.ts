const languageNames = new Intl.DisplayNames(["en"], { type: "language" });
const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });

/** Английское название языка по коду ISO 639-1: `ka` → `Georgian`. */
export function getLanguageName(code: string): string {
  return languageNames.of(code) ?? code;
}

/** Английское название валюты по коду ISO 4217: `GEL` → `Georgian Lari`. */
export function getCurrencyName(code: string): string {
  return currencyNames.of(code) ?? code;
}
