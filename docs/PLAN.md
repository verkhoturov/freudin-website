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
| 7 | Язык | Без i18n. Документация (README, AGENTS, план) на русском. **Обновлено 26.09.2026:** интерфейс на английском (решение 16) |
| 8 | Инфраструктура | Vercel для хостинга. Облачный Supabase для БД, Auth и Storage; лучше завести отдельные проекты для dev и prod |
| 9 | Несколько способов входа | Один способ входа = один аккаунт. Google и Facebook с одинаковым email Supabase объединит автоматически. Ручную привязку (важна для Telegram, у которого нет email) делаем после MVP |
| 10 | Прод-домен | ✅ `www.freud.in`, а `freud.in` редиректит на него |
| 11 | Дизайн | ✅ Пока минималистичный: стандартные компоненты shadcn (стиль по умолчанию, нейтральная палитра) и минимум контента — только навигация и поля ввода |
| 12 | Деплой | ✅ Пока сразу в прод: каждый коммит в `main` выкладывается на `www.freud.in`, превью-деплои Vercel не используем |
| 13 | Юрисдикция | ✅ Пока считаем, что пользователи не из РФ: 152-ФЗ не учитываем, база во Франкфурте (eu-central-1). Юридические вопросы — отдельный этап H | **Обновлено 26.09.2026:** оператор — ИП Иван Верхотуров, Грузия (ID 302260755); `/privacy` и `/terms` подчиняются праву Грузии, обязательные нормы страны пользователя (в том числе GDPR) применяются, где это требуется |
| 14 | Supabase CLI | ✅ В `devDependencies`, чтобы версия была зафиксирована |
| 15 | Зарезервированные username | ✅ Проверяет только сервер (zod): список собирается из `routes`, в БД его не дублируем |
| 16 | Язык интерфейса | ✅ Английский (решение пользователя 26.09.2026): тексты интерфейса, ошибки API, `metadata`, картинка превью и юридические тексты. Документация, комментарии в коде и планы остаются на русском. Мультиязычность не планируем, при необходимости — этап G |
| 17 | Почта поддержки | ✅ Пока `freudin.support@gmail.com` — обычный ящик Gmail без сторонних сервисов (решение пользователя 26.09.2026). Позже можно перейти на `support@freud.in` в Zoho Mail EU: инструкция в этапе H. `freudin.com` не зарегистрирован, его не покупаем |

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

Исключение — Google (шаг 8.1): он возвращает браузер на наш домен, чтобы на экране Google был
виден подтверждённый бренд Freudin, а не `<ref>.supabase.co`.

