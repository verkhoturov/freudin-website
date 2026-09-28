-- Порядок блоков личной страницы после фото и имени (шаг 28 плана): bio, links, approaches,
-- client-types, work-formats, location, languages, price, documents. Пустой массив — порядок
-- по умолчанию. Справочник блоков живёт в коде (profileSectionIds), поэтому здесь, как
-- у client_types, проверяются только формат значений и их количество (с запасом на новые блоки).
alter table public.profiles
  add column section_order text[] not null default '{}',
  add constraint profiles_section_order_check check (
    cardinality(section_order) <= 20
    and not jsonb_path_exists(
      to_jsonb(section_order),
      'strict $[*] ? (@.type() != "string" || !(@ like_regex "^[a-z-]+$"))'
    )
  );

-- Гость читает порядок блоков: список повторяет PUBLIC_PROFILE_COLUMNS
-- из src/entities/profile/api/profile.server.ts
grant select (section_order) on table public.profiles to anon;
