# План реализации Freudin

> Живой документ. Шаги отмечаем `[x]` по мере выполнения. Если по ходу меняются решения,
> стек или роуты, обновляем этот файл вместе с `README.md` и `AGENTS.md`.

## 1. Что строим (MVP)

- Регистрация и вход через **Google**, **Meta (Facebook Login)** и **Telegram**.
- После первого входа идёт онбординг: пользователь указывает **фото, имя, описание**,
  выбирает **уникальную ссылку** (username) и добавляет **ссылки на соцсети**.
- Публичная личная страница `https://<домен>/<username>`.
- Редактирование профиля и управление аккаунтом: выход, удаление.

## 2. Исходная точка

Проект создан через `create-next-app` 16.3.6:

- Next.js 16.3 (App Router в `src/app`, Turbopack, **React Compiler включён**), React 19.2, TypeScript 5;
- Tailwind CSS 4, Biome 2.4 (линтер и форматтер), npm;
- `AGENTS.md` с управляемым блоком Next.js. Его пересоздаёт `next dev`, поэтому блок не трогаем:
  он отправляет агентов читать документацию из `node_modules/next/dist/docs/`.
  `CLAUDE.md` содержит одну строку: `@AGENTS.md`.

## 3. Решения, которые нужно подтвердить

Рядом с каждым вопросом указан вариант по умолчанию. Если какой-то не подходит, скажи до старта
соответствующего шага.

| # | Вопрос | По умолчанию |
|---|--------|--------------|
| 1 | Адрес личной страницы | `https://<домен>/<username>`: короткий и удобен для «ссылки в био». Конфликты с роутами закрываем списком зарезервированных имён. Альтернатива: `/u/<username>` |
| 2 | Кто выбирает username | Пользователь на онбординге, с подсказкой из данных провайдера. Сменить можно в настройках, но старая ссылка перестанет работать |
| 3 | Что значит «Meta» | Facebook Login. Вход через Instagram Meta даёт только бизнес-аккаунтам, поэтому он не подходит |
| 4 | Формы | **TanStack Form** + zod + компоненты shadcn `Field`. react-hook-form плохо совместим с React Compiler, а тот в проекте включён. Заодно получаем единую экосистему TanStack |
| 5 | Соцсети | Фиксированный список платформ плюс «Сайт», до 10 ссылок. Храним в `jsonb`-колонке профиля |
| 6 | Server Components | Только там, где их требует Next.js: корневой `layout.tsx` и тонкие `page.tsx`, реэкспортирующие клиентский view. `proxy.ts` (бывший middleware) не используем |
| 7 | Язык | Интерфейс на русском, без i18n. Документация (README, AGENTS, план) тоже на русском |
| 8 | Инфраструктура | Vercel для хостинга. Облачный Supabase для БД, Auth и Storage; лучше завести отдельные проекты для dev и prod |
| 9 | Несколько способов входа | Один способ входа = один аккаунт. Google и Facebook с одинаковым email Supabase объединит автоматически. Ручную привязку (важна для Telegram, у которого нет email) делаем после MVP |

## 4. Архитектура

### 4.1. Поток данных и правила клиент/сервер

```
Браузер: client components ('use client'), TanStack Query, Zustand
   │   fetch('/api/...'): клиент ходит только в собственные API-роуты
   ▼
src/app/api/**/route.ts: Route Handlers (Node.js), вся серверная логика
   │   @supabase/ssr (сессия пользователя в cookies) / admin-клиент (secret key)
   ▼
Supabase: Auth (google, facebook, custom:telegram) · Postgres + RLS · Storage (avatars)
```

- Клиент **никогда** не обращается к Supabase напрямую. Ключи Supabase лежат только в серверных
  env, без префикса `NEXT_PUBLIC_`.
- Серверные компоненты не загружают данные. Страницы и вся логика живут в клиентских компонентах
  слоёв `views` и ниже, а данные приходят только через `/api`.
- Сессию Supabase обновляют сами route handlers: в них можно писать cookies. Приватные страницы
  защищаются на клиенте: пока грузится `GET /api/me`, показываем скелетон, а без сессии
  перенаправляем на `/login`.
