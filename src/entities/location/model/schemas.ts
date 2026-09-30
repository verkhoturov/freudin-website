import * as z from "zod";
import { countryCodes } from "../config/countries";

export const CITY_QUERY_MAX_LENGTH = 100;

/** Код страны ISO 3166-1 из списка `countryCodes`. */
export const countryCodeSchema = z.enum(countryCodes, "Choose a country from the list");

/** Query `GET /api/cities`: страна и начало названия города. */
export const citySearchParamsSchema = z.object({
  country: countryCodeSchema,
  q: z
    .string("Enter a city name")
    .trim()
    .min(1, "Enter a city name")
    .max(CITY_QUERY_MAX_LENGTH, `Must be ${CITY_QUERY_MAX_LENGTH} characters or fewer`),
});

export type CitySearchParams = z.infer<typeof citySearchParamsSchema>;
