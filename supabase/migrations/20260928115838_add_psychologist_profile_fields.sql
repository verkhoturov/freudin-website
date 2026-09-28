-- Данные психолога в профиле (шаг 20 плана): страна и город, формат работы, с кем работает,
-- подходы, языки, цена сессии и документы. Всё необязательно и видно на публичной странице.
-- Ограничения повторяют zod-схемы из src/entities/profile. Справочники подходов и «с кем
-- работает» живут в коде, поэтому здесь проверяются только формат и количество значений.
alter table public.profiles
  -- Код страны ISO 3166-1 alpha-2
  add column country text,
  add column city_id integer,
  -- online, in-person
  add column work_formats text[] not null default '{}',
  -- individuals, couples, teens, groups
  add column client_types text[] not null default '{}',
  add column approaches text[] not null default '{}',
  -- Коды языков ISO 639-1
  add column languages text[] not null default '{}',
  -- Цена сессии «от»: целая сумма и код валюты ISO 4217
  add column price_amount integer,
  add column price_currency text,
  -- Изображения документов в bucket documents:
  -- [{ "id": "<uuid>", "path": "<user_id>/<uuid>.webp", "title": "…", "width": 1600, "height": 1200 }]
  add column documents jsonb not null default '[]'::jsonb,

  add constraint profiles_country_check check (country ~ '^[A-Z]{2}$'),
  -- Город из справочника и той же страны; без страны города нет
  add constraint profiles_city_fkey foreign key (city_id, country)
    references public.cities (id, country_code),
  add constraint profiles_city_country_check check (city_id is null or country is not null),
  add constraint profiles_work_formats_check check (
    work_formats <@ array['online', 'in-person']
    and cardinality(work_formats) <= 2
    -- Очный приём — только с городом
    and (city_id is not null or not ('in-person' = any (work_formats)))
  ),
  -- Каждый элемент массива — строка нужного формата: ищем хоть один неподходящий (или NULL).
  -- Режим strict: в lax jsonpath раскрыл бы вложенный массив {{cbt,act}}, и тот прошёл бы
  add constraint profiles_client_types_check check (
    cardinality(client_types) <= 10
    and not jsonb_path_exists(
      to_jsonb(client_types),
      'strict $[*] ? (@.type() != "string" || !(@ like_regex "^[a-z-]+$"))'
    )
  ),
  add constraint profiles_approaches_check check (
    cardinality(approaches) <= 5
    and not jsonb_path_exists(
      to_jsonb(approaches),
      'strict $[*] ? (@.type() != "string" || !(@ like_regex "^[a-z-]+$"))'
    )
  ),
  add constraint profiles_languages_check check (
    cardinality(languages) <= 5
    and not jsonb_path_exists(
      to_jsonb(languages),
      'strict $[*] ? (@.type() != "string" || !(@ like_regex "^[a-z]{2}$"))'
    )
  ),
  -- Сумма и валюта указываются только вместе. Отдельные ограничения: в одном выражении NULL
  -- у валюты дал бы NULL вместо false, и CHECK пропустил бы сумму без валюты
  add constraint profiles_price_pair_check check ((price_amount is null) = (price_currency is null)),
  add constraint profiles_price_amount_check check (price_amount between 1 and 100000000),
  add constraint profiles_price_currency_check check (price_currency ~ '^[A-Z]{3}$'),
  -- Не больше 5 документов, каждый — объект, и файл лежит в папке владельца, как avatar_path.
  -- Считаем подходящие элементы: в strict ошибка (объект без path) не должна пропустить элемент
  add constraint profiles_documents_check check (
    case
      when jsonb_typeof(documents) = 'array' then
        jsonb_array_length(documents) <= 5
        and jsonb_array_length(documents) = jsonb_array_length(jsonb_path_query_array(
          documents,
          'strict $[*] ? (@.type() == "object" && @.path.type() == "string" && @.path starts with $prefix)',
          jsonb_build_object('prefix', id::text || '/')
        ))
      else false
    end
  );

-- Гость читает новые колонки публичной страницы: список повторяет PUBLIC_PROFILE_COLUMNS
-- из src/entities/profile/api/profile.server.ts
grant select (
  country,
  city_id,
  work_formats,
  client_types,
  approaches,
  languages,
  price_amount,
  price_currency,
  documents
)
on table public.profiles to anon;

-- Индексы для поиска психологов на главной (шаг 22). Составной индекс заодно обслуживает
-- внешний ключ на cities.
create index profiles_country_city_id_idx on public.profiles (country, city_id);
create index profiles_approaches_idx on public.profiles using gin (approaches);
create index profiles_languages_idx on public.profiles using gin (languages);