- RLS включён на всех таблицах, хотя клиент не ходит в Supabase напрямую. Это вторая линия защиты.

### 4.2. Авторизация

Все три провайдера проходят через один OAuth-поток Supabase (PKCE):

```
[Кнопка «Войти через …»]
  → GET /api/auth/sign-in?provider=google|facebook|telegram&next=/…
      signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } })
      PKCE verifier сохраняется в cookie, затем 302 на провайдера
  → провайдер → https://<ref>.supabase.co/auth/v1/callback
  → GET /api/auth/callback?code=…&next=…
      exchangeCodeForSession(code), cookies сессии
      302: профиля нет → /onboarding; профиль есть → next или /<username>
```

- **Telegram** подключается как кастомный OIDC-провайдер Supabase `custom:telegram`: issuer
  `https://oauth.telegram.org`, scopes `openid profile`, `email_optional: true`. У Telegram
  появился вход через OpenID Connect (старый Login Widget теперь legacy), а Supabase поддерживает
  кастомные OIDC-провайдеры (на Free-плане до 3 штук).
  Telegram не отдаёт email, это нормально. Имя, фото и `preferred_username` приходят в
  `user_metadata`.
- **Facebook** требует разрешение `email`. Без Live-режима приложения войти могут только его
  тестировщики.
- Параметр `next` принимаем только как относительный путь, чтобы исключить open redirect.

### 4.3. Модель данных (Supabase)

Таблица `public.profiles`:

| Поле | Тип | Ограничения |
|------|-----|-------------|
| `id` | `uuid` PK | `references auth.users(id) on delete cascade` |
| `username` | `text` unique | 3–30 символов, `^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])$`, не из списка зарезервированных |
| `display_name` | `text` | 1–60 символов |
| `bio` | `text` | до 500 символов |
| `avatar_path` | `text` null | путь в Storage: `avatars/<user_id>/<uuid>.webp` |
| `social_links` | `jsonb` | `[{ "platform": "telegram", "url": "https://t.me/…" }]`, не больше 10 |
| `created_at`, `updated_at` | `timestamptz` | `updated_at` обновляет триггер |

- RLS: `select` открыт всем (страницы публичные), `insert`/`update` доступны только владельцу
  (`auth.uid() = id`).
- Storage: публичный bucket `avatars` (лимит 2 МБ, jpeg/png/webp). Писать можно только в свою
  папку `<user_id>/`.
- Профиль создаётся явно, при отправке онбординга. Триггер на `auth.users` не используем:
  username обязателен, и его выбирает пользователь. «Регистрация завершена» = профиль существует.
- Миграции лежат в `supabase/migrations`. Типы генерируются в
  `src/shared/api/supabase/database.types.ts`.

### 4.4. Структура проекта (FSD)

Слои (импорт разрешён только сверху вниз): `app` → `views` → `widgets` → `entities` → `shared`.
Слоя `features` **нет**. Пользовательские сценарии (вход, редактирование, выход) собираются
в `widgets`, а API-хуки, мутации и модель лежат в `entities`. Слой `pages` заменён на `views`.

```
src/
├─ app/                      # Next.js App Router = FSD-слой app
│  ├─ layout.tsx             # html/body, шрифты, metadata, <Providers>
│  ├─ globals.css
│  ├─ _providers/            # QueryClientProvider, ThemeProvider, Toaster ('use client')
│  ├─ page.tsx               # export { HomeView as default } from '@/views/home'
│  ├─ login/page.tsx         # → views/login
│  ├─ onboarding/page.tsx    # → views/onboarding
│  ├─ settings/page.tsx      # → views/settings
│  ├─ privacy/page.tsx       # → views/privacy
│  ├─ terms/page.tsx         # → views/terms
│  ├─ [username]/page.tsx    # → views/profile
│  ├─ not-found.tsx          # → views/not-found
│  └─ api/                   # ВСЯ серверная логика (см. 4.5)
│     └─ _lib/               # хелперы route handlers: ответы и ошибки, requireUser, zod-парсинг
├─ views/        # home, login, onboarding, settings, profile, privacy, terms, not-found
├─ widgets/      # header, footer, sign-in-panel, profile-form, profile-card, account-settings
├─ entities/     # viewer (текущий пользователь), profile, social-link
└─ shared/
   ├─ ui/        # компоненты shadcn/ui
   ├─ lib/       # cn, хуки, работа с изображениями
   ├─ api/       # apiClient (fetch к /api), ApiError, QueryClient;
   │             # index.server.ts: клиенты Supabase (server-only) и сгенерированные типы
   └─ config/    # routes, site, reserved-usernames, env
```

