// Собирает миграцию со справочником городов public.cities из выгрузки GeoNames
// (https://www.geonames.org, лицензия CC BY 4.0): набор cities5000 — города от 5000 жителей
// и административные центры, без районов городов и исторических мест.
//
// Запуск: создай пустую миграцию (npx supabase migration new update_cities) и передай её путь:
//   node scripts/generate-cities-migration.mjs supabase/migrations/<файл>.sql
// Миграция добавляет новые города и обновляет известные, но не удаляет пропавшие из выгрузки:
// на них могут ссылаться профили. Нужны Node 23.6+ (импорт .ts без сборки) и unzip.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toSearchKey } from "../src/shared/lib/transliterate.ts";

const GEONAMES_URL = "https://download.geonames.org/export/dump";
const CITIES_FILE = "cities5000";
// Районы городов, исторические, заброшенные и разрушенные места, бывшие столицы
const EXCLUDED_FEATURE_CODES = new Set(["PPLX", "PPLH", "PPLQ", "PPLW", "PPLCH"]);
const ROWS_PER_INSERT = 1000;

const output = process.argv[2];
if (!output) {
  console.error(
    "Укажи файл миграции: node scripts/generate-cities-migration.mjs supabase/migrations/<файл>.sql",
  );
  process.exit(1);
}

async function download(name) {
  const response = await fetch(`${GEONAMES_URL}/${name}`);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function unzipText(zip, entry) {
  const dir = mkdtempSync(join(tmpdir(), "geonames-"));
  try {
    const path = join(dir, "data.zip");
    writeFileSync(path, zip);
    return execFileSync("unzip", ["-p", path, entry], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function parseTsv(text) {
  return text
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("\t"));
}

function sqlString(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

const [citiesZip, admin1Codes] = await Promise.all([
  download(`${CITIES_FILE}.zip`),
  download("admin1CodesASCII.txt"),
]);

// Строка admin1CodesASCII.txt: «GE.51<TAB>Tbilisi<TAB>Tbilisi<TAB>611716»
const regions = new Map(parseTsv(admin1Codes.toString("utf8")).map(([code, name]) => [code, name]));

// Колонки описаны в https://download.geonames.org/export/dump/readme.txt
const cities = parseTsv(unzipText(citiesZip, `${CITIES_FILE}.txt`))
  .filter((columns) => !EXCLUDED_FEATURE_CODES.has(columns[7]))
  .map((columns) => {
    const name = columns[1];
    const countryCode = columns[8];
    return {
      id: Number(columns[0]),
      name,
      region: regions.get(`${countryCode}.${columns[10]}`) ?? "",
      countryCode,
      population: Number(columns[14]) || 0,
      searchName: toSearchKey(name),
    };
  })
  .filter((city) => /^[A-Z]{2}$/.test(city.countryCode) && city.searchName)
  .sort((a, b) => a.id - b.id);

const statements = [];
for (let start = 0; start < cities.length; start += ROWS_PER_INSERT) {
  const values = cities
    .slice(start, start + ROWS_PER_INSERT)
    .map((city) =>
      [
        city.id,
        sqlString(city.name),
        sqlString(city.region),
        sqlString(city.countryCode),
        city.population,
        sqlString(city.searchName),
      ].join(", "),
    )
    .map((row) => `(${row})`)
    .join(",\n");
  statements.push(
    [
      "insert into public.cities (id, name, region, country_code, population, search_name) values",
      values,
      "on conflict (id) do update set",
      "  name = excluded.name,",
      "  region = excluded.region,",
      "  country_code = excluded.country_code,",
      "  population = excluded.population,",
      "  search_name = excluded.search_name;",
    ].join("\n"),
  );
}

const date = new Date().toISOString().slice(0, 10);
const header = [
  `-- Справочник городов: GeoNames ${CITIES_FILE} от ${date}, ${cities.length} городов.`,
  "-- Данные: GeoNames (https://www.geonames.org), лицензия CC BY 4.0.",
  "-- Файл собран скриптом scripts/generate-cities-migration.mjs, руками не правим.",
].join("\n");

writeFileSync(output, `${header}\n\n${statements.join("\n\n")}\n`);
console.log(`${output}: ${cities.length} городов`);
