import type { ProfilePrice } from "../model/types";

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

/** Цена сессии без копеек: `60 USD` → `$60`, `150 GEL` → `GEL 150`. */
export function formatPrice({ amount, currency }: ProfilePrice): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Стаж по дате начала практики `YYYY-MM-DD`: `Less than a year`, `1 year`, `8 years`. */
export function formatExperience(startedOn: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const years =
    Number(today.slice(0, 4)) -
    Number(startedOn.slice(0, 4)) -
    (today.slice(5) < startedOn.slice(5) ? 1 : 0);
  if (years < 1) return "Less than a year";
  return years === 1 ? "1 year" : `${years} years`;
}