Правила:

- Слайс импортируется снаружи только через public API: `index.ts`, а для серверного кода
  `index.server.ts` с `import 'server-only'`.
- Слайсы одного слоя друг друга не импортируют. Исключение для `entities`: кросс-импорт через `@x`.
- Сегменты внутри слайса: `ui`, `model` (типы, zod-схемы, Zustand-сторы), `api` (query keys,
  хуки TanStack Query, серверные функции `*.server.ts`), `lib`, `config`.
- Файлы в `src/app` остаются тонкими: `page.tsx` только реэкспортирует view, а `route.ts`
  разбирает HTTP (авторизация, валидация, коды ответов) и вызывает серверные функции сущностей.

### 4.5. Роуты

Страницы:

| Путь | View | Доступ |
|------|------|--------|
| `/` | `home` | все |
| `/login` | `login` | гости; авторизованных редиректим |
| `/onboarding` | `onboarding` | авторизованные **без** профиля |
| `/settings` | `settings` | авторизованные **с** профилем |
| `/<username>` | `profile` | все |
| `/privacy`, `/terms` | `privacy`, `terms` | все |

API:

| Метод | Путь | Назначение | Нужна сессия |
|-------|------|------------|:---:|
| GET | `/api/health` | проверка связки клиент → API | — |
| GET | `/api/auth/sign-in?provider=&next=` | старт OAuth, редирект к провайдеру | — |
| GET | `/api/auth/callback?code=&next=` | обмен кода на сессию, редирект | — |
| POST | `/api/auth/sign-out` | выход | ✓ |
| GET | `/api/me` | текущий пользователь, его профиль (или `null`) и подсказки для онбординга | ✓ (иначе 401) |
| DELETE | `/api/me` | удаление аккаунта и всех данных | ✓ |
| POST | `/api/profile` | создание профиля (онбординг) | ✓ |
| PATCH | `/api/profile` | обновление профиля | ✓ |
| POST | `/api/profile/avatar` | загрузка фото (multipart) или копирование фото провайдера | ✓ |
| DELETE | `/api/profile/avatar` | удаление фото | ✓ |
| GET | `/api/profiles/[username]` | публичный профиль | — |
| GET | `/api/usernames/[username]` | проверка, свободен ли username | — |

Формат ошибок единый: `{ "error": { "code": "…", "message": "…", "fields": { … } } }`
с корректным HTTP-статусом (400, 401, 403, 404, 409, 413, 500).

### 4.6. Стек

| Задача | Выбор |
|--------|-------|
| Фреймворк | Next.js 16 (App Router), React 19, TypeScript 5 |
| Стили и UI | Tailwind CSS 4, shadcn/ui (CLI 4), lucide-react, next-themes, sonner |
| Серверное состояние | TanStack Query 5 |
| Клиентское состояние | Zustand 5: только UI-состояние и черновики, серверные данные не дублируем |
| Формы и валидация | TanStack Form 1 + zod 4. Одни и те же схемы используются в форме и в API |
| Backend | Route Handlers в `src/app/api`, `@supabase/ssr` + `@supabase/supabase-js` |
| БД, Auth, Storage | Supabase |
| Качество кода | Biome (линт и формат), `tsc`; тесты пишем только по запросу |
| Хостинг | Vercel |

## 5. Пошаговый план

