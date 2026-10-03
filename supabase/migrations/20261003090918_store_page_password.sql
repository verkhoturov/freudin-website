-- Пароль скрытой страницы хранится открытым текстом (решение пользователя 03.10.2026): владелец
-- видит его в настройках и может показать кнопкой с глазом. Читает пароль только владелец, гость
-- по-прежнему только вводит его. Хэш убираем: рядом с самим паролем он ничего не защищает.
-- Восстановить пароли из хэшей нельзя: страницы с паролем переводим в режим «только владелец»,
-- и пароль задаётся заново.

update public.profiles set visibility = 'private' where visibility = 'password';
delete from public.profile_page_access;

alter table public.profile_page_access
  drop column password_hash,
  add column password text not null,
  add constraint profile_page_access_password_check check (char_length(password) between 4 and 8);

comment on table public.profile_page_access is
  'Пароль скрытой страницы (виден только владельцу) и токен доступа для cookie гостя';

-- Владелец читает свой пароль: RLS уже пускает только его строку
grant select (password) on table public.profile_page_access to authenticated;

-- Тот же пароль при сохранении не меняет токен: гости не теряют доступ при каждом Save
create or replace function public.set_profile_visibility(
  p_visibility text,
  p_password text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if p_password is not null then
    if char_length(p_password) not between 4 and 8 then
      raise exception 'page_password_invalid' using errcode = '22023';
    end if;
    insert into public.profile_page_access (id, password)
    values (v_user, p_password)
    on conflict (id) do update
    set password = excluded.password,
      access_token = case
        when public.profile_page_access.password is distinct from excluded.password
          then gen_random_uuid()
        else public.profile_page_access.access_token
      end,
      updated_at = now();
  elsif p_visibility = 'password'
    and not exists (select from public.profile_page_access where id = v_user) then
    raise exception 'page_password_required' using errcode = 'P0001';
  end if;

  update public.profiles
  set visibility = p_visibility
  where id = v_user and visibility is distinct from p_visibility;

  if found then
    update public.profile_page_access
    set access_token = gen_random_uuid(), updated_at = now()
    where id = v_user;
  end if;
end;
$$;

create or replace function public.unlock_profile_page(p_username text, p_password text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select access.access_token
  from public.profiles profile
  join public.profile_page_access access on access.id = profile.id
  where profile.username = p_username
    and profile.visibility = 'password'
    and access.password = p_password;
$$;
