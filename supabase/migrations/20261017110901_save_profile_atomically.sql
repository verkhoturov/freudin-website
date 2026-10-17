-- Атомарное сохранение настроек (шаги 65 и 66 плана). Поля профиля, контактная почта, закрытые
-- данные, режим страницы и пароль пишутся одной функцией: вызов RPC — одна транзакция, и ошибка
-- любой части (занятый username, неверный город, режим password без пароля) откатывает всё.
--
-- version — номер сохранения настроек. Клиент передаёт версию, с которой открыл форму; если
-- профиль с тех пор сохранили в другой вкладке, функция отвечает version_conflict и ничего
-- не пишет. Фото и документы версию не меняют: они сохраняются мимо формы.

alter table public.profiles
  add column version integer not null default 1;

-- p_changes — изменённые колонки profiles (ключ есть — колонка меняется, null — стирается).
-- p_contact_email: null — не менять, '' — удалить. p_private — изменённые колонки
-- profile_private. p_visibility: null — не менять. p_expected_version: null — без проверки.
-- Возвращает новую версию. Работает с правами вызывающего: RLS и права ролей действуют как раньше
create function public.save_profile(
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
    page_theme, link_icons, cta_placement, version
  ) = (
    select
      r.username, r.display_name, r.bio, r.social_links, r.country, r.city_id, r.work_formats,
      r.client_types, r.approaches, r.languages, r.price_amount, r.price_currency,
      r.section_order, r.practice_started_on, r.education, r.contacts, r.preferred_contact,
      r.faq, r.services, r.highlighted_sections, r.cover, r.page_theme, r.link_icons,
      r.cta_placement, p.version + 1
    from jsonb_populate_record(p, coalesce(p_changes, '{}'::jsonb)) as r
  )
  where p.id = v_user
  returning p.version into v_version;

  return v_version;
end;
$$;

revoke execute on function public.save_profile(jsonb, text, jsonb, text, text, integer)
  from public, anon;
grant execute on function public.save_profile(jsonb, text, jsonb, text, text, integer)
  to authenticated;