Каждый шаг = одна итерация: реализация, проверки, обновление README, коммит.
Пометка **«Нужно от тебя»** означает действия в сторонних сервисах, которые можешь сделать
только ты: у меня нет доступа к твоим аккаунтам.

### Этап A. Подготовка (начинаем сразу, внешние сервисы не нужны)

**Параллельно с шагами 1–4 ты можешь** завести аккаунты и приложения, которые понадобятся позже.
Верификация у Google и Meta может занять несколько дней, поэтому лучше начать заранее:
проект Supabase (шаг 5), проект в Google Cloud, приложение в Meta for Developers, бота
в Telegram, проект в Vercel, подключённый к репозиторию (превью-деплои пригодятся для проверки
входа).

#### Шаг 1. Правила проекта: AGENTS.md и README.md
- [ ] `AGENTS.md`: управляемый блок Next.js оставляем без изменений, ниже добавляем наши правила.
      Туда входят предпочтительный стек, правила клиент/сервер, FSD (`views` вместо `pages`,
      без `features`, правила импортов, public API, `index.server.ts`), роуты (страницы и API),
      правила состояния, форм и стилей, команды проверки.
- [ ] В `AGENTS.md` явно прописать процесс: после каждой итерации сверять и обновлять `README.md`
      и отмечать прогресс в `docs/PLAN.md`; юнит-тесты писать **только по запросу пользователя**.
- [ ] `README.md`: описание, стек, быстрый старт, переменные окружения, скрипты, структура, роуты,
      настройка провайдеров (дополняется по ходу работы), деплой.

**Готово, когда:** агент в новой сессии без контекста чата знает, куда класть код и как проверять
изменения.

#### Шаг 2. Каркас FSD и очистка шаблона
- [ ] Удалить демо-контент create-next-app (разметку `page.tsx`, SVG в `public/`, стили-заглушки).
- [ ] `lang="ru"`, шрифт Geist с `subsets: ["latin", "cyrillic"]`, базовая `metadata`.
- [ ] Создать слои `views`, `widgets`, `entities`, `shared/{ui,lib,api,config}` с public API.
- [ ] Заглушки view для всех страниц из 4.5, тонкие `page.tsx`, `not-found.tsx`.
- [ ] `shared/config/routes.ts`: все пути в одном месте.
- [ ] Границы слоёв в Biome через `noRestrictedImports` в `overrides`. Запрещаем импорты «вверх»
      по слоям, импорты в обход public API и `@supabase/*` вне серверного кода.
- [ ] Пакет `server-only`; скрипт `typecheck` = `next typegen && tsc --noEmit`.

**Готово, когда:** `npm run lint`, `npm run typecheck` и `npm run build` проходят, а все роуты
открываются заглушками.

#### Шаг 3. Клиентская инфраструктура и каркас API
- [ ] Установить `@tanstack/react-query` (+ devtools), `zustand`, `zod`, `@tanstack/react-form`.
- [ ] `src/app/_providers`: `QueryClientProvider` (devtools только в dev).
- [ ] `shared/api`: `apiClient` (JSON и FormData, единый `ApiError` со статусом, кодом и ошибками
      по полям) и фабрика `QueryClient` (4xx не ретраим).
- [ ] `src/app/api/_lib`: хелперы ответов и ошибок, разбор тела запроса через zod.
- [ ] `GET /api/health` как первый сквозной запрос клиент → API.
- [ ] Env: `shared/config/env.server.ts` с zod-валидацией. Валидация ленивая, чтобы `next build`
      не требовал секретов. Добавить `.env.example` и исключение `!.env.example` в `.gitignore`.

**Готово, когда:** страница-заглушка получает `/api/health` через TanStack Query.

#### Шаг 4. Дизайн-система и каркас вёрстки
- [ ] `npx shadcn init` с алиасами под FSD в `components.json`: `ui → @/shared/ui`,
      `utils → @/shared/lib/utils`, `lib → @/shared/lib`, `hooks → @/shared/lib/hooks`.
- [ ] Тема: нейтральная палитра с одним акцентным цветом, мягкие скругления, Geist. Светлая
      и тёмная версии (`next-themes`), переключатель в шапке.
