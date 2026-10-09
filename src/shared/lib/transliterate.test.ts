import { describe, expect, it } from "vitest";
import { toSearchKey, transliterate } from "./transliterate";

describe("transliterate", () => {
  it.each([
    ["Анна Смирнова", "anna smirnova"],
    ["Йошкар-Ола", "yoshkar-ola"],
    ["Щука, Юля и Ёж", "shchuka, yulya i ezh"],
    ["Їжак Ґудзик Єва", "yizhak gudzik yeva"],
    ["Zoë Müller", "zoe muller"],
    ["Łódź Straße Øresund", "lodz strasse oresund"],
    ["თბილისი", "თბილისი"],
  ])("%s → %s", (value, expected) => {
    expect(transliterate(value)).toBe(expected);
  });
});

describe("toSearchKey", () => {
  it.each([
    ["Ts’khinvali", "tskhinvali"],
    ["Тбилиси", "tbilisi"],
    ["Winston-Salem", "winston salem"],
    ["  Zürich  ", "zurich"],
    ["L'Aquila", "laquila"],
    ["St. Petersburg", "st petersburg"],
  ])("%s → %s", (value, expected) => {
    expect(toSearchKey(value)).toBe(expected);
  });
});
