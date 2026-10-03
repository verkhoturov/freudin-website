-- Скрытая личная страница (шаг 49 плана, решения пользователя 02.10.2026). Психолог может скрыть
-- страницу: видна только ему (private) или тем, кто знает пароль (password). Пароль — от 4 до 8
-- символов без других требований: мягкий замок без защиты от перебора. Хранится только хэш.
-- Гость, который ввёл верный пароль, получает токен доступа в cookie на 30 дней; смена пароля
-- или режима выдаёт новый токен, и прежние cookies перестают действовать.

alter table public.profiles
  add column visibility text not null default 'public',
  add constraint profiles_visibility_check check (visibility in ('public', 'private', 'password'));

-- Гость читает режим открытых страниц: список повторяет PUBLIC_PROFILE_COLUMNS
grant select (visibility) on table public.profiles to anon;

-- Скрытые страницы гость и другие пользователи не читают, владелец — свою. Узнать режим скрытой
-- страницы и открыть её по паролю можно только функциями ниже
drop policy "Профили: чтение всем" on public.profiles;

create policy "Профили: чтение открытых и своего"
on public.profiles for select
to anon, authenticated
using (visibility = 'public' or (select auth.uid()) = id);

-- Пароль страницы. Таблицу пишут и проверяют только функции ниже (security definer): владелец
-- видит лишь то, что пароль задан, а сам хэш не читает никто
create table public.profile_page_access (
  id uuid primary key references public.profiles (id) on delete cascade,
  password_hash text not null,
  access_token uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now()
);

comment on table public.profile_page_access is
  'Пароль скрытой страницы (хэш bcrypt) и токен доступа для cookie гостя';

alter table public.profile_page_access enable row level security;

revoke all on table public.profile_page_access from anon, authenticated;
grant select (id) on table public.profile_page_access to authenticated;

create policy "Пароль страницы: чтение своего"
on public.profile_page_access for select
to authenticated
using ((select auth.uid()) = id);

-- Режим страницы текущего пользователя и, если передан, новый пароль. Режим password без
-- заданного пароля — ошибка page_password_required. Новый пароль или смена режима выдают новый
-- токен доступа: введённые раньше пароли перестают действовать
create function public.set_profile_visibility(p_visibility text, p_password text default null)
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
    insert into public.profile_page_access (id, password_hash)
    values (v_user, extensions.crypt(p_password, extensions.gen_salt('bf')))
    on conflict (id) do update
    set password_hash = excluded.password_hash,
      access_token = gen_random_uuid(),
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

-- Режим страницы по адресу или null, если адреса нет. Нужен гостю, чтобы показать сообщение
-- о скрытой странице вместо 404, и проверке, свободен ли адрес: скрытые профили гость не видит
create function public.get_profile_visibility(p_username text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select visibility from public.profiles where username = p_username;
$$;

-- Токен доступа к странице с паролем, если пароль верный, иначе null
create function public.unlock_profile_page(p_username text, p_password text)
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
    and access.password_hash = extensions.crypt(p_password, access.password_hash);
$$;

-- Страница с паролем по действующему токену доступа. Сервер выбирает из результата только
-- колонки публичной страницы (PUBLIC_PROFILE_COLUMNS)
create function public.get_unlocked_profile(p_username text, p_token uuid)
returns setof public.profiles
language sql
stable
security definer
set search_path = ''
as $$
  select profile.*
  from public.profiles profile
  join public.profile_page_access access on access.id = profile.id
  where profile.username = p_username
    and profile.visibility = 'password'
    and access.access_token = p_token;
$$;

revoke execute on function public.set_profile_visibility(text, text) from public, anon;
grant execute on function public.set_profile_visibility(text, text) to authenticated;

revoke execute on function public.get_profile_visibility(text) from public;
grant execute on function public.get_profile_visibility(text) to anon, authenticated;

revoke execute on function public.unlock_profile_page(text, text) from public;
grant execute on function public.unlock_profile_page(text, text) to anon, authenticated;

revoke execute on function public.get_unlocked_profile(text, uuid) from public;
grant execute on function public.get_unlocked_profile(text, uuid) to anon, authenticated;
