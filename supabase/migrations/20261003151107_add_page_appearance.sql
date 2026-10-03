-- Оформление личной страницы (шаги 50–53): пресет фона и карточки, иконки на кнопках ссылок
-- и место главной кнопки на телефоне. Списки значений повторяют pageThemeIds и ctaPlacementIds
alter table public.profiles
  add column page_theme text not null default 'classic',
  add column link_icons boolean not null default true,
  add column cta_placement text not null default 'inline',

  add constraint profiles_page_theme_check check (
    page_theme in ('classic', 'paper', 'lavender', 'orchid', 'sage', 'sky')
  ),
  add constraint profiles_cta_placement_check check (cta_placement in ('inline', 'sticky'));

-- Гость читает новые колонки публичной страницы: список повторяет PUBLIC_PROFILE_COLUMNS
-- из src/entities/profile/api/profile.server.ts
grant select (page_theme, link_icons, cta_placement) on table public.profiles to anon;