- [ ] Базовые компоненты: button, card, input, textarea, label, field, avatar, dropdown-menu,
      dialog, alert-dialog, select, skeleton, separator, sonner, tooltip.
- [ ] Иконки: `lucide-react` для интерфейса. Логотипы соцсетей и провайдеров берём отдельными
      SVG (simple-icons или свои по брендбукам), потому что бренд-иконки в lucide устарели.
- [ ] `widgets/header` (логотип и «Войти», пока без логики), `widgets/footer` (ссылки на
      `/privacy`, `/terms`), общий контейнер страниц. Вёрстка mobile-first.

**Готово, когда:** все заглушки выглядят единообразно в обеих темах и на мобильных.

**Нужно от тебя:** облачному окружению нужен доступ к `ui.shadcn.com`, сейчас он закрыт сетевой
политикой. Другой вариант: выполнить `npx shadcn init` локально.

### Этап B. Supabase

#### Шаг 5. Проект Supabase (делаешь ты по чек-листу)
- [ ] Создать проект (регион поближе к аудитории), лучше отдельные dev и prod.
- [ ] Взять Project URL, publishable key (`sb_publishable_…`) и secret key (`sb_secret_…`).
      Положить их в `.env.local` и в Vercel, а в облачное окружение добавить через его настройки.
      В чат ключи не присылай.
- [ ] Authentication → URL Configuration: Site URL = прод-домен. В Redirect URLs добавить
      `http://localhost:3000/**`, `https://*-<team>.vercel.app/**` и
      `https://<домен>/api/auth/callback`.
- [ ] Выбрать, как я буду работать с БД:
      1) **коннектор Supabase в claude.ai** (рекомендую): миграции, генерацию типов и проверку
         RLS (advisors) я делаю сам;
      2) открыть облачному окружению доступ к `*.supabase.co` и `api.supabase.com` и добавить
         переменную `SUPABASE_ACCESS_TOKEN`, тогда я работаю через Supabase CLI;
      3) я пишу SQL-миграции, ты применяешь их сам (SQL Editor или `supabase db push`).

#### Шаг 6. Схема БД и Storage
- [ ] `supabase/config.toml` и миграции (Supabase CLI через `npx supabase`).
- [ ] Миграция `profiles` по модели 4.3: CHECK-ограничения, уникальность username, триггер
      `updated_at`, RLS-политики.
- [ ] Миграция Storage: bucket `avatars` с политиками на `storage.objects`.
- [ ] Скрипт `db:types` для генерации `database.types.ts`.

**Готово, когда:** таблица и bucket созданы, advisors не показывают критичных замечаний, типы
лежат в репозитории.

#### Шаг 7. Серверный доступ к Supabase
- [ ] Установить `@supabase/ssr` и `@supabase/supabase-js`.
- [ ] `shared/api/supabase/server.ts`: клиент с cookies пользователя (publishable key, RLS
      действует). `admin.ts`: клиент с secret key, только для удаления аккаунта и служебных
      операций. Оба `server-only`, наружу экспортируются через `@/shared/api/index.server.ts`.
- [ ] `api/_lib/auth.ts`: `requireUser()` на основе `supabase.auth.getClaims()`, при отсутствии
      сессии отвечает 401.

**Готово, когда:** `GET /api/me` отвечает гостю 401, а ключей нет в клиентском бандле.

### Этап C. Авторизация

#### Шаг 8. Общий OAuth-поток и Google
**Нужно от тебя:** в Google Cloud → Google Auth Platform настроить Branding (название, логотип,
ссылки на `/privacy` и `/terms`), Audience (External) и Data access (`openid`, `email`,
`profile`). В Clients создать Web application: в Authorized JavaScript origins указать localhost
и прод-домен, в Authorized redirect URIs указать `https://<ref>.supabase.co/auth/v1/callback`.
Client ID и Secret внести в Supabase → Auth → Providers → Google. Пока приложение в статусе
Testing, войти могут только добавленные тестовые пользователи.

