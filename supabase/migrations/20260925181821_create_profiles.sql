-- Профиль пользователя: личная страница /<username>.
-- Ограничения повторяют zod-схемы из src/entities/profile (limits.ts, username.ts).
-- Зарезервированные адреса проверяет только сервер: список собирается из роутов приложения.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null,
  bio text not null default '',
  -- Путь объекта в bucket avatars: <user_id>/<uuid>.webp
  avatar_path text,
  -- [{ "platform": "telegram", "url": "https://t.me/…" }]
  social_links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_username_key unique (username),
  constraint profiles_username_check check (
    char_length(username) between 3 and 30
    and username ~ '^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$'
  ),
  constraint profiles_display_name_check check (char_length(display_name) between 1 and 60),
  constraint profiles_bio_check check (char_length(bio) <= 500),
  constraint profiles_avatar_path_check check (avatar_path like id::text || '/%'),
  constraint profiles_social_links_check check (
    case
      when jsonb_typeof(social_links) = 'array' then jsonb_array_length(social_links) <= 10
      else false
    end
  )
);

comment on table public.profiles is 'Личные страницы пользователей';

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Клиент не ходит в Supabase напрямую, но RLS и права ролей — вторая линия защиты.
alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;

create policy "Профили: чтение всем"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Профили: создание своего"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Профили: изменение своего"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Удаляется профиль каскадно вместе с пользователем (DELETE /api/me через admin API),
-- поэтому политики на delete нет.
