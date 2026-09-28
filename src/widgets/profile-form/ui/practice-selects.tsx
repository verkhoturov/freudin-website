"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  CITY_QUERY_MAX_LENGTH,
  type City,
  cityQueries,
  countryCodes,
  getCityLabel,
  getCityRegion,
  getCountryName,
} from "@/entities/location";
import {
  currencyCodes,
  getCurrencyName,
  getLanguageName,
  LANGUAGES_MAX,
  languageCodes,
} from "@/entities/profile";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { Combobox, type ComboboxOption } from "@/shared/ui/combobox";

const CITY_SEARCH_DEBOUNCE_MS = 300;

function byLabel(a: ComboboxOption, b: ComboboxOption): number {
  return a.label.localeCompare(b.label, "en");
}

const countryOptions = countryCodes
  .map((code) => ({ value: code, label: getCountryName(code) }))
  .sort(byLabel);

const languageOptions = languageCodes
  .map((code) => ({ value: code, label: getLanguageName(code) }))
  .sort(byLabel);

// Код первым: его знают все, а поиск находит и по названию («dollar», «lari»)
const currencyOptions = currencyCodes.map((code) => ({
  value: code,
  label: `${code} · ${getCurrencyName(code)}`,
}));

type SelectProps = {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  className?: string;
};

type CountrySelectProps = SelectProps & {
  /** Код страны или пустая строка. */
  value: string;
  onChange: (code: string) => void;
};

export function CountrySelect({ value, onChange, ...props }: CountrySelectProps) {
  return (
    <Combobox
      {...props}
      valueLabel={value ? getCountryName(value) : null}
      placeholder="Choose a country"
      options={countryOptions}
      isSelected={(code) => code === value}
      onSelect={onChange}
      searchPlaceholder="Search countries…"
      emptyText="No countries found"
      onClear={() => onChange("")}
      clearLabel="Clear country"
    />
  );
}

type CitySelectProps = SelectProps & {
  /** Код страны: города ищем только в ней. Пустая строка — список неактивен. */
  country: string;
  value: City | null;
  onChange: (city: City | null) => void;
};

/** Город из справочника: поиск на сервере по началу названия. */
export function CitySelect({ country, value, onChange, ...props }: CitySelectProps) {
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(
    query.trim().slice(0, CITY_QUERY_MAX_LENGTH),
    CITY_SEARCH_DEBOUNCE_MS,
  );
  const cities = useQuery({
    ...cityQueries.search(country, search),
    enabled: Boolean(country && search),
  });
  const results = cities.data ?? [];

  let emptyText = "No cities found";
  if (!query.trim()) emptyText = "Start typing the city name";
  else if (query.trim() !== search || cities.isFetching) emptyText = "Searching…";
  else if (cities.isError) emptyText = "Couldn’t load cities. Please try again.";

  return (
    <Combobox
      {...props}
      valueLabel={value ? getCityLabel(value) : null}
      placeholder={country ? "Choose a city" : "Choose a country first"}
      options={results.map((city) => ({
        value: String(city.id),
        label: city.name,
        hint: getCityRegion(city) ?? undefined,
      }))}
      isSelected={(id) => id === String(value?.id)}
      onSelect={(id) => {
        const city = results.find((result) => String(result.id) === id);
        if (city) onChange(city);
      }}
      searchPlaceholder="Search cities…"
      emptyText={emptyText}
      search={{ value: query, onValueChange: setQuery }}
      onClear={() => onChange(null)}
      clearLabel="Clear city"
      disabled={!country}
    />
  );
}

type LanguagesSelectProps = SelectProps & {
  /** Коды языков в порядке выбора. */
  value: string[];
  onChange: (codes: string[]) => void;
};

export function LanguagesSelect({ value, onChange, ...props }: LanguagesSelectProps) {
  const isFull = value.length >= LANGUAGES_MAX;
  return (
    <Combobox
      {...props}
      multiple
      valueLabel={value.length > 0 ? value.map(getLanguageName).join(", ") : null}
      placeholder="Choose languages"
      options={languageOptions.map((option) => ({
        ...option,
        disabled: isFull && !value.includes(option.value),
      }))}
      isSelected={(code) => value.includes(code)}
      onSelect={(code) =>
        onChange(value.includes(code) ? value.filter((item) => item !== code) : [...value, code])
      }
      searchPlaceholder="Search languages…"
      emptyText="No languages found"
      onClear={() => onChange([])}
      clearLabel="Clear languages"
    />
  );
}

type CurrencySelectProps = SelectProps & {
  /** Код валюты или пустая строка. */
  value: string;
  onChange: (code: string) => void;
};

export function CurrencySelect({ value, onChange, ...props }: CurrencySelectProps) {
  return (
    <Combobox
      {...props}
      valueLabel={value || null}
      placeholder="Currency"
      options={currencyOptions}
      isSelected={(code) => code === value}
      onSelect={onChange}
      searchPlaceholder="Search currencies…"
      emptyText="No currencies found"
      onClear={() => onChange("")}
      clearLabel="Clear currency"
    />
  );
}