- [ ] `GET /api/auth/sign-in`: белый список провайдеров, `signInWithOAuth` и 302 на провайдера.
- [ ] `GET /api/auth/callback`: `exchangeCodeForSession`, проверка `next`, маршрутизация
      (онбординг или страница), ошибки отправляем на `/login?error=…`.
- [ ] `POST /api/auth/sign-out`, `GET /api/me` → `{ user, profile | null, suggestions }`.
- [ ] `entities/viewer`: `useViewerQuery`, `useSignOutMutation`, гард приватных страниц
      (скелетон, пока идёт загрузка, затем редирект).
- [ ] `widgets/sign-in-panel` (кнопка Google по гайдлайнам), `views/login` с показом ошибок.
- [ ] `widgets/header`: гость видит «Войти», пользователь видит меню (аватар, «Моя страница»,
      «Настройки», «Выйти»).

**Готово, когда:** вход и выход через Google работают на localhost и Vercel preview, сессия
переживает перезагрузку страницы.

#### Шаг 9. Meta (Facebook Login)
**Нужно от тебя:** на developers.facebook.com создать приложение с use case «Authenticate and
request data from users with Facebook Login» и разрешениями `public_profile` и `email`.
В Facebook Login → Settings → Valid OAuth Redirect URIs указать
`https://<ref>.supabase.co/auth/v1/callback`. App ID и Secret внести в Supabase → Providers →
Facebook.

- [ ] Страницы `/privacy` и `/terms` с шаблонным текстом и разделом «Удаление данных». Они нужны
      Meta для Live-режима и Google для брендинга.
- [ ] Кнопка Facebook в `sign-in-panel`.
- [ ] Понятное сообщение на `/login`, если Facebook не вернул email.

**Готово, когда:** вход через Facebook работает для тестировщиков приложения. Для всех
пользователей он заработает после перевода приложения в Live (шаг 18).

#### Шаг 10. Telegram
**Нужно от тебя:** в @BotFather выполнить `/newbot` (лучше отдельный бот для сайта), затем
открыть mini app BotFather → бот → Login Widget → «Switch to OpenID Connect Login».
Переключение **необратимо**. BotFather покажет Client ID и Client Secret (это не токен бота).
В Redirect URI указать `https://<ref>.supabase.co/auth/v1/callback`, при необходимости добавить
домены сайта в Trusted origins.

- [ ] Провайдер в Supabase → Auth → Providers → New Provider → Auto-discovery (OIDC):
      `custom:telegram`, issuer `https://oauth.telegram.org`, scopes `openid profile`, email
      optional. Можешь сделать ты, или я сделаю через коннектор/admin API.
- [ ] Кнопка Telegram, `custom:telegram` в белом списке провайдеров.
- [ ] Приведение метаданных провайдеров к единому виду: имя, аватар, подсказка username
      (`preferred_username` у Telegram, часть email до `@` у Google/Facebook).

**Готово, когда:** вход через Telegram создаёт пользователя без email и ведёт на онбординг.

**Запасной план:** если связка Telegram OIDC + Supabase не заработает, используем Telegram Login
SDK на клиенте, проверяем `id_token` по JWKS в `POST /api/auth/telegram` и создаём сессию через
admin API.

### Этап D. Профиль

#### Шаг 11. Сущности и API профиля
- [ ] `entities/social-link`: справочник платформ (Telegram, Instagram, Facebook, VK, X, YouTube,
      TikTok, LinkedIn, Threads, «Сайт»). Для каждой платформы: название, иконка, допустимые
      домены, нормализация `@handle` → URL, zod-схема.
- [ ] `entities/profile`: типы, zod-схемы (общие для формы и API), правила username,
      зарезервированные имена (все верхнеуровневые роуты и служебные слова вроде `api`, `login`,
      `onboarding`, `settings`, `privacy`, `terms`, `admin`), query keys и хуки
      (`useProfileQuery`, `useCreateProfileMutation`, `useUpdateProfileMutation`,
      `useUsernameAvailabilityQuery`), серверные функции БД в `index.server.ts`.
- [ ] Роуты `POST /api/profile`, `PATCH /api/profile`, `GET /api/profiles/[username]`,
      `GET /api/usernames/[username]`.