```
  → GET /api/auth/sign-in?provider=google&next=/…
      state, nonce, PKCE verifier и next — в httpOnly-cookie freudin-google-sign-in (10 минут)
      302 на accounts.google.com (redirect_uri — наш домен)
  → GET /api/auth/callback/google?code=…&state=…
      проверка state, код → токены Google (oauth2.googleapis.com/token)
      signInWithIdToken({ provider: "google", token, access_token, nonce }), cookies сессии
      302 — как в общем колбэке
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

Пункты с пометкой **(аудит)** добавлены по итогам аудита проекта 26.09.2026. Находки, которые
уже закрывают шаги плана, не дублируются: серверный рендер `/<username>` и rate limiting
(этап G), `error.tsx` и доступность (этап E2), главная для вошедшего (шаг 16), тесты (по запросу).

### Этап A. Подготовка (начинаем сразу, внешние сервисы не нужны)

**Параллельно с шагами 1–4 ты можешь** завести аккаунты и приложения, которые понадобятся позже.
Верификация у Google и Meta может занять несколько дней, поэтому лучше начать заранее:
проект Supabase (шаг 5), проект в Google Cloud, приложение в Meta for Developers, бота
в Telegram, проект в Vercel, подключённый к репозиторию. ✅ Vercel подключён: `main` выкладывается
на `www.freud.in` (решение 12).

#### Шаг 1. Правила проекта: AGENTS.md и README.md
- [x] `AGENTS.md`: управляемый блок Next.js оставляем без изменений, ниже добавляем наши правила.
      Туда входят предпочтительный стек, правила клиент/сервер, FSD (`views` вместо `pages`,
      без `features`, правила импортов, public API, `index.server.ts`), роуты (страницы и API),
      правила состояния, форм и стилей, команды проверки.
- [x] В `AGENTS.md` явно прописать процесс: после каждой итерации сверять и обновлять `README.md`
      и отмечать прогресс в `docs/PLAN.md`; юнит-тесты писать **только по запросу пользователя**.
- [x] `README.md`: описание, стек, быстрый старт, переменные окружения, скрипты, структура, роуты,
      настройка провайдеров (дополняется по ходу работы), деплой.

**Готово, когда:** агент в новой сессии без контекста чата знает, куда класть код и как проверять
изменения.

#### Шаг 2. Каркас FSD и очистка шаблона
- [x] Удалить демо-контент create-next-app (разметку `page.tsx`, SVG в `public/`, стили-заглушки).
- [x] `lang="ru"`, шрифт Geist с `subsets: ["latin", "cyrillic"]`, базовая `metadata`.
- [x] Создать слои `views`, `widgets`, `entities`, `shared/{ui,lib,api,config}` с public API.
- [x] Заглушки view для всех страниц из 4.5, тонкие `page.tsx`, `not-found.tsx`.
- [x] `shared/config/routes.ts`: все пути в одном месте.
- [x] Границы слоёв в Biome через `noRestrictedImports` в `overrides`. Запрещаем импорты «вверх»
      по слоям, импорты в обход public API и `@supabase/*` вне серверного кода.
- [x] Пакет `server-only`; скрипт `typecheck` = `next typegen && tsc --noEmit`.

**Готово, когда:** `npm run lint`, `npm run typecheck` и `npm run build` проходят, а все роуты
открываются заглушками.

#### Шаг 3. Клиентская инфраструктура и каркас API
- [x] Установить `@tanstack/react-query` (+ devtools) и `zod`. `zustand` и `@tanstack/react-form`
      ставим на шаге 13, где они впервые нужны.
- [x] `src/app/_providers`: `QueryClientProvider` (devtools только в dev).
- [x] `shared/api`: `apiClient` (JSON и FormData, единый `ApiError` со статусом, кодом и ошибками
      по полям) и фабрика `QueryClient` (4xx не ретраим).
- [x] `src/app/api/_lib`: хелперы ответов и ошибок, разбор тела запроса через zod.
- [x] `GET /api/health` как первый сквозной запрос клиент → API.
- [x] Env: `shared/config/env.server.ts` с zod-валидацией. Валидация ленивая, чтобы `next build`
      не требовал секретов. Добавить `.env.example` и исключение `!.env.example` в `.gitignore`.

**Готово, когда:** страница-заглушка получает `/api/health` через TanStack Query.

#### Шаг 4. Дизайн-система и каркас вёрстки
- [x] `npx shadcn init` с алиасами под FSD в `components.json`: `ui → @/shared/ui`,
      `utils → @/shared/lib/utils`, `lib → @/shared/lib`, `hooks → @/shared/lib/hooks`.
      База Radix, пресет `b2fA`: стиль по умолчанию (nova), нейтральная палитра, Geist, lucide.
      Сначала был Maia с фиолетовым акцентом, по решению пользователя заменён на стандартный.
- [x] Тема: нейтральная палитра без акцента, Geist. Светлая и тёмная версии (`next-themes`),
      переключатель в шапке.
- [x] Базовые компоненты: button, card, input, textarea, label, field, avatar, dropdown-menu,
      dialog, alert-dialog, select, skeleton, separator, sonner, tooltip.
- [x] Иконки: `lucide-react` для интерфейса. Логотипы соцсетей и провайдеров берём отдельными
      SVG (simple-icons или свои по брендбукам), потому что бренд-иконки в lucide устарели.
- [x] `widgets/header` (логотип и «Войти», пока без логики), `widgets/footer` (ссылки на
      `/privacy`, `/terms`), общий контейнер страниц. Вёрстка mobile-first.

**Готово, когда:** все заглушки выглядят единообразно в обеих темах и на мобильных.

SEO-база (сделана по итогам ревью вёрстки):
- [x] Домен `www.freud.in` в `siteConfig`, `metadataBase`, Open Graph и карточка Twitter
      по умолчанию.
- [x] Картинка превью `src/app/opengraph-image.jpg` (1200×630) с alt-текстом.
- [x] `noindex, follow` для `/login`, `/onboarding` и `/settings`.
- [x] Canonical для `/`, `/privacy` и `/terms`.
- [x] `robots.txt` и `sitemap.xml` с публичными статическими страницами.

**Нужно от тебя:** облачному окружению нужен доступ к `ui.shadcn.com` — ✅ открыт.

### Этап B. Supabase

#### Шаг 5. Проект Supabase (делаешь ты по чек-листу)
- [x] Создать проект в регионе поближе к аудитории: `freudin_data`, eu-central-1 (Франкфурт).
- [x] Взять Project URL, publishable key (`sb_publishable_…`) и secret key (`sb_secret_…`).
      Положить их в `.env` и в Vercel (окружение Production). В чат ключи не присылай.
      Проверено: ключи приложения, пароль БД и токен Management API работают.
- [x] Authentication → URL Configuration: Site URL = `https://www.freud.in`. Редиректы на этот
      адрес Supabase разрешает без списка, поэтому в Redirect URLs достаточно добавить
      `http://localhost:3000/**` для локальной разработки.
- [x] Выбрать, как я буду работать с БД. **Выбрано: переменные окружения + Supabase CLI.**
- [ ] Только для облачной сессии: добавить в её настройки переменные `SUPABASE_URL`,
      `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `GOOGLE_CLIENT_ID`,
      `GOOGLE_CLIENT_SECRET` (для приложения), а также
      `SUPABASE_ACCESS_TOKEN` и `SUPABASE_DB_PASSWORD` (для миграций и генерации типов).
      Пока работаем локально, это не нужно.
- [x] (аудит) **Делаешь ты:** выключить провайдер Email в Supabase → Authentication →
      Sign In / Providers. Он не используется, но включён и открывает регистрацию в обход OAuth.
      Проверено через `/auth/v1/settings`: `email: false`, включён только Google.
- [x] (аудит) **Делаешь ты:** проверить план Supabase. На Free проект засыпает после недели без
      активности, и нужно убедиться, что для прода есть бэкапы (или делать регулярный дамп).
      **Решено:** тариф Free, копии делаем сами командой `npm run db:dump` (`scripts/db-dump.sh`:
      роли, схема и данные в `backups/`, без сессий и токенов). Нужен ли Pro, решаем перед
      публичным запуском (шаг 18).

#### Шаг 6. Схема БД и Storage
- [x] `supabase/config.toml` и миграции: Supabase CLI в `devDependencies` (решение 14), проект
      привязан через `supabase link`. CLI сам читает переменные из `.env`. Прямой адрес БД
      доступен только по IPv6, поэтому CLI и `psql` ходят через пулер
      `aws-0-eu-central-1.pooler.supabase.com`. Из облачной сессии порты Postgres недоступны,
      поэтому там миграции применяются через Management API.
- [x] Миграция `profiles` по модели 4.3: CHECK-ограничения, уникальность username, триггер
      `updated_at`, RLS-политики, права ролей (`anon` — только чтение, `authenticated` — чтение,
      создание и изменение).
- [x] Миграция Storage: bucket `avatars` с политиками на `storage.objects`.
- [x] Обе миграции проверены на боевой базе в транзакции с откатом: SQL применяется,
      CHECK-ограничения отклоняют невалидные данные.
- [x] Применить миграции: `npm run db:push`. **Делаешь ты:** применять миграции к боевой базе мне
      не дают права сессии.
- [x] Скрипт `db:types`, типы лежат в `src/shared/api/supabase/database.types.ts`.
- [x] Advisors (безопасность и производительность): замечаний нет.
- [x] (аудит) Миграция: роль `anon` читает из `profiles` только публичные колонки (`username`,
      `display_name`, `bio`, `avatar_path`, `social_links`), без `id` и дат. Проверку адреса
      для этого перевести с `select("id")` на `select("username")`. Это вторая линия защиты:
      publishable key в браузер не попадает. Миграция `20260926083941_restrict_anon_profile_columns`
      применена 26.09.2026. Проверено на проде: гостю `select=id` и `select=*` дают 42501,
      публичный профиль и проверка адреса работают.

**Готово, когда:** таблица и bucket созданы, advisors не показывают критичных замечаний, типы
лежат в репозитории.

#### Шаг 7. Серверный доступ к Supabase
- [x] Установить `@supabase/ssr` и `@supabase/supabase-js`.
- [x] `shared/api/supabase/server.ts`: клиент с cookies пользователя (publishable key, RLS
      действует). `admin.ts`: клиент с secret key, только для удаления аккаунта и служебных
      операций. Оба `server-only`, наружу экспортируются через `@/shared/api/index.server.ts`.
- [x] `api/_lib/auth.ts`: `requireUser()` на основе `supabase.auth.getClaims()`, при отсутствии
      сессии отвечает 401. Сетевой сбой до Supabase даёт 500, а не 401.
- [x] Минимальный `GET /api/me`: гостю 401, пользователю `{ user }` с `Cache-Control: private,
      no-store`. Профиль и подсказки добавим на шаге 8.
- [x] Проверено на прод-сборке: гость и поддельная сессия получают 401, ключей и адреса
      Supabase в клиентском бандле нет.
- [x] (аудит) Проверка заголовка `Origin` (или `Sec-Fetch-Site`) в изменяющих запросах API:
      вторая линия защиты от CSRF после cookies с `SameSite=Lax`. Сделано в `withErrorHandling`
      (`_lib/same-origin.ts`), поэтому действует на все роуты. Проверено на прод-сборке:
      `cross-site`, `same-site` и чужой `Origin` получают 403, свой сайт и curl проходят.

**Готово, когда:** `GET /api/me` отвечает гостю 401, а ключей нет в клиентском бандле.

### Этап C. Авторизация

#### Шаг 8. Общий OAuth-поток и Google
**Нужно от тебя:** в Google Cloud → Google Auth Platform настроить Branding (название, логотип,
ссылки на `/privacy` и `/terms`), Audience (External) и Data access (`openid`, `email`,
`profile`). В Clients создать Web application: в Authorized JavaScript origins указать localhost
и прод-домен, в Authorized redirect URIs указать `https://<ref>.supabase.co/auth/v1/callback`.
Client ID и Secret внести в Supabase → Auth → Providers → Google. Пока приложение в статусе
Testing, войти могут только добавленные тестовые пользователи.

- [x] `GET /api/auth/sign-in`: белый список провайдеров, `signInWithOAuth` и 302 на провайдера.
      Подключён только Google (с `prompt=select_account`), Facebook и Telegram пока ведут
      на `/login?error=auth_unavailable`.
- [x] `GET /api/auth/callback`: `exchangeCodeForSession`, проверка `next`, маршрутизация
      (онбординг или страница), ошибки отправляем на `/login?error=…`: `access_denied`,
      `auth_expired` (нет PKCE-верификатора), `oauth_failed`.
- [x] `POST /api/auth/sign-out`, `GET /api/me` → `{ user, profile | null, suggestions }`.
      Подсказки — имя, фото и адрес страницы из данных провайдера.
- [x] `entities/viewer`: `useViewerQuery`, `useSignOutMutation`, гард приватных страниц
      (скелетон, пока идёт загрузка, затем редирект). `/onboarding` и `/settings` за гардом,
      вошедшего пользователя `/login` уводит дальше.
- [x] `widgets/sign-in-panel` (кнопки Google, Facebook, Telegram с логотипами), `views/login`
      с показом ошибок из `?error=`.
- [x] `widgets/header`: гость видит «Войти», пользователь видит меню (аватар, «Моя страница»,
      «Настройки», «Выйти»; без профиля — «Создать страницу»).
- [x] Cookies сессии `httpOnly`. Проверено на прод-сборке: редирект к Supabase с PKCE,
      все ветки ошибок, выход без сессии, open redirect через `next` отсекается.
- [x] Пройти вход и выход через Google на localhost, затем на проде. Google в Supabase уже
      включён: аудит проверил, что `/auth/v1/authorize` ведёт на Google. Пройдено 26.09.2026
      на localhost и на проде.
- [x] (аудит) На `/login` показывать только подключённых провайдеров: сейчас кнопки Facebook
      и Telegram на проде ведут на «Способ входа недоступен». Список подключённых провайдеров
      держать в одном месте для клиента и сервера. Сделано: `enabledAuthProviders`
      в `entities/viewer/config/auth-providers.ts` читают и `sign-in-panel`, и
      `getOAuthSignInUrl`.
- [x] **Делаешь ты:** Supabase → Authentication → Sign In / Providers → Google → выключить
      Skip nonce check. Он нужен только для входа по ID-токену без nonce (iOS, One Tap),
      а проверку токенов ослабляет. Выключен 26.09.2026, проверено через Management API.
      С шага 8.1 вход по ID-токену есть, но мы передаём nonce, поэтому опция остаётся
      выключенной.

**Готово, когда:** вход и выход через Google работают на localhost и на проде, сессия
переживает перезагрузку страницы.

#### Шаг 8.1. Название сайта на экране Google
Сейчас на экране выбора аккаунта Google написано «Переход в приложение
`<ref>.supabase.co`». Название приложения Google показывает только после проверки бренда,
а до неё — домен адреса возврата. Подтвердить владение `supabase.co` нельзя, поэтому Google
возвращает браузер на наш домен (решение пользователя 26.09.2026). Свой домен для Supabase Auth
делает то же, но требует тариф Pro и дополнение Custom Domain (около $35 в месяц).

- [x] Код: `/api/auth/sign-in` при заданных `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` ведёт
      прямо на Google, `/api/auth/callback/google` проверяет `state`, меняет код на токены
      и создаёт сессию через `signInWithIdToken` (Supabase проверяет подпись, `aud` и `nonce`).
      Без переменных Google работает через OAuth Supabase, как раньше. Cookie
      `freudin-google-sign-in` добавлена в `/privacy`. Сделано 26.09.2026. Проверено на
      прод-сборке с фейковым клиентом: параметры запроса к Google, атрибуты cookie, отмена
      входа, чужой `state`, нет или испорчена cookie, отказ Google принять код. Запасной путь
      без переменных не изменился.
- [x] **Делаешь ты:** Google Cloud → Clients → OAuth-клиент → Authorized redirect URIs:
      `https://www.freud.in/api/auth/callback/google` и
      `http://localhost:3000/api/auth/callback/google`. Старый адрес Supabase пока оставить.
      Проверено 26.09.2026: оба адреса Google уже принимает.
- [x] **Делаешь ты:** проверить вход на localhost (`GOOGLE_*` уже есть в `.env`): на экране
      Google виден `localhost`, после входа тот же аккаунт и профиль, что раньше.
- [x] **Делаешь ты:** задать `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` в Vercel → Settings →
      Environment Variables (Production), закоммитить и проверить вход на проде: на экране
      Google должно быть `www.freud.in`. Проверено 26.09.2026: прод ведёт на Google
      с адресом возврата `https://www.freud.in/api/auth/callback/google`.
- [x] **Делаешь ты:** Google Search Console → добавить ресурс «Домен» `freud.in` и подтвердить
      его TXT-записью в DNS Timeweb. Аккаунт — тот же, что владеет проектом в Google Cloud.
- [x] **Делаешь ты:** Google Auth Platform → Branding: Authorized domains — только `freud.in`
      (убрать `<ref>.supabase.co`). Проверить, что заполнены название Freudin, домашняя
      страница, `/privacy`, `/terms` и контакты. Затем Verification Center → отправить бренд
      на проверку. **Сделано 26.09.2026:** «Your branding has been verified and is being shown
      to users», на экране Google и локально, и на проде написано Freudin.
- [x] Я: после перехода на прод сделать `GOOGLE_*` обязательными и убрать запасной путь
      Google через OAuth Supabase. Facebook и Telegram остаются на нём. Сделано 26.09.2026:
      `getOAuthSignInUrl` по типу не принимает Google, пункт о cookies `sb-…-code-verifier`
      убран из `/privacy` (без OAuth Supabase их сейчас никто не ставит).
- [ ] **Делаешь ты:** Google Cloud → Clients → OAuth-клиент → Authorized redirect URIs: удалить
      `https://<ref>.supabase.co/auth/v1/callback`, он больше не нужен (26.09.2026 ещё был
      на месте). В Supabase провайдер Google не выключать: по нему проверяются ID-токены.

**Готово, когда:** на экране выбора аккаунта Google написано «Freudin» (после проверки бренда),
а до неё — `www.freud.in`.

#### Инструкция: подтверждение `freud.in` в Google Search Console

DNS домена обслуживает Timeweb. Сейчас у `freud.in` одна TXT-запись — SPF
`v=spf1 include:_spf.timeweb.ru ~all` (проверено 26.09.2026). Её и записи сайта (A
`216.198.79.1`, CNAME `www` на Vercel) не трогаем, а подтверждение добавляем отдельной записью.

1. **Аккаунт.** Открой https://search.google.com/search-console под тем Google-аккаунтом,
   который владеет проектом в Google Cloud (роль Owner или Editor). Проверка бренда
   засчитывает только домены, подтверждённые таким аккаунтом.
2. **Ресурс.** Добавить ресурс → слева тип **«Доменный ресурс»** → `freud.in` (без `https://`
   и без `www`). Такой ресурс покрывает и `www.freud.in`. Тип «Ресурс с префиксом в URL»
   не подходит.
3. **Код.** Search Console покажет запись вида `google-site-verification=…`. Скопируй её
   целиком и не закрывай окно.
4. **TXT в Timeweb.** Домены → `freud.in` → DNS-записи → Добавить запись:
   - тип — TXT;
   - поддомен (хост) — пустой или `@`, то есть сам `freud.in`;
   - значение — скопированная строка `google-site-verification=…`, без кавычек;
   - TTL — по умолчанию.

   SPF-запись не редактируй: у домена может быть несколько TXT-записей, а подтверждение
   Google — отдельная.
5. **Ожидание.** Обычно запись видна через несколько минут, иногда через несколько часов.
   Проверить можно командой `dig +short TXT freud.in`: в ответе должны быть обе строки,
   SPF и `google-site-verification`.
6. **Подтвердить.** Вернись в Search Console и нажми «Подтвердить». Если запись ещё не видна,
   закрой окно: ресурс останется в списке неподтверждённым, и проверку можно повторить позже.
7. **Не удалять.** Google периодически перепроверяет запись. Без неё домен снова станет
   неподтверждённым, и проверка бренда слетит.
8. **Дальше.** Google Auth Platform → Branding → Authorized domains: `freud.in`. Домен уже
   должен считаться подтверждённым. Заодно в Search Console → Файлы Sitemap отправь
   `https://www.freud.in/sitemap.xml`: это ускорит индексацию.

#### Шаг 9. Meta (Facebook Login)
**Нужно от тебя:** на developers.facebook.com создать приложение с use case «Authenticate and
request data from users with Facebook Login» и разрешениями `public_profile` и `email`.
В Facebook Login → Settings → Valid OAuth Redirect URIs указать
`https://<ref>.supabase.co/auth/v1/callback`. App ID и Secret внести в Supabase → Providers →
Facebook.

- [x] Страницы `/privacy` и `/terms` с разделом «Удаление данных». Они нужны Meta для Live-режима
      и Google для брендинга. Тексты перенесены в этап H (юридические требования).
- [x] Кнопка Facebook в `sign-in-panel`.
- [ ] Обновить `/privacy` и `/terms`: вход через Facebook и какие данные он передаёт. В список
      cookies вернуть `sb-…-code-verifier`: его ставит OAuth Supabase на время входа. В Meta
      for Developers указать Data Deletion Instructions URL
      `https://www.freud.in/privacy#account-and-data-deletion`.
- [ ] Добавить `facebook` в `enabledAuthProviders`: тогда появится кнопка на `/login` и заработает
      `/api/auth/sign-in?provider=facebook`.
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
- [x] Кнопка Telegram.
- [ ] Обновить `/privacy` и `/terms`: вход через Telegram и какие данные он передаёт. В список
      cookies вернуть `sb-…-code-verifier`, если его ещё нет: его ставит OAuth Supabase на время
      входа.
- [ ] Добавить `telegram` в `enabledAuthProviders`. Маппинг `telegram` → `custom:telegram`
      в `auth.server.ts` уже есть.
- [ ] Приведение метаданных провайдеров к единому виду: имя, аватар, подсказка username.
      У Telegram — `preferred_username`, у Google и Facebook — транслит имени (`anna-smirnova`).
      (аудит) Часть email до `@` — только запасной вариант: сейчас подсказка берётся из email,
      и публичный адрес выдаёт логин почты (`ivan.petrov1987@…` → `ivanpetrov1987`).

**Готово, когда:** вход через Telegram создаёт пользователя без email и ведёт на онбординг.

**Запасной план:** если связка Telegram OIDC + Supabase не заработает, используем Telegram Login
SDK на клиенте, проверяем `id_token` по JWKS в `POST /api/auth/telegram` и создаём сессию через
admin API.

### Этап D. Профиль

#### Шаг 11. Сущности и API профиля
- [x] `entities/social-link`: справочник платформ (Telegram, Instagram, Facebook, VK, X, YouTube,
      TikTok, LinkedIn, Threads, «Сайт»). Для каждой платформы: название, допустимые домены,
      нормализация `@handle` → URL, zod-схема, кнопка ссылки. Иконок нет (решение 11).
- [x] `entities/profile`: типы, zod-схемы (общие для формы и API), правила username,
      `profileQueries.detail`, `ProfileAvatar`. Зарезервированные имена лежат
      в `shared/config/reserved-usernames.ts`: служебные слова и сегменты всех роутов из `routes`.
- [x] `entities/profile`: проверка доступности username (`usernameQueries`), серверные функции
      БД в `index.server.ts`: чтение по username, проверка username, создание и обновление.
      Мутации создания и обновления лежат в `entities/viewer`: они обновляют кеш `/api/me`,
      а `viewer` уже зависит от `profile` через `@x` (обратный импорт дал бы цикл).
- [x] Роуты `POST /api/profile`, `PATCH /api/profile` (только переданные поля),
      `GET /api/profiles/[username]`, `GET /api/usernames/[username]`. Публичные роуты читают
      через клиент без сессии `createSupabasePublicClient()`. Демо-профиль `demo` отдаётся из кода.
- [x] Пройти создание и обновление профиля с настоящей сессией (после включения Google, шаг 8).
      Из облачной сессии проверены чтение, 404, 400 и 401. 26.09.2026 вживую проверены
      создание (онбординг новым аккаунтом) и обновление: имя, адрес, соцсети.

**Готово, когда:** профиль создаётся, читается и обновляется через API. Невалидные данные дают 400
с ошибками по полям, занятый username даёт 409.

#### Шаг 12. Фото профиля
- [x] `POST /api/profile/avatar`: multipart, jpeg/png/webp, не больше 2 МБ. Формат проверяется
      по сигнатуре файла, а не по заголовку. Файл сохраняется в `avatars/<user_id>/<uuid>.<ext>`
      (расширение по формату), старый удаляется. `DELETE /api/profile/avatar`.
- [x] Клиент: выбор файла, кроп 1:1 (`react-easy-crop`, масштаб слайдером), сжатие до 512×512
      через canvas: WebP, а где браузер его не кодирует — JPEG.
- [x] Кнопка «Взять фото из аккаунта»: `POST /api/profile/avatar` с JSON `{ "source": "provider" }`.
      Сервер берёт адрес фото из данных провайдера в сессии (не из запроса), скачивает его только
      с хостов провайдеров (в том числе при редиректах), с таймаутом и лимитом 2 МБ, и сохраняет
      в Storage. У Google запрашиваем 512 px вместо 96.
- [x] ~~`next.config.ts`: `images.remotePatterns`~~ — не нужно: фото показывает `Avatar`
      из shadcn обычным `<img>`, а не `next/image`.
- [x] Пройти загрузку, копирование фото провайдера и удаление с настоящей сессией (после шага 8).
      Пройдено вживую 26.09.2026: загрузка, кроп, «Взять фото из аккаунта», «Убрать фото».
      Локально превью фото Google падало с 429: Google ограничивает запросы с `Referer`
      от `localhost`. Исправлено: `ProfileAvatar` грузит фото с `referrerPolicy="no-referrer"`,
      проверено локально.
- [x] (аудит) Ограничить размеры фото на сервере: прямым запросом к API в обход кропа можно
      загрузить PNG до 2 МБ любых размеров (например, 20000×20000), и его будет открывать браузер
      каждого посетителя. Варианты: перекодировать фото через `sharp` (заодно уберёт EXIF)
      или хотя бы проверять размеры по заголовку файла. Сделано без зависимостей: размеры читаются
      из заголовка PNG, JPEG и WebP (`lib/read-image-size.ts`), больше 1024×1024 — 400. Проверено
      на восьми сгенерированных файлах, включая PNG 20000×20000 весом 1,2 МБ.

#### Шаг 13. Онбординг (регистрация профиля)
- [x] Установить `@tanstack/react-form` и `zustand` (через npm 11).
- [x] `widgets/profile-form` (TanStack Form + zod + shadcn `Field`). Поля: фото, имя, ссылка
      `<домен>/<username>` с проверкой доступности (debounce 400 мс), описание со счётчиком
      символов, соцсети (добавить или удалить, выбрать платформу). Ошибки сервера по полям
      (400, 409) показываются у полей. Форма готова и для настроек (шаг 15): `currentUsername`,
      `currentAvatarUrl`.
- [ ] ~~Живое превью карточки~~ — отложено: пока дизайн минималистичный (решение 11).
- [x] Предзаполнение полей из данных провайдера: имя, адрес страницы и фото.
- [x] Zustand: черновик онбординга (`persist` в sessionStorage), чтобы ввод не терялся
      при перезагрузке. Черновик привязан к пользователю, фото в нём не хранится.
- [x] `views/onboarding`: гостя отправляем на `/login`, пользователя с профилем — на его
      страницу `/<username>` (а не на `/settings`: так после создания профиля гард сам ведёт
      на новую страницу). Профиль и фото сохраняются одной мутацией, затем тост «Страница готова»
      с кнопкой «Скопировать ссылку». Если фото не загрузилось, страница всё равно создаётся.
- [x] Пройти онбординг с настоящей сессией (после шага 8). Из облачной сессии сценарий проверен
      в браузере на прод-сборке с подменёнными ответами API. Пройдено вживую 26.09.2026.
- [x] (аудит) Если профиль уже создан (409 «Страница уже создана»: например, ответ на первую
      отправку не дошёл), перезапрашивать `/api/me`, чтобы гард увёл на страницу. Сейчас
      пользователь остаётся на онбординге до перезагрузки. Сделано: `useCreateProfileMutation`
      инвалидирует `/api/me` при 409 без `fields.username`.
- [x] (аудит) Показывать «Адрес свободен», когда проверка адреса прошла. Проверено вживую
      26.09.2026.

#### Шаг 14. Публичная страница `/<username>`
- [x] `widgets/profile-card` + `views/profile`: фото (или инициалы), имя, описание с переносами
      строк, кнопки соцсетей во всю ширину. Кнопка «Поделиться» (Web Share API, иначе
      копирование ссылки).
- [x] Владелец видит кнопку «Редактировать» (ведёт на `/settings`): его профиль из `useViewerQuery`
      совпадает с открытой страницей.
- [x] Состояния: скелетон при загрузке, 404, ошибка с кнопкой «Повторить».
- [x] Заголовок вкладки = имя пользователя.
- [x] (аудит) Баг: после ухода со страницы профиля заголовок вкладки становится «Freudin»
      вместо заголовка новой страницы (проверено на `/privacy` и главной). Причина: при
      размонтировании профиль перезаписывает `document.title`, который уже выставил Next.
      Исправлено: профиль возвращает прежний заголовок, только если он ещё свой.
- [x] (аудит) Кнопки соцсетей подписаны только платформой: две ссылки «Сайт» неотличимы,
      ника не видно. Показывать ник или домен: `Telegram · @anna`, `example.com`.
- [x] (аудит) Адрес в другом регистре (`/Anna`) открывается, но не заменяется на `/anna`:
      дубли страницы и отдельные записи в кеше. Заменять адрес на канонический. Сделано:
      запрос идёт по адресу в нижнем регистре, строка адреса меняется через `history.replaceState`.
      Пункты шага 14 проверены headless Chromium на прод-сборке: `/Demo` → `/demo`, заголовки
      вкладки при переходах и «Назад», подписи ссылок.

#### Шаг 15. Настройки и управление аккаунтом
- [x] `views/settings`: `profile-form` в режиме редактирования. При смене username под полем
      предупреждаем, что старая ссылка перестанет работать. В `PATCH /api/profile` уходят только
      изменённые поля (`getProfileChanges` сравнивает нормализованные значения), фото меняется
      или удаляется отдельными запросами. Без изменений запросов нет. После сохранения форма
      берёт начальные значения из обновлённого профиля.
- [x] `widgets/account-settings`: способ входа (провайдер из `app_metadata` и email), «Выйти»,
      «Удалить аккаунт» (AlertDialog с подтверждением) → `DELETE /api/me`. Сначала удаляются
      файлы из Storage, затем пользователь через admin API; профиль удаляется каскадно, cookies
      сессии очищаются. После удаления страница перезагружается на главную.
- [x] Пройти редактирование и удаление аккаунта с настоящей сессией (после шага 8). Из облачной
      сессии сценарии проверены в браузере на прод-сборке с подменёнными ответами API.
      Пройдено вживую 26.09.2026.
- [x] (аудит) Баг: «Сохранить» без изменений показывает «Изменения сохранены», хотя запросов
      не было. Кнопка неактивна, пока в форме и фото нет изменений. Проверено вживую 26.09.2026:
      кнопка неактивна без изменений, `t.me/anna` → `@anna` даёт «Изменений нет».
- [x] (аудит) Предупреждать о несохранённых изменениях при уходе со страницы настроек. Закрытие
      и перезагрузка вкладки — окно браузера, ссылки сайта — `confirm`; «Назад» не перехватывается.
      Проверено вживую 26.09.2026.
- [x] (аудит) Удаление аккаунта: если удаление пользователя упадёт после удаления файлов,
      в профиле останется ссылка на удалённое фото. Сначала обнулять `avatar_path` или удалять
      пользователя первым, а файлы — после. Сделано: `removeUserAvatarFiles` сначала обнуляет
      `avatar_path`.

### Этап E. Интерфейс

#### Шаг 16. Главная страница
- [x] Минимальная главная (решение 11): заголовок, кнопки «Войти» и «Пример страницы».
      Лендинг с примером карточки и блоком «как это работает» — позже, если решим.
- [x] SEO: описательные `title` и `<h1>` главной вместо просто «Freudin».
- [ ] Авторизованный пользователь видит «Моя страница» или «Завершить регистрацию».

### Этап E2. Полировка

Бывший шаг 17, разбит на шаги 17.1–17.7 (решение пользователя 26.09.2026). Их можно делать
в любом порядке, но английский интерфейс (17.4) — до вычитки текстов (17.5) и до текстов
этапа H. Номера шагов 18–19 и буквы этапов F–H не меняем: на них ссылаются README,
AGENTS.md и сообщения коммитов.

#### Шаг 17.1. Доступность и адаптив
- [ ] Клавиатура: видимый фокус у всех интерактивных элементов и понятный порядок обхода. Меню
      в шапке, выбор соцсети, кроп фото и диалог удаления аккаунта работают без мыши.
- [ ] Семантика и aria: подписи у полей и у кнопок без текста, `aria-live` для статусов,
      осмысленный `alt` у фото, заголовки по порядку.
- [ ] Контраст по WCAG AA (обычный текст не меньше 4.5:1) в светлой и тёмной темах, в том числе
      у приглушённого текста, ошибок и плейсхолдеров.
- [ ] Адаптив: экраны от 320 px и масштаб 200% без горизонтальной прокрутки. Длинные имена,
      описания и ссылки не ломают вёрстку.
- [ ] Автоматическая проверка axe в headless Chromium по всем страницам (я). Проверка
      с VoiceOver — по желанию (ты).

**Готово, когда:** axe не находит нарушений, а все сценарии проходятся с клавиатуры.

#### Шаг 17.2. Ошибки и состояния
- [ ] `error.tsx` и `global-error.tsx`: своя страница ошибки с кнопкой «Try again» и адресом
      поддержки (`SupportEmailLink`) вместо
      стандартной страницы Next. Это файлы роутинга, их добавим в правила AGENTS.md.
- [ ] Единые состояния на всех экранах: скелетоны при загрузке, пустые состояния, ошибка загрузки
      с кнопкой «Try again».
- [ ] Сбой сети и таймауты `apiClient` (`network_error`): понятные тексты, без обрыва форм.
- [ ] Тосты: единые тексты и длительность, без дублей.
- [ ] Ожидание при входе: после клика по кнопке провайдера показывать в ней спиннер и текст
      «Redirecting to Google…», а все кнопки входа делать неактивными, чтобы не было повторного
      клика. Сейчас кнопка никак не реагирует: `/api/auth/sign-in` на проде отвечает
      за ~0,4 с (замер 26.09.2026), при холодном старте функции дольше. Состояние сбрасывать
      на `pageshow` с `persisted`: иначе при «Назад» со страницы провайдера браузер достанет
      страницу из bfcache с крутящимся спиннером. Клик с Cmd/Ctrl открывает новую вкладку,
      состояние он не включает.
- [ ] Ожидание при выходе: сейчас пункт меню закрывается, и до перезагрузки страницы ничего
      не видно. Показывать «Signing out…» тостом из меню и спиннером на кнопке в настройках.
- [ ] Единый индикатор ожидания в кнопках: `Spinner` из shadcn (`npx shadcn add spinner`) рядом
      с текстом («Saving…», «Deleting…», «Signing out…»), кнопка неактивна, пока идёт запрос.
      Сейчас у части кнопок только текст, у части — ничего.
- Не делаем: отдельный экран-лоадер между провайдером и сайтом (там только серверные редиректы,
  наша страница в это время не отображается, а промежуточная страница добавила бы ещё
  один переход) и полосу загрузки при переходах (страницы открываются мгновенно, данные
  закрыты скелетонами). На `/login` кнопки не прячем, пока грузится `/api/me`: гость, которых
  там большинство, ждал бы их лишние ~0,4 с.

**Готово, когда:** на любом экране сбой API или ошибка рендера дают понятное сообщение и способ
повторить, а каждое действие с ожиданием (вход, выход, сохранение, удаление) сразу показывает,
что запрос идёт.

#### Шаг 17.3. Favicon и логотип
- [ ] Логотип: сейчас в шапке название «Freudin» текстом. Решить, нужен ли знак при
      минималистичном дизайне (решение 11).
- [ ] Иконки сайта: `src/app/icon.svg` (или `.png`) вместо стандартного `favicon.ico`
      из create-next-app, `apple-icon.png` 180×180. Версию для тёмной темы — по необходимости.
- [ ] `src/app/manifest.ts`: название, цвета темы, иконки 192 и 512 px. Статические metadata-файлы
      добавим в правила AGENTS.md.
- [ ] **Нужно от тебя:** утвердить вариант иконки и логотипа, который я предложу, или дать свой
      в SVG.

#### Шаг 17.4. Английский интерфейс
Решение 16: весь интерфейс на английском, русский не остаётся.

- [x] Правила: в AGENTS.md и README записать, что тексты интерфейса и `message` ошибок API
      пишем на английском, а документацию и комментарии — по-прежнему на русском.
- [x] Каркас: `lang="en"`, `openGraph.locale: "en_US"`, `siteConfig` (описание), `title`
      и `description` всех страниц, `opengraph-image.alt.txt`.
- [x] Картинка превью `opengraph-image.jpg`: на ней подзаголовок по-русски, нужна английская
      версия того же размера (1200×630). Перерисована в той же сетке и тем же шрифтом Geist.
- [x] Тексты интерфейса во всех слоях (около 50 файлов): подписи, плейсхолдеры, тосты,
      `confirm`, `aria-label`, `alt`, пустые состояния и 404. В справочнике соцсетей
      «ВКонтакте» → «VK», «Сайт» → «Website».
- [x] Ошибки: тексты ошибок входа (`auth-errors.ts`), `message` в ответах API, сообщения
      zod-схем, `ApiError` на клиенте (`network_error`). Логи сервера тоже на английском.
- [x] Кириллицу в шрифте Geist оставляем: имена и описания пользователей могут быть на любом
      языке. Транслитерация подсказки адреса из кириллического имени тоже остаётся.
- [x] Юридические тексты уже на английском. Названия, на которые они ссылаются (Settings →
      Delete account), должны совпасть с новыми подписями интерфейса.
- [x] Проверка: в строках `src` не осталось кириллицы (кроме комментариев), все страницы
      просмотрены в обеих темах. Сделано 26.09.2026, проверено в headless Chromium.

**Готово, когда:** на сайте нет русского текста, кроме пользовательских данных, а правила
в AGENTS.md обновлены.

#### Шаг 17.5. Вычитка текстов
- [ ] Все английские тексты интерфейса, сообщения ошибок API, `title` и `description` страниц:
      единый тон, американский вариант английского, sentence case в кнопках и заголовках,
      короткие понятные формулировки.
- [ ] Одинаковые подписи кнопок и полей на онбординге и в настройках.
- [ ] **Нужно от тебя:** вычитать итоговую таблицу текстов, которую я соберу.

#### Шаг 17.6. Вес JS и библиотеки
- [ ] (аудит) Вес JS: главная грузит 341 КБ gzip, из них 97 КБ — zod со всеми локалями.
      Импорт `import * as z from "zod"` вместо `import { z }` даёт 277 КБ (−19%, замерено).
      Дальше — убрать zod из `apiClient`: ответ с ошибкой можно проверить без схемы.
- [ ] Отчёт о составе бандла по страницам, до и после оптимизации. Инструмент — по возможности
      без новых зависимостей.
- [ ] Ленивая загрузка редких частей: кроп фото (`react-easy-crop`) — только после выбора файла,
      тяжёлые диалоги — по открытию.
- [ ] Проверить tree-shaking `radix-ui`, `lucide-react` и TanStack, а также то, что devtools
      TanStack Query не попадают в прод-сборку.

**Готово, когда:** главная и личная страница грузят заметно меньше JS; цифры до и после записаны
в этом шаге.

#### Шаг 17.7. Удаление неиспользуемого
- [ ] (аудит) Убрать неиспользуемый шрифт Geist Mono: он даёт 2 из 4 предзагрузок шрифтов
      на каждой странице.
- [ ] Неиспользуемые компоненты shadcn в `shared/ui` (сейчас нигде не импортируется `card`)
      и лишние экспорты public API слайсов.
- [ ] Неиспользуемые файлы, экспорты и зависимости: разовая проверка (например, `npx knip`)
      без добавления инструмента в проект.
- [ ] Стандартный `favicon.ico` — после шага 17.3. (`PagePlaceholder` удалён вместе с заглушками
      `/privacy` и `/terms`, этап H.)

### Этап F. Запуск

#### Шаг 18. Прод
- [x] Vercel: домен `www.freud.in` подключён, `freud.in` редиректит на него. Переменные
      окружения Production задаются раньше, на шаге 5.
- [ ] Прод-URL во всех провайдерах и в Supabase. Google переводим в «In production», Facebook
      в Live (нужны `/privacy`, `/terms` и инструкция по удалению данных), в Telegram
      добавляем прод-домен. ✅ Google в In production с 26.09.2026. Проверка бренда (название
      и логотип на экране Google) требует подтвердить домен redirect URI: Google переведён
      на свой адрес возврата на `www.freud.in` (шаг 8.1).
- [ ] (аудит) Заголовки безопасности в `next.config.ts`: `Content-Security-Policy:
      frame-ancestors 'none'` (защищает «Удалить аккаунт» от clickjacking),
      `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. Сейчас на проде
      есть только HSTS от Vercel.
- [x] (аудит) **Нужно от тебя:** Vercel → Settings → Functions → регион `fra1`. Сейчас функции
      работают в `iad1` (Вашингтон), а база во Франкфурте: каждый запрос к базе пересекает
      Атлантику (порядка 90 мс). Переключено на `fra1` 26.09.2026.
- [ ] (аудит) Мониторинг ошибок: Sentry или Vercel Observability. Сейчас есть только логи Vercel.
- [x] **Решаешь ты:** оставаться ли на Supabase Free. На Free проект засыпает после недели без
      запросов, а бэкапы делаются только вручную (`npm run db:dump`). Pro ($25 в месяц) не
      засыпает и хранит ежедневные бэкапы 7 дней. **Решено 26.09.2026:** пока Free.
- [ ] (аудит) CI в GitHub Actions (lint, typecheck, build) и защита ветки `main` (**нужно от
      тебя** в настройках GitHub). Сейчас перед продом код проверяет только сборка Vercel.
- [ ] (аудит) Отдельный проект Supabase для разработки и превью-деплои Vercel на нём: сейчас
      `npm run dev` работает с боевой базой, а миграции идут сразу в прод. Требует пересмотреть
      решения 8 и 12.

#### Шаг 19. Ручная приёмка
- [ ] Для каждого провайдера: новый пользователь → онбординг → страница; повторный вход.
- [ ] Редактирование профиля, смена фото и username, удаление аккаунта, 404, мобильные
      устройства, тёмная тема.

### Этап G. После MVP (по согласованию)

- **Серверный рендер личных страниц `/<username>`** — единственное осознанное исключение
  из правила «без server components». Сейчас данные грузятся в браузере, и из-за этого:
  - поисковики, которые не выполняют JavaScript, видят пустую страницу;
  - превью ссылки в мессенджерах и соцсетях одно на весь сайт, а не с фото и именем человека;
  - на несуществующий адрес сервер отвечает 200, а не 404 («мягкая 404»).

  Что сделать: `generateMetadata` со своими `title`, `description` и Open Graph,
  `opengraph-image` с фото и именем, настоящий 404 через `notFound()` и личные страницы
  в `sitemap.xml`.
- (аудит) Кеш публичного профиля в CDN: `s-maxage` у `GET /api/profiles/[username]` или
  `revalidateTag` после серверного рендера. Сейчас каждый просмотр страницы идёт в базу.
- (аудит) Редирект со старого адреса после смены username (например, 30 дней): ссылки,
  уже вставленные в био, продолжат работать. Сейчас настройки только предупреждают о смене.
- Разметка JSON-LD `ProfilePage` с `Person` внутри: имя, фото, описание, ссылки на соцсети
  в `sameAs`. Делаем вместе с серверным рендером, иначе поисковики увидят её не везде.
- Привязка нескольких способов входа к одному аккаунту (manual identity linking в Supabase).
- Собственный домен для Supabase Auth (тариф Pro и дополнение Custom Domain): для Google
  не нужен, это решено шагом 8.1. Понадобится, только если захотим домен сайта в адресах
  возврата Facebook и Telegram.
- Rate limiting API, модерация и жалобы, QR-код страницы, статистика кликов, темы оформления
  страницы.
- Тесты (unit и e2e) пишем только по запросу.

#### Аналитика и реклама (Google Analytics 4, Meta Pixel)
Решение пользователя 26.09.2026: пока не подключаем, тексты опубликованы без них.
- [ ] Баннер согласия на cookies с категориями (необходимые, аналитика, реклама) и ссылка
      «Cookie settings» в подвале, чтобы изменить выбор.
- [ ] GA4 с Consent Mode: до согласия не ставит cookies. Срок хранения данных в GA — 14 месяцев.
- [ ] Meta Pixel только после согласия на рекламные cookies.
- [ ] Вернуть в `/privacy` и `/terms` разделы про аналитику и рекламу из `docs/legal/*.draft.md`
      и обновить дату «Last updated».
- [ ] **Нужно от тебя:** Measurement ID из Google Analytics и Pixel ID из Meta Events Manager.

### Этап H. Юридические требования (отдельный этап)

Нужен до шага 18: без `/privacy` и `/terms` Meta не переведёт приложение в Live, а Google
не пропустит брендинг. Проверка приложений идёт днями, поэтому лучше не откладывать.
(аудит) Google в Supabase уже включён, поэтому сайт может собирать email, имя и фото: этап H
нужен до публичного анонса. С 26.09.2026 Google в статусе In production: зарегистрироваться
может любой аккаунт Google, а политики конфиденциальности ещё нет.

- [x] **Делаешь ты:** почта поддержки (решение 17). Адрес нужен для текстов `/privacy`
      и `/terms`, экрана согласия Google и приложения Meta. Сделано 26.09.2026: ящик
      `freudin.support@gmail.com`, адрес в коде и текстах. В `/privacy` и `/terms` провайдер
      почты — Gmail (Google), письма могут обрабатываться за пределами ЕС.
- [ ] **Делаешь ты:** прописать адрес в Google Branding и включить двухфакторную защиту ящика
      (инструкция ниже, после списка пунктов).
- [x] Адрес поддержки в коде: `siteConfig.supportEmail`, ссылка в подвале, контакты в текстах
      `/privacy` и `/terms`, подсказка на странице ошибки (шаг 17.2). Сделано: `SupportEmailLink`
      в `shared/ui`, адрес в подвале и в текстах; страница ошибки — в шаге 17.2.
- [x] Тексты `/privacy` и `/terms`, раздел «Удаление данных» с инструкцией для Meta. Тексты —
      на английском (решение 16).
      **Нужно от тебя:** оператор данных (ФИО, ИП или компания) и юрисдикция. Контактный
      email — `freudin.support@gmail.com`. Сделано 26.09.2026: тексты владельца опубликованы без Google
      Analytics и Meta Pixel (их на сайте нет), домен `www.freud.in` вместо `freudin.com`,
      дописаны публичный профиль, удаление аккаунта в настройках, провайдеры по именам
      (Supabase, Vercel, Gmail) и фактические cookies. Исходники с аналитикой —
      `docs/legal/*.draft.md`. Реквизиты оператора — `legalConfig` в `shared/config`, у разделов
      есть якоря (`/privacy#account-and-data-deletion`). Проверено в headless Chromium:
      один `<h1>`, заголовки по порядку, без горизонтальной прокрутки на 320 px.
- [ ] **Нужно от тебя (рекомендуется):** вычитать опубликованные тексты с юристом, особенно
      разделы, которые я дописал.
- [x] Применимое право с учётом того, что база в ЕС (eu-central-1). Если появится аудитория
      из РФ, вернуться к 152-ФЗ (см. «Риски»). Решено: право Грузии, обязательные нормы страны
      пользователя (в том числе GDPR) — где требуется (решение 13).
- [x] (аудит) Пока текстов нет, закрыть `/privacy` и `/terms` от индексации (`noindex`) и убрать
      их из `sitemap.xml`: сейчас пустые страницы индексируются. Не понадобилось: тексты
      опубликованы, страницы остаются в индексе и в `sitemap.xml`.

#### Инструкция: почта поддержки `freudin.support@gmail.com`

1. **Защита ящика.** Включи двухфакторную аутентификацию и сохрани резервные коды: через этот
   адрес пользователи просят удалить данные, доступ к нему терять нельзя.
2. **Где прописать адрес:**
   - Google Cloud → Google Auth Platform → Branding → Developer contact information:
     `freudin.support@gmail.com`. Поле User support email показывает только адрес вошедшего
     аккаунта и его Google-группы. Чтобы выбрать там ящик поддержки, добавь
     `freudin.support@gmail.com` в IAM проекта (роль Owner или Editor), войди под ним
     и выбери адрес. Можно оставить и текущий адрес;
   - Meta for Developers → приложение → App settings → Basic → Contact email (шаг 9);
   - код сайта и тексты `/privacy` и `/terms` — ✅ сделано.

#### Инструкция на потом: почта `support@freud.in` в Zoho Mail EU

Понадобится, если захочешь адрес на домене сайта и хранение писем в ЕС. После перехода поменяй
`siteConfig.supportEmail`, провайдера почты в `/privacy` (раздел 6) и `/terms` (раздел 8)
и дату «Last updated».


DNS домена `freud.in` обслуживает Timeweb (`ns1.timeweb.ru` и другие). Сейчас там MX-записи
почты Timeweb и SPF `include:_spf.timeweb.ru`: их заменяем на Zoho. Записи сайта (A
`216.198.79.1` и `www` для Vercel) не трогаем.

1. **Регистрация.** https://www.zoho.eu/mail/ → тариф Forever Free: до 5 ящиков по 5 ГБ, веб
   и мобильные приложения, без IMAP. Регистрируйся именно на `zoho.eu`, тогда данные будут
   храниться в ЕС. Если бесплатного тарифа нет, подойдёт Mail Lite (около €1 за ящик в месяц).
2. **Домен.** Admin Console → Domains → Add domain → `freud.in`. Zoho выдаст TXT-запись вида
   `zoho-verification=…`: добавь её в панели Timeweb (Домены → `freud.in` → DNS-записи)
   и нажми Verify. DNS обновляется от нескольких минут до нескольких часов.
3. **Ящик.** Создай пользователя `support@freud.in`. Сохрани пароль в менеджере паролей
   и включи двухфакторную аутентификацию.
4. **DNS-записи в Timeweb.** Сверь значения с Zoho Admin Console → Domains → `freud.in` → Email
   Configuration. Для EU они такие (проверено по DNS 26.09.2026):
   - удалить MX `mx1.timeweb.ru` и `mx2.timeweb.ru`;
   - добавить MX `mx.zoho.eu` (приоритет 10), `mx2.zoho.eu` (20), `mx3.zoho.eu` (50);
   - заменить TXT `v=spf1 include:_spf.timeweb.ru ~all` на `v=spf1 include:zohomail.eu ~all`.
     SPF-запись у домена должна быть одна;
   - DKIM: Email Configuration → DKIM → Add, селектор например `zmail`. Добавь TXT
     `zmail._domainkey` со значением от Zoho, затем нажми Verify и включи подпись;
   - DMARC: TXT `_dmarc` со значением `v=DMARC1; p=none; rua=mailto:support@freud.in`. Если за
     пару недель отчёты не покажут проблем, поменяй `p=none` на `p=quarantine`.
5. **Проверка.** Отправь письмо с личной почты на `support@freud.in` и ответь с него. Оценка
   на https://www.mail-tester.com должна быть 9–10 из 10: так видно, что SPF, DKIM и DMARC
   работают.
6. **Где прописать адрес:** те же места, что и для Gmail (инструкция выше).

## 6. Что понадобится от тебя (сводка)

| Когда | Что |
|-------|-----|
| Сейчас | Подтвердить решения из раздела 3 или поправить |
| Шаг 4 | Доступ облачного окружения к `ui.shadcn.com` — ✅ сделано |
| До шага 6 | Юрисдикция — ✅ решено: пользователи не из РФ (решение 13) |
| Шаг 5 | Проект Supabase, ключи в Vercel, URL Configuration — ✅ сделано |
| Шаг 6 | Применить миграции: `npm run db:push` — ✅ сделано |
| Шаг 5 (аудит) | Выключить провайдер Email в Supabase, проверить план и бэкапы — ✅ сделано: Free, копии через `npm run db:dump` |
| Шаг 6 (аудит) | Применить миграцию прав `anon`: `npm run db:dump`, затем `npm run db:push` — ✅ сделано |
| Шаг 8 | Google Cloud: OAuth-клиент и экран согласия, проверка входа, Skip nonce check выключен — ✅ сделано |
| Шаг 8.1 | Адреса возврата в OAuth-клиенте — ✅; проверить вход на localhost; `GOOGLE_*` в Vercel и проверка на проде; Search Console для `freud.in`; проверка бренда |
| Шаг 9 | Meta for Developers: приложение с Facebook Login |
| Этап H | Почта поддержки — ✅ `freudin.support@gmail.com`; прописать её в Google Branding и включить 2FA |
| Этап H | Для `/privacy` и `/terms`: оператор данных и юрисдикция — ✅ сделано; вычитка текстов юристом — рекомендуется |
| Шаг 10 | Бот в @BotFather с OpenID Connect Login |
| Шаг 18 | Перевод Google (✅ сделано) и Facebook в прод, прод-домен в Telegram |
| Этап E2 | Шаг 17.3: утвердить иконку и логотип или дать свои; шаг 17.5: вычитать тексты |
| Шаг 18 (аудит) | Регион функций Vercel `fra1` — ✅ сделано; тариф Supabase — ✅ пока Free; защита ветки `main` в GitHub |

Реальный вход через провайдеров проверяешь ты, на localhost или на проде. Из облачной сессии
я проверяю сборку, типы, линт и API, но пройти OAuth не могу.

## 7. Риски

| Риск | Что делаем |
|------|------------|
| Связка Telegram OIDC + кастомный провайдер Supabase появилась недавно | Проверяем на шаге 10 в первую очередь, есть запасной план |
| Facebook: без Live-режима входят только тестировщики, у части аккаунтов нет email | Live на шаге 18, понятная ошибка на `/login` |
| Экран согласия Google показывает `<ref>.supabase.co` | Свой адрес возврата на `www.freud.in` и проверка бренда (шаг 8.1) |
| Свой обмен кода Google: ошибка в проверке `state` или `nonce` ослабит вход | `state` в httpOnly-cookie на 10 минут, одноразовой; PKCE; `nonce` и подпись токена проверяет Supabase |
| react-hook-form + React Compiler | Используем TanStack Form |
| Личные страницы рендерятся на клиенте: без JavaScript поисковик видит пустую страницу, превью ссылок общее, несуществующий адрес отдаёт 200 («мягкая 404») | Серверный рендер `/<username>` и JSON-LD на этапе G, по согласованию |
| Если аудитория в РФ, 152-ФЗ требует хранить персональные данные россиян на серверах в России, а Supabase за рубежом | ✅ Решено: пока считаем, что пользователи не из РФ (решение 13). Если аудитория изменится, вернёмся к вопросу на этапе H |
| Сетевая политика облачного окружения закрывает `ui.shadcn.com`, `*.supabase.co`, `api.supabase.com` | ✅ Снято: окружению открыт полный доступ в сеть |
| Username совпадает с роутом сайта | Список зарезервированных имён и проверка на сервере |
| Лимит тела запроса на Vercel 4.5 МБ | Сжимаем фото на клиенте до 512 px |
| Каждый коммит в `main` сразу уходит в прод, превью нет, база одна для разработки и прода | Перед мержем прогоняем lint, typecheck и build; переменные окружения прода задаём до мержа кода, который их читает. CI и отдельная среда для разработки — шаг 18 (аудит) |

## 8. Как работаем над шагом

1. Ты пишешь: «делаем шаг N».
2. Я реализую шаг и прогоняю `npm run lint`, `npm run typecheck`, `npm run build`.
3. Обновляю `README.md` (и `AGENTS.md`, если поменялись стек, роуты или правила) и отмечаю шаг здесь.
4. Git: в локальной сессии (CLI, VS Code) ветки, коммиты и push делаешь ты, я git не трогаю.
   В облачной сессии я коммичу и пушу в рабочую ветку. Интеграции ты проверяешь на localhost,
   а после мержа — на проде.

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
