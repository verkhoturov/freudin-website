-- Гость (anon) читает из profiles только колонки публичной страницы: без id (он же id
-- пользователя в auth.users) и дат. Список повторяет PUBLIC_PROFILE_COLUMNS
-- из src/entities/profile/api/profile.server.ts. Запрос select * от anon теперь
-- отклоняется, поэтому колонки перечисляем явно.
revoke select on table public.profiles from anon;
grant select (username, display_name, bio, avatar_path, social_links)
on table public.profiles to anon;
