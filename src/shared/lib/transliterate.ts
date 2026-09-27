// Кириллица русского, украинского и белорусского алфавитов и латинские буквы, которые
// не раскладываются на букву и диакритику
const TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  ґ: "g",
  д: "d",
  е: "e",
  ё: "e",
  є: "ye",
  ж: "zh",
  з: "z",
  и: "i",
  і: "i",
  ї: "yi",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ў: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  æ: "ae",
  ð: "d",
  đ: "d",
  ł: "l",
  ø: "o",
  œ: "oe",
  ß: "ss",
  þ: "th",
};

/**
 * Строка в нижнем регистре латиницей без диакритики: «Анна Смирнова» → «anna smirnova»,
 * «Zoë Müller» → «zoe muller». Символы других алфавитов остаются как есть.
 */
export function transliterate(value: string): string {
  // Кириллицу заменяем до разложения: иначе «й» стала бы «и» с отдельной диакритикой
  const mapped = Array.from(
    value.normalize("NFC").toLowerCase(),
    (char) => TO_LATIN[char] ?? char,
  ).join("");
  return mapped.normalize("NFKD").replace(/\p{M}/gu, "");
}
