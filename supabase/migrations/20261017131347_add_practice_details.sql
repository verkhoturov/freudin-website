-- Данные практики из этапа Q плана (решения пользователя 17.10.2026). Всё необязательно
-- и заявлено автором: Freudin эти сведения не проверяет.
-- professional_role — роль под именем («Clinical psychologist», шаг 85);
-- price_type — общая цена «от» или фиксированная (шаг 87), прежние цены остаются «от»;
-- accepting_clients — статус приёма новых клиентов, NULL — не указан (шаг 89);
-- in_person_area — район или ориентир очного приёма (шаг 90), виден только при In person.
-- Ограничения повторяют zod-схемы из src/entities/profile (limits.ts, schemas.ts).

alter table public.profiles
  add column professional_role text not null default '',
  add column price_type text not null default 'from',
  add column accepting_clients text,
  add column in_person_area text not null default '',
  add constraint profiles_professional_role_check check (char_length(professional_role) <= 60),
  add constraint profiles_price_type_check check (price_type in ('from', 'fixed')),
  add constraint profiles_accepting_clients_check check (
    accepting_clients in ('accepting', 'waitlist', 'not-accepting')
  ),
  add constraint profiles_in_person_area_check check (char_length(in_person_area) <= 100);

-- Гость читает новые колонки открытых страниц: список повторяет PUBLIC_PROFILE_COLUMNS
grant select (professional_role, price_type, accepting_clients, in_person_area)
  on table public.profiles to anon;

-- Новые колонки сохраняются той же транзакцией, что и остальные настройки
create or replace function public.save_profile(
  p_changes jsonb,
  p_contact_email text default null,
  p_private jsonb default null,
  p_visibility text default null,
  p_password text default null,
  p_expected_version integer default null
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_version integer;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  -- Блокировка строки: параллельные сохранения проверяют версию по очереди
  select version into v_version from public.profiles where id = v_user for update;
  if not found then
    raise exception 'profile_missing' using errcode = 'P0002';
  end if;
  if p_expected_version is not null and v_version <> p_expected_version then
    raise exception 'version_conflict' using errcode = 'P0001';
  end if;

  if p_contact_email = '' then
    delete from public.account_contacts where id = v_user;
  elsif p_contact_email is not null then
    insert into public.account_contacts (id, email)
    values (v_user, p_contact_email)
    on conflict (id) do update set email = excluded.email;
  end if;

  if p_private is not null and p_private <> '{}'::jsonb then
    insert into public.profile_private as current (id, birth_date, gender, concerns)
    select v_user, r.birth_date, r.gender, coalesce(r.concerns, '{}')
    from jsonb_populate_record(null::public.profile_private, p_private) as r
    on conflict (id) do update set
      birth_date = case when p_private ? 'birth_date'
        then excluded.birth_date else current.birth_date end,
      gender = case when p_private ? 'gender' then excluded.gender else current.gender end,
      concerns = case when p_private ? 'concerns'
        then excluded.concerns else current.concerns end;
  end if;

  if p_visibility is not null then
    perform public.set_profile_visibility(p_visibility, p_password);
  end if;

  -- Колонки, которых нет в p_changes, jsonb_populate_record берёт из текущей строки
  update public.profiles as p
  set (
    username, display_name, bio, social_links, country, city_id, work_formats, client_types,
    approaches, languages, price_amount, price_currency, section_order, practice_started_on,
    education, contacts, preferred_contact, faq, services, highlighted_sections, cover,
    page_theme, link_icons, cta_placement, professional_role, price_type, accepting_clients,
    in_person_area, version
  ) = (
    select
      r.username, r.display_name, r.bio, r.social_links, r.country, r.city_id, r.work_formats,
      r.client_types, r.approaches, r.languages, r.price_amount, r.price_currency,
      r.section_order, r.practice_started_on, r.education, r.contacts, r.preferred_contact,
      r.faq, r.services, r.highlighted_sections, r.cover, r.page_theme, r.link_icons,
      r.cta_placement, r.professional_role, r.price_type, r.accepting_clients,
      r.in_person_area, p.version + 1
    from jsonb_populate_record(p, coalesce(p_changes, '{}'::jsonb)) as r
  )
  where p.id = v_user
  returning p.version into v_version;

  return v_version;
end;
$$;
