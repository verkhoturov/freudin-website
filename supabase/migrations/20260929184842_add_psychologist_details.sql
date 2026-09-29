-- Данные психолога, часть 2 (шаг 29 плана, решения пользователя 29.09.2026).
-- На странице: образование, контакты для связи, предпочтительный способ связи и дата начала
-- практики (стаж). Не показываются, нужны для поиска: дата рождения, пол и запросы клиентов,
-- с которыми работает психолог, — они в отдельной таблице profile_private, её читает только
-- владелец. Ограничения повторяют zod-схемы из src/entities/profile.
alter table public.profiles
  -- [{ "qualification": "MA in Clinical Psychology", "institution": "…", "year": 2015 }],
  -- year — число или null
  add column education jsonb not null default '[]'::jsonb,
  -- Контакты для связи, только заполненные: { "email": "…", "phone": "+995 …",
  -- "whatsapp": "+995 …", "telegram": "https://t.me/…" }. Типы живут в коде (contactTypeIds)
  add column contacts jsonb not null default '{}'::jsonb,
  -- Предпочтительный способ связи: тип контакта из contacts или url ссылки из social_links
  add column preferred_contact text,
  -- Дата начала практики: на странице — стаж в годах
  add column practice_started_on date,

  -- Не больше 5 записей, у каждой строки квалификации и вуза (1–150 символов) и год.
  -- Считаем подходящие элементы: в strict ошибка (нет ключа) не должна пропустить элемент
  add constraint profiles_education_check check (
    case
      when jsonb_typeof(education) = 'array' then
        jsonb_array_length(education) <= 5
        and jsonb_array_length(education) = jsonb_array_length(jsonb_path_query_array(
          education,
          'strict $[*] ? (@.type() == "object"
            && @.qualification.type() == "string" && @.qualification like_regex "^.{1,150}$"
            && @.institution.type() == "string" && @.institution like_regex "^.{1,150}$"
            && (@.year.type() == "null"
              || (@.year.type() == "number" && @.year >= 1950 && @.year <= 2100)))'
        ))
      else false
    end
  ),
  -- Объект: ключи — типы контактов (латиница), значения — непустые строки до 254 символов
  add constraint profiles_contacts_check check (
    jsonb_typeof(contacts) = 'object'
    and jsonb_array_length(jsonb_path_query_array(contacts, '$.keyvalue()')) <= 10
    and not jsonb_path_exists(
      contacts,
      'strict $.keyvalue() ? (!(@.key like_regex "^[a-z]+$")
        || @.value.type() != "string" || !(@.value like_regex "^.{1,254}$"))'
    )
  ),
  -- Способ связи должен быть среди заполненных контактов или ссылок
  add constraint profiles_preferred_contact_check check (
    preferred_contact is null
    or contacts ? preferred_contact
    or social_links @> jsonb_build_array(jsonb_build_object('url', preferred_contact))
  ),
  -- Не в будущем. Прошедшая дата не станет будущей, поэтому current_date здесь безопасна
  add constraint profiles_practice_started_on_check check (
    practice_started_on between '1950-01-01' and current_date
  );

-- Гость читает новые колонки публичной страницы: список повторяет PUBLIC_PROFILE_COLUMNS
-- из src/entities/profile/api/profile.server.ts
grant select (education, contacts, preferred_contact, practice_started_on)
on table public.profiles to anon;

-- Данные психолога, которые не показываются на странице: для поиска и подбора (шаги 22 и 33).
-- Отдельная таблица, как account_contacts: profiles читают все, а эти данные — только владелец.
-- Поиск будет читать их на сервере, не открывая гостю.
create table public.profile_private (
  id uuid primary key references auth.users (id) on delete cascade,
  birth_date date,
  -- female, male, other
  gender text,
  -- Запросы клиентов, с которыми работает психолог. Справочник живёт в коде (concernIds)
  concerns text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Психологу не меньше 18 лет. С годами условие не нарушится, поэтому current_date безопасна
  constraint profile_private_birth_date_check check (
    birth_date between '1900-01-01' and current_date - interval '18 years'
  ),
  constraint profile_private_gender_check check (gender in ('female', 'male', 'other')),
  constraint profile_private_concerns_check check (
    cardinality(concerns) <= 200
    and not jsonb_path_exists(
      to_jsonb(concerns),
      'strict $[*] ? (@.type() != "string" || !(@ like_regex "^[a-z-]+$"))'
    )
  )
);

comment on table public.profile_private is
  'Данные психолога, которые не показываются на странице: дата рождения, пол, запросы';

create trigger profile_private_set_updated_at
before update on public.profile_private
for each row execute function public.set_updated_at();

alter table public.profile_private enable row level security;

revoke all on table public.profile_private from anon, authenticated;
grant select, insert, update on table public.profile_private to authenticated;

create policy "Закрытые данные: чтение своих"
on public.profile_private for select
to authenticated
using ((select auth.uid()) = id);

create policy "Закрытые данные: создание своих"
on public.profile_private for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Закрытые данные: изменение своих"
on public.profile_private for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Строка удаляется каскадно вместе с пользователем (DELETE /api/me через admin API)
