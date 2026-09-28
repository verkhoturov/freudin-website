-- Справочник городов для поля «Город» профиля психолога. Данные — GeoNames
-- (https://www.geonames.org, лицензия CC BY 4.0), их загружает следующая миграция seed_cities,
-- которую собирает scripts/generate-cities-migration.mjs.
-- Справочник публичный: его читают все, пишут только миграции.
create table public.cities (
  -- geonameid: по нему город можно найти на geonames.org
  id integer primary key,
  -- Английское название: Tbilisi, Munich, Köln
  name text not null,
  -- Регион (admin1 GeoNames) отличает одноимённые города одной страны: Portland, Oregon
  region text not null default '',
  -- Код ISO 3166-1 alpha-2
  country_code text not null,
  population integer not null default 0,
  -- Ключ поиска по началу названия: toSearchKey из src/shared/lib/transliterate.ts
  search_name text not null,

  -- Нужен для составного внешнего ключа profiles (city_id, country): город из той же страны
  constraint cities_id_country_code_key unique (id, country_code),
  constraint cities_country_code_check check (country_code ~ '^[A-Z]{2}$'),
  constraint cities_population_check check (population >= 0)
);

comment on table public.cities is 'Справочник городов GeoNames для профилей психологов';

-- Поиск: города страны по началу ключа, самые крупные первыми
create index cities_country_code_search_name_idx
on public.cities (country_code, search_name text_pattern_ops);

alter table public.cities enable row level security;

revoke all on table public.cities from anon, authenticated;
grant select on table public.cities to anon, authenticated;

create policy "Города: чтение всем"
on public.cities for select
to anon, authenticated
using (true);
