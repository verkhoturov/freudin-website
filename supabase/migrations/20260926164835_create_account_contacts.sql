-- Контактная почта аккаунта, у которого провайдер входа не дал email (Facebook без почты,
-- Telegram). Пользователь указывает её сам в онбординге или настройках, это необязательно.
--
-- Отдельная таблица, а не колонка profiles: profiles читают все, а контакт — только владелец.
-- Это не email аккаунта в Supabase Auth: адрес не подтверждается и не участвует в автоматическом
-- связывании аккаунтов по email, иначе чужой адрес дал бы доступ к чужому аккаунту.
-- Ограничения повторяют zod-схему contactEmailSchema из src/entities/profile.
create table public.account_contacts (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint account_contacts_email_check check (
    char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

comment on table public.account_contacts is 'Контактная почта аккаунтов без email у провайдера входа';

create trigger account_contacts_set_updated_at
before update on public.account_contacts
for each row execute function public.set_updated_at();

alter table public.account_contacts enable row level security;

revoke all on table public.account_contacts from anon, authenticated;
grant select, insert, update, delete on table public.account_contacts to authenticated;

create policy "Контакты: чтение своего"
on public.account_contacts for select
to authenticated
using ((select auth.uid()) = id);

create policy "Контакты: создание своего"
on public.account_contacts for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Контакты: изменение своего"
on public.account_contacts for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Пользователь может убрать контакт в настройках; вместе с аккаунтом строка удаляется каскадно
create policy "Контакты: удаление своего"
on public.account_contacts for delete
to authenticated
using ((select auth.uid()) = id);