**Готово, когда:** профиль создаётся, читается и обновляется через API. Невалидные данные дают 400
с ошибками по полям, занятый username даёт 409.

#### Шаг 12. Фото профиля
- [ ] `POST /api/profile/avatar`: multipart, jpeg/png/webp, не больше 2 МБ. Файл сохраняется
      в `avatars/<user_id>/<uuid>.webp`, старый удаляется. `DELETE /api/profile/avatar`.
- [ ] Клиент: выбор файла, кроп 1:1 (`react-easy-crop`), сжатие до 512×512 WebP через canvas,
      загрузка. Лимит тела запроса на Vercel 4.5 МБ.
- [ ] Кнопка «Взять фото из аккаунта»: сервер скачивает аватар провайдера и сохраняет его
      в Storage, потому что ссылки провайдеров со временем перестают работать.
- [ ] `next.config.ts`: `images.remotePatterns` для
      `https://<ref>.supabase.co/storage/v1/object/public/**`.

#### Шаг 13. Онбординг (регистрация профиля)
- [ ] `widgets/profile-form` (TanStack Form + zod + shadcn `Field`). Поля: фото, имя, ссылка
      `<домен>/<username>` с проверкой доступности (debounce), описание со счётчиком символов,
      соцсети (добавить или удалить, выбрать платформу).
- [ ] Живое превью карточки: на десктопе рядом с формой, на мобильных под ней.
- [ ] Предзаполнение полей из данных провайдера.
- [ ] Zustand: черновик онбординга (`persist` в sessionStorage), чтобы ввод не терялся
      при перезагрузке.
- [ ] `views/onboarding`: гостя отправляем на `/login`, пользователя с профилем на `/settings`.
      После сохранения ведём на `/<username>` с тостом «Страница готова» и кнопкой
      «Скопировать ссылку».

#### Шаг 14. Публичная страница `/<username>`
- [ ] `widgets/profile-card` + `views/profile`: крупное фото, имя, описание с переносами строк,
      кнопки соцсетей во всю ширину с иконками. Кнопка «Поделиться» (Web Share API, иначе
      копирование ссылки). Владелец видит кнопку «Редактировать».
- [ ] Состояния: скелетон при загрузке; 404 «Такой страницы нет» с призывом создать свою.
- [ ] Заголовок вкладки = имя пользователя.

#### Шаг 15. Настройки и управление аккаунтом
- [ ] `views/settings`: `profile-form` в режиме редактирования. При смене username предупреждаем,
      что старая ссылка перестанет работать.
- [ ] `widgets/account-settings`: способ входа, «Выйти», «Удалить аккаунт» (AlertDialog
      с подтверждением) → `DELETE /api/me`. Сначала удаляются файлы из Storage, затем
      пользователь через admin API; профиль удаляется каскадно.

### Этап E. Интерфейс

#### Шаг 16. Главная страница
- [ ] Первый экран «Твоя личная страница за минуту» с примером карточки, блок «как это
      работает» (3 шага), призыв к действию.
- [ ] Авторизованный пользователь видит «Моя страница» или «Завершить регистрацию».

#### Шаг 17. Полировка
- [ ] Адаптив, тёмная тема, скелетоны, ошибки и пустые состояния, тосты.
- [ ] Доступность: фокус, aria-атрибуты, контраст. `error.tsx`, favicon и иконки приложения,
      вычитка текстов.

### Этап F. Запуск

#### Шаг 18. Прод
- [ ] Vercel: переменные окружения для Production и Preview, домен.
- [ ] Прод-URL во всех провайдерах и в Supabase. Google переводим в «In production», Facebook
      в Live (нужны `/privacy`, `/terms` и инструкция по удалению данных), в Telegram
      добавляем прод-домен.

#### Шаг 19. Ручная приёмка
- [ ] Для каждого провайдера: новый пользователь → онбординг → страница; повторный вход.
- [ ] Редактирование профиля, смена фото и username, удаление аккаунта, 404, мобильные
      устройства, тёмная тема.

