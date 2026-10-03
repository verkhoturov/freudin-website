-- Содержимое и оформление личной страницы (шаги 42–45 плана, решения пользователя 01.10.2026):
-- FAQ психолога, карточки услуг для категорий «Works with», выделенные блоки и вариант обложки.
-- Выделение ссылок и карточек хранится в них самих (поле highlighted в social_links и services).
-- Ограничения повторяют zod-схемы из src/entities/profile (лимиты — config/limits.ts).

-- Длины строк проверяем функциями: в like_regex повтор ограничен 255, а ответ — до 1000 символов.
-- Функции чистые (immutable), поэтому годятся для CHECK

-- [{ "question": "…", "answer": "…" }]: до 10 записей, вопрос 1–150 символов, ответ 1–1000
create function public.is_valid_profile_faq(faq jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(faq) <> 'array' then false
    else jsonb_array_length(faq) <= 10 and not exists (
      select from jsonb_array_elements(faq) as item
      where jsonb_typeof(item) <> 'object'
        or jsonb_typeof(item -> 'question') is distinct from 'string'
        or jsonb_typeof(item -> 'answer') is distinct from 'string'
        or char_length(item ->> 'question') not between 1 and 150
        or char_length(item ->> 'answer') not between 1 and 1000
    )
  end
$$;

-- [{ "clientType": "couples", "title": "…", "description": "", "durationMinutes": 50 | null,
--    "price": { "amount": 80, "currency": "EUR" } | null, "highlighted": false }]:
-- до 10 карточек, категория — из client_types профиля, название 1–80 символов, описание до 500,
-- длительность — целое 1–600 минут, цена — целое 1–100 000 000 и код валюты
create function public.is_valid_profile_services(services jsonb, client_types text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(services) <> 'array' then false
    else jsonb_array_length(services) <= 10 and not exists (
      select from jsonb_array_elements(services) as item
      where jsonb_typeof(item) <> 'object'
        or jsonb_typeof(item -> 'clientType') is distinct from 'string'
        or not ((item ->> 'clientType') = any (client_types))
        or jsonb_typeof(item -> 'title') is distinct from 'string'
        or char_length(item ->> 'title') not between 1 and 80
        or jsonb_typeof(item -> 'description') is distinct from 'string'
        or char_length(item ->> 'description') > 500
        or jsonb_typeof(item -> 'highlighted') is distinct from 'boolean'
        or case jsonb_typeof(item -> 'durationMinutes')
          when 'null' then false
          when 'number' then not (
            (item ->> 'durationMinutes')::numeric between 1 and 600
            and (item ->> 'durationMinutes')::numeric = trunc((item ->> 'durationMinutes')::numeric)
          )
          else true
        end
        or case jsonb_typeof(item -> 'price')
          when 'null' then false
          when 'object' then not (
            jsonb_typeof(item -> 'price' -> 'amount') = 'number'
            and jsonb_typeof(item -> 'price' -> 'currency') = 'string'
            and (item -> 'price' ->> 'currency') ~ '^[A-Z]{3}$'
            and (item -> 'price' ->> 'amount')::numeric between 1 and 100000000
            and (item -> 'price' ->> 'amount')::numeric = trunc((item -> 'price' ->> 'amount')::numeric)
          )
          else true
        end
    )
  end
$$;

alter table public.profiles
  add column faq jsonb not null default '[]'::jsonb,
  add column services jsonb not null default '[]'::jsonb,
  -- Выделенные блоки страницы. Справочник блоков живёт в коде (profileSectionIds), поэтому, как
  -- у section_order, проверяются только формат значений и их количество
  add column highlighted_sections text[] not null default '{}',
  -- Вариант обложки. Пока только сохраняется: оформление появится отдельным шагом
  add column cover text not null default 'classic',

  add constraint profiles_faq_check check (public.is_valid_profile_faq(faq)),
  add constraint profiles_services_check check (
    public.is_valid_profile_services(services, client_types)
  ),
  add constraint profiles_highlighted_sections_check check (
    cardinality(highlighted_sections) <= 20
    and not jsonb_path_exists(
      to_jsonb(highlighted_sections),
      'strict $[*] ? (@.type() != "string" || !(@ like_regex "^[a-z-]+$"))'
    )
  ),
  add constraint profiles_cover_check check (cover in ('classic', 'banner', 'hero'));

-- Гость читает новые колонки публичной страницы: список повторяет PUBLIC_PROFILE_COLUMNS
-- из src/entities/profile/api/profile.server.ts
grant select (faq, services, highlighted_sections, cover) on table public.profiles to anon;