### Этап G. После MVP (по согласованию)

- OG-превью ссылок на личные страницы (`generateMetadata` + `opengraph-image`). Мессенджеры и соцсети
  читают мета-теги из серверного HTML, поэтому это будет единственное осознанное исключение
  из правила «без server components».
- Привязка нескольких способов входа к одному аккаунту (manual identity linking в Supabase).
- Собственный домен для Supabase Auth: на экране согласия Google будет виден домен сайта вместо
  `<ref>.supabase.co`.
- Rate limiting API, модерация и жалобы, QR-код страницы, статистика кликов, темы оформления
  страницы.
- Тесты (unit и e2e) пишем только по запросу.

## 6. Что понадобится от тебя (сводка)

| Когда | Что |
|-------|-----|
| Сейчас | Подтвердить решения из раздела 3 или поправить |
| Шаг 4 | Доступ облачного окружения к `ui.shadcn.com` (или `shadcn init` локально) |
| Шаг 5 | Проекты Supabase, ключи в env, Redirect URLs, способ работы с БД (коннектор, сеть + токен или вручную) |
| Шаг 8 | Google Cloud: OAuth-клиент и экран согласия |
| Шаг 9 | Meta for Developers: приложение с Facebook Login |
| Шаг 10 | Бот в @BotFather с OpenID Connect Login |
| Шаг 18 | Vercel: env, домен; перевод Google и Facebook в прод |

Реальный вход через провайдеров проверяешь ты, на localhost или Vercel preview. Из облачной сессии
я проверяю сборку, типы, линт и API, но пройти OAuth не могу.

## 7. Риски

| Риск | Что делаем |
|------|------------|
| Связка Telegram OIDC + кастомный провайдер Supabase появилась недавно | Проверяем на шаге 10 в первую очередь, есть запасной план |
| Facebook: без Live-режима входят только тестировщики, у части аккаунтов нет email | Live на шаге 18, понятная ошибка на `/login` |
| Экран согласия Google показывает `<ref>.supabase.co` | Брендинг сразу, собственный домен Auth после MVP |
| react-hook-form + React Compiler | Используем TanStack Form |
| Client-only рендер не даёт превью ссылок в мессенджерах | Этап G, по согласованию |
| Сетевая политика облачного окружения закрывает `ui.shadcn.com`, `*.supabase.co`, `api.supabase.com` | Открыть в настройках окружения, подключить коннектор Supabase или делать эти шаги локально |
| Username совпадает с роутом сайта | Список зарезервированных имён и проверка на сервере |
| Лимит тела запроса на Vercel 4.5 МБ | Сжимаем фото на клиенте до 512 px |

## 8. Как работаем над шагом

1. Ты пишешь: «делаем шаг N».
2. Я реализую шаг и прогоняю `npm run lint`, `npm run typecheck`, `npm run build`.
3. Обновляю `README.md` (и `AGENTS.md`, если поменялись стек, роуты или правила) и отмечаю шаг здесь.
4. Коммит и push в рабочую ветку. Интеграции ты проверяешь на localhost или preview.

Юнит-тесты не пишем, пока ты не попросишь.

## 9. Ссылки

- Supabase: [кастомные OAuth/OIDC-провайдеры](https://supabase.com/docs/guides/auth/custom-oauth-providers),
  [пример настройки Telegram](https://supabase.com/docs/guides/self-hosting/self-hosted-custom-oauth-providers#example-telegram),
  [SSR-клиент для Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client),
  [Google](https://supabase.com/docs/guides/auth/social-login/auth-google),
  [Facebook](https://supabase.com/docs/guides/auth/social-login/auth-facebook),
  [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls),
  [связывание аккаунтов](https://supabase.com/docs/guides/auth/auth-identity-linking)
- Telegram: [Log In With Telegram (OIDC)](https://core.telegram.org/bots/telegram-login)
- FSD: [использование с Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs)
- shadcn/ui: [формы на TanStack Form](https://ui.shadcn.com/docs/forms/tanstack-form)
- Next.js: документация установленной версии лежит в `node_modules/next/dist/docs/`
