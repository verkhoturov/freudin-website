# План реализации Freudin

> Живой документ. Шаги отмечаем `[x]` по мере выполнения. Если по ходу меняются решения,
> стек или роуты, обновляем этот файл вместе с `README.md` и `AGENTS.md`.

## 1. Что строим (MVP)

- Регистрация и вход через **Google**, **Meta (Facebook Login)** и **Telegram**. Вход через
  **Apple** — после MVP (этап G, решение пользователя 28.09.2026).
- После первого входа идёт онбординг: пользователь указывает **фото, имя, описание**,
  выбирает **уникальную ссылку** (username) и добавляет **ссылки на соцсети**.
- Публичная личная страница `https://<домен>/<username>`.
- Редактирование профиля и управление аккаунтом: выход, удаление.

**Развитие (добавлено 28.09.2026).** Профиль дополняется данными психолога: подход, формат работы
(онлайн или офлайн), страна и город, языки и документы (шаги 20–21). На главной появляется поиск по
ним (шаг 22), у сайта — страницы «О нас» и «Контакты» (этапы I и J), UI kit в Storybook (шаг 23) и
юнит-тесты критичной логики (шаг 24). Входит ли это в MVP, то есть делается ли до ручной приёмки
(шаг 19) и публичного анонса, решает 🧑‍💻 Разработчик.

**Видение продукта (29.09.2026).** Что такое Freudin, для кого он и чего не делает, описано
в [`docs/PRODUCT.md`](PRODUCT.md). По нему добавлены шаги 29–30 (данные страницы-визитки), шаг 31
(главная из поиска, ленты и ассистента), этап K (лента постов из соцсетей) и этап L (AI-ассистент
подбора). Место этих шагов относительно MVP решает 🧑‍💻 Разработчик.

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
| 8 | Инфраструктура | Vercel для хостинга. Облачный Supabase для БД, Auth и Storage; лучше завести отдельные проекты для dev и prod. **26.09.2026:** тестовая среда со своей базой запланирована — шаг 18.9 |
| 9 | Несколько способов входа | Один способ входа = один аккаунт. Google и Facebook с одинаковым email Supabase объединит автоматически. Ручную привязку (важна для Telegram, у которого нет email) делаем после MVP. **26.09.2026:** ручная привязка в настройках запланирована в этапе C — шаг 10.2 |
| 10 | Прод-домен | ✅ `www.freud.in`, а `freud.in` редиректит на него |
| 11 | Дизайн | ✅ Пока минималистичный: стандартные компоненты shadcn (стиль по умолчанию, нейтральная палитра) и минимум контента — только навигация и поля ввода |
| 12 | Деплой | ✅ Пока сразу в прод: каждый коммит в `main` выкладывается на `www.freud.in`, превью-деплои Vercel не используем. **26.09.2026:** решено сделать тестовую среду на Vercel (шаг 18.9), после неё решение пересматриваем |
| 13 | Юрисдикция | ✅ Пока считаем, что пользователи не из РФ: 152-ФЗ не учитываем, база во Франкфурте (eu-central-1). Юридические вопросы — отдельный этап H | **Обновлено 26.09.2026:** оператор — ИП Иван Верхотуров, Грузия (ID 302260755); `/privacy` и `/terms` подчиняются праву Грузии, обязательные нормы страны пользователя (в том числе GDPR) применяются, где это требуется |
| 14 | Supabase CLI | ✅ В `devDependencies`, чтобы версия была зафиксирована |
| 15 | Зарезервированные username | ✅ Проверяет только сервер (zod): список собирается из `routes`, в БД его не дублируем |
| 16 | Язык интерфейса | ✅ Английский (решение пользователя 26.09.2026): тексты интерфейса, ошибки API, `metadata`, картинка превью и юридические тексты. Документация, комментарии в коде и планы остаются на русском. Мультиязычность не планируем, при необходимости — этап G |
| 17 | Почта поддержки | ✅ Пока `freudin.support@gmail.com` — обычный ящик Gmail без сторонних сервисов (решение пользователя 26.09.2026). Позже можно перейти на `support@freud.in` в Zoho Mail EU: инструкция в этапе H. `freudin.com` не зарегистрирован, его не покупаем |
| 18 | Токены темы | ✅ Цвета, типографика, размеры, отступы и радиусы — в `src/app/globals.css`, разбитом на разделы (решение пользователя 27.09.2026). Туда же пишет CLI shadcn, а CSS из генераторов тем вставляется как есть. Шрифт подключается в одном модуле через `next/font`, в CSS — только переменные. Шаг 17.8 |

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

Facebook, Telegram и Apple (после MVP, этап G) проходят через один OAuth-поток Supabase (PKCE):

```
[Кнопка «Войти через …»]
  → GET /api/auth/sign-in?provider=facebook|telegram|apple&next=/…
      signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } })
      PKCE verifier сохраняется в cookie, затем 302 на провайдера
  → провайдер → https://<ref>.supabase.co/auth/v1/callback
  → GET /api/auth/callback?code=…&next=…
      exchangeCodeForSession(code), cookies сессии
      302: профиля нет → /onboarding; профиль есть → next или /<username>
```

Исключения — Google (шаг 8.1) и Telegram на https (шаг 10): они возвращают браузер на наш домен,
чтобы на экране провайдера был виден сайт, а не `<ref>.supabase.co`. Код общий
(`oidc-sign-in.server.ts`), колбэк — `/api/auth/callback/[provider]`. Схема на примере Google:

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
- Данные психолога (страна, город, формат работы, с кем работает, подходы, языки, цена)
  и документы — шаг 20: колонки `profiles`, справочник городов `cities` (GeoNames), таблица
  документов и bucket `documents`. Правила полей — в пунктах 20.1–20.2.

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
| `/about` | `about` | все (этап I, запланировано) |
| `/contact` или `/contacts` | `contacts` | все (этап J, запланировано) |

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
| GET | `/api/cities?country=&q=` | поиск города в стране по справочнику GeoNames (шаг 20, запланировано) | — |
| POST | `/api/profile/documents` | загрузка изображения документа (шаг 20, запланировано) | ✓ |
| DELETE | `/api/profile/documents/[id]` | удаление документа (шаг 20, запланировано) | ✓ |
| GET | `/api/profiles?approach=&format=&country=&city=&language=` | поиск психологов на главной (шаг 22, запланировано) | — |

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

Если в шаге осталось несколько разных действий, он разбит на подшаги: `9.18`, `18.2`, `H.2`
(решение пользователя 28.09.2026). Глубже второго уровня не нумеруем: действия внутри шагов
вроде `17.2` или `18.9` остаются пунктами списка без номеров. Полностью выполненные шаги
не разбивали. Тестовая среда раньше была шагом 18.1, теперь это шаг 18.9: номера 18.1–18.8
заняли подшаги шага 18.

Новые шаги получают следующие свободные номера (20, 21, …), а новые этапы — следующие буквы (I, J).
Номер показывает порядок добавления, а место в плане — тему: шаги 20–21 стоят в этапе D, шаг 22 — в
этапе E.

В начале пункта указано, кто его делает:
- **🤖 ИИ** — агент в сессии: код, проверки, документация;
- **🧑‍💻 Разработчик** — владелец проекта: решения, действия в сторонних сервисах (у ИИ нет доступа
  к его аккаунтам), миграции боевой базы, git в локальной сессии, проверки вживую;
- **🤖 ИИ и 🧑‍💻 Разработчик** — решаем вместе.

Пункты с пометкой **(аудит)** добавлены по итогам аудита проекта 26.09.2026. Находки, которые
уже закрывают шаги плана, не дублируются: серверный рендер `/<username>` (этап G), rate limiting
(шаг 18.3), `error.tsx` и доступность (этап E2), главная для вошедшего (шаг 16), тесты (шаг 24).

Пункты с пометкой **(ревью)** добавлены по итогам ревью производительности 29.09.2026. Его главные
находки уже были в этапе G (серверный рендер `/<username>`, CDN-кеш профиля) и дополнены там.

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

**🧑‍💻 Разработчик:** облачному окружению нужен доступ к `ui.shadcn.com` — ✅ открыт.

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
- [x] ~~Только для облачной сессии: переменные окружения~~ — перенесено в шаг 18.9 (28.09.2026):
      облачной сессии нужны ключи стенда, а не прода.
- [x] (аудит) **🧑‍💻 Разработчик:** выключить провайдер Email в Supabase → Authentication →
      Sign In / Providers. Он не используется, но включён и открывает регистрацию в обход OAuth.
      Проверено через `/auth/v1/settings`: `email: false`, включён только Google.
- [x] (аудит) **🧑‍💻 Разработчик:** проверить план Supabase. На Free проект засыпает после недели без
      активности, и нужно убедиться, что для прода есть бэкапы (или делать регулярный дамп).
      **Решено:** тариф Free, копии делаем сами командой `npm run db:dump` (`scripts/db-dump.sh`:
      роли, схема и данные в `backups/`, без сессий и токенов). Нужен ли Pro, решаем перед
      публичным запуском (шаг 18.6).

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
- [x] Применить миграции: `npm run db:push`. **🧑‍💻 Разработчик:** применять миграции к боевой базе
      мне не дают права сессии.
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
**🧑‍💻 Разработчик:** в Google Cloud → Google Auth Platform настроить Branding (название, логотип,
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
- [x] **🧑‍💻 Разработчик:** Supabase → Authentication → Sign In / Providers → Google → выключить
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
- [x] **🧑‍💻 Разработчик:** Google Cloud → Clients → OAuth-клиент → Authorized redirect URIs:
      `https://www.freud.in/api/auth/callback/google` и
      `http://localhost:3000/api/auth/callback/google`. Старый адрес Supabase пока оставить.
      Проверено 26.09.2026: оба адреса Google уже принимает.
- [x] **🧑‍💻 Разработчик:** проверить вход на localhost (`GOOGLE_*` уже есть в `.env`): на экране
      Google виден `localhost`, после входа тот же аккаунт и профиль, что раньше.
- [x] **🧑‍💻 Разработчик:** задать `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` в Vercel → Settings →
      Environment Variables (Production), закоммитить и проверить вход на проде: на экране
      Google должно быть `www.freud.in`. Проверено 26.09.2026: прод ведёт на Google
      с адресом возврата `https://www.freud.in/api/auth/callback/google`.
- [x] **🧑‍💻 Разработчик:** Google Search Console → добавить ресурс «Домен» `freud.in` и подтвердить
      его TXT-записью в DNS Timeweb. Аккаунт — тот же, что владеет проектом в Google Cloud.
- [x] **🧑‍💻 Разработчик:** Google Auth Platform → Branding: Authorized domains — только `freud.in`
      (убрать `<ref>.supabase.co`). Проверить, что заполнены название Freudin, домашняя
      страница, `/privacy`, `/terms` и контакты. Затем Verification Center → отправить бренд
      на проверку. **Сделано 26.09.2026:** «Your branding has been verified and is being shown
      to users», на экране Google и локально, и на проде написано Freudin.
- [x] **🤖 ИИ:** после перехода на прод сделать `GOOGLE_*` обязательными и убрать запасной путь
      Google через OAuth Supabase. Facebook и Telegram остаются на нём. Сделано 26.09.2026:
      `getOAuthSignInUrl` по типу не принимает Google, пункт о cookies `sb-…-code-verifier`
      убран из `/privacy` (без OAuth Supabase их сейчас никто не ставит).
- [x] **🧑‍💻 Разработчик:** Google Cloud → Clients → OAuth-клиент → Authorized redirect URIs: удалить
      `https://<ref>.supabase.co/auth/v1/callback`, он больше не нужен. В Supabase провайдер
      Google не выключать: по нему проверяются ID-токены. Удалён 26.09.2026: Google отвечает
      на этот адрес `redirect_uri_mismatch`.

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
**🧑‍💻 Разработчик:** приложение в Meta for Developers и провайдер Facebook в Supabase — по
инструкции ниже, после списка пунктов.

- [x] **9.1.** Страницы `/privacy` и `/terms` с разделом «Удаление данных». Они нужны Meta для
      Live-режима и Google для брендинга. Тексты перенесены в этап H (юридические требования).
- [x] **9.2.** Кнопка Facebook в `sign-in-panel`.
- [x] **9.3. 🧑‍💻 Разработчик:** приложение в Meta for Developers и провайдер Facebook в Supabase
      (пункты 1–6 инструкции ниже). Сделано 26.09.2026. Через Management API проверено:
      провайдер включён, Client ID задан.
- [x] **9.4.** Обновить `/privacy` и `/terms`: вход через Facebook и какие данные он передаёт. В
      список cookies вернуть `sb-…-code-verifier`: его ставит OAuth Supabase на время входа. В Meta
      for Developers указать Data Deletion Instructions URL
      `https://www.freud.in/privacy#account-and-data-deletion`. Сделано 26.09.2026. В Privacy новый
      раздел 1.2 о Facebook Login, Meta в разделах 6, 7 и 9 (там же — как отвязать Freudin в
      настройках Facebook), cookie `sb-…-code-verifier`. В Terms — раздел 3 «Account registration
      and sign-in» и Facebook в разделе 8.
- [x] **9.5.** Добавить `facebook` в `enabledAuthProviders`: тогда появится кнопка на `/login` и
      заработает `/api/auth/sign-in?provider=facebook`.
- [x] **9.6.** Понятное сообщение на `/login`, если Facebook не вернул email. Сделано: без email
      Supabase возвращает `Error getting user email from external provider`, `getOAuthErrorCode`
      превращает это в код `email_required`.
- [x] **9.7.** Фото Facebook: Supabase получает его размером 50×50. Первая попытка — менять `height`
      и `width` в ссылке — не сработала (проверено вживую 26.09.2026): ссылка подписана, фото
      осталось размытым. Сделано: `/api/auth/sign-in` передаёт в адресе возврата
      `provider=facebook`. После входа колбэк по токену Facebook из сессии берёт у Graph API
      (`/me/picture`) ссылку на фото 512×512, кладёт её в `user_metadata` (`avatar_url`,
      `picture`) и обновляет сессию, чтобы `/api/me` сразу её увидел. Заглушку без фото убирает.
- [x] **9.8. 🧑‍💻 Разработчик:** проверка на localhost (пункт 7 инструкции). 26.09.2026: на экране
      Facebook — «Freudin», при другой почте создаётся новый аккаунт, фото было размытым
      (исправлено пунктом выше).
- [x] **9.9. 🧑‍💻 Разработчик:** проверить фото ещё раз: выйти, снова войти через Facebook → Settings
      → «Use account photo» → фото должно быть чётким. Если нет — в Meta: App settings → Advanced →
      Security → Require app secret должен быть выключен (иначе Graph API требует
      `appsecret_proof`). Если не поможет, пришли строку «Facebook photo request failed» из лога.
      Проверено вживую 26.09.2026: фото чёткое.
- [x] **9.10. 🧑‍💻 Разработчик решает:** пускать ли пользователей Facebook без email. **Решено
      26.09.2026:** пускать, а в онбординге предлагать необязательное поле почты.
- [x] **9.11. 🧑‍💻 Разработчик:** Supabase → Authentication → Sign In / Providers → Facebook →
      включить вход без email (в API — `external_facebook_email_optional`). Включён 26.09.2026,
      проверено через Management API.
- [x] **9.12.** Миграция `20260926164835_create_account_contacts.sql`: таблица `account_contacts`
      с контактной почтой. Это отдельная таблица, а не колонка `profiles`: профили читают все,
      а контакт — только владелец (RLS на select, insert, update и delete, у `anon` прав нет).
      Это не email аккаунта в Supabase Auth: адрес не подтверждается и не участвует
      в автоматическом связывании аккаунтов. Иначе, вписав чужую почту Google, можно было бы
      получить её аккаунт. Проверено в транзакции с откатом: RLS, `anon`, формат почты,
      каскадное удаление с пользователем, `updated_at`.
- [x] **9.13. 🧑‍💻 Разработчик:** `npm run db:dump`, затем `npm run db:push`. Сделано 26.09.2026.
- [x] **9.14. 🤖 ИИ:** контактная почта в интерфейсе, после миграции:
      - `npm run db:types`;
      - zod-схема `contactEmailSchema`;
      - сохранение вместе с профилем в онбординге и изменение в настройках;
      - `/api/me` отдаёт контакт владельцу;
      - поле «Email (optional)» в онбординге и настройках, только если у аккаунта нет email
        от провайдера;
      - `/privacy` и `/terms`, README и AGENTS.md.

      Сделано 26.09.2026: `contactEmailSchema` в `profileInputSchema`. Сервер сохраняет почту
      до профиля (`upsert`), пустая строка её удаляет. `/api/me` отдаёт `user.contactEmail`.
      Кеш `/api/me` обновляют мутации профиля. Черновик онбординга без нового поля дополняется
      значениями по умолчанию. В Privacy — контактная почта в разделах 1.2, 1.3 и 9.
      Проверено:
      - SQL `upsert` и `delete` под ролью пользователя в транзакции с откатом;
      - в браузере на прод-сборке с подменёнными ответами API: поле есть только без email,
        ошибка формата, в `POST` уходит почта без пробелов, в настройках `PATCH` отправляет
        только `contactEmail`, очистка отправляет `""`, «Save» неактивна без изменений.
- [x] **9.15.** ~~Живая проверка контактной почты~~ — перенесено в шаг 19.2 (28.09.2026) как
      сценарий «Facebook без email».
- [x] **9.16.** Приложение Meta пересоздано 27.09.2026: в первом был лишний сценарий рекламы (Meta
      Ads Manager), а удалить сценарий из приложения нельзя. В новом — только Facebook Login. Но и
      оно при публикации требует бизнес-портфель и подтверждение компании (Business verification):
      приложение получает данные людей, которые ему не принадлежат.
- [x] **9.17.** Реквизиты ИП в подвале сайта (`legalConfig`: название, идентификационный номер,
      страна): Meta сверяет название компании с сайтом. Юридический адрес на сайт не выносим: это
      домашний адрес.
- [ ] **9.18. 🧑‍💻 Разработчик:** бизнес-портфель и подтверждение компании. Документ — выписка из
      реестра предпринимателей НАПР на английском (Firm Name —
      `Individual Entrepreneur Ivan Verkhoturov`, тип «Свидетельство о регистрации»), сайт
      `https://www.freud.in`, домен — TXT-записью `facebook-domain-verification=…` у Timeweb (запись
      Google не удалять). Статус — business.facebook.com → Центр безопасности. Затем подключить
      приложение к портфелю. В процессе с 29.09.2026.
- [x] **9.19.** 28.09.2026: вход через Facebook отвечал «Приложение неактивно» и на проде, и на
      localhost: в Supabase оставался App ID удалённого первого приложения. Пользователь внёс App ID
      и App secret нового приложения (`1765940065538299`, проверено через Management API) и добавил
      в use case разрешения `public_profile` и `email` и адрес возврата Supabase. Вход работает.
      Диалог Facebook показывает людям с ролью «Submit for Login Review»: `email` не одобрен для
      этого приложения. В режиме Development это не мешает.
- [ ] **9.20. 🧑‍💻 Разработчик:** перед Live — после подтверждения компании открыть App Review →
      Permissions and Features (или Use cases → Customize → Permissions) и посмотреть статус
      `email`. Если нужен Advanced Access или App Review, запросить его. Для проверки Meta
      обычно просит запись экрана входа, ссылки на `/privacy` и инструкцию по удалению данных.
- [x] **9.21. 🧑‍💻 Разработчик:** проверить вход на проде и перевести приложение в Live (пункт 8
      инструкции) после 9.18 и 9.20. Для Live нужна иконка приложения 1024×1024: готова,
      `docs/brand/meta-app-icon-1024.png` (шаг 17.3), загрузить в Settings → Basic → App icon.
      Сделано пользователем 29.09.2026, раньше 9.18 и 9.20.

**Готово, когда:** вход через Facebook работает для тестировщиков приложения. Для всех
пользователей он заработает после перевода приложения в Live (шаг 9.21). Перевести его можно
сразу после проверки на проде: тексты `/privacy` и `/terms` к этому моменту уже будут
описывать Facebook.

#### Инструкция: приложение Meta для входа через Facebook

Схема: кнопка → `/api/auth/sign-in?provider=facebook` → Supabase → диалог Facebook →
`https://<ref>.supabase.co/auth/v1/callback` → `/api/auth/callback`. На экране Facebook
показываются название и иконка приложения из его настроек, поэтому обходной путь, как
у Google в шаге 8.1, здесь не нужен.

1. **Аккаунт разработчика.** Войди на https://developers.facebook.com личным аккаунтом Facebook
   (включи на нём 2FA) → Get Started. Meta попросит подтвердить телефон или email.
2. **Приложение.** My Apps → Create app:
   - App name — `Freudin`, App contact email — `freudin.support@gmail.com`;
   - Use case — «Authenticate and request data from users with Facebook Login»;
   - Business portfolio — «I don't want to connect a business portfolio yet» (можно позже);
   - Create app.
3. **Разрешения.** Use cases → Authenticate and request data… → Customize → Permissions:
   `public_profile` уже есть, у `email` нажми Add. Для этих двух разрешений проверка
   приложения (App Review) не нужна.
4. **Facebook Login → Settings** (там же, в Customize → Settings):
   - Client OAuth login, Web OAuth login, Enforce HTTPS, Use Strict Mode for redirect URIs — Yes;
   - Valid OAuth Redirect URIs — `https://<ref>.supabase.co/auth/v1/callback`
     (`<ref>` — `SUPABASE_URL` из `.env`);
   - Login with the JavaScript SDK — No.
5. **App settings → Basic:**
   - App domains — `freud.in`;
   - Contact email — `freudin.support@gmail.com`;
   - Privacy Policy URL — `https://www.freud.in/privacy`;
   - Terms of Service URL — `https://www.freud.in/terms`;
   - User data deletion → Data deletion instructions URL —
     `https://www.freud.in/privacy#account-and-data-deletion`;
   - Category — например, Lifestyle;
   - App icon 1024×1024 — понадобится для Live. Логотипа пока нет (шаг 17.3), можно
     временную иконку;
   - внизу Add platform → Website → Site URL `https://www.freud.in`;
   - Save changes. App ID и App secret (Show, попросит пароль) понадобятся в пункте 6.
     Секрет не присылай в чат и не клади в репозиторий, сразу вноси в Supabase.
6. **Supabase** → Authentication → Sign In / Providers → Facebook: Enable, Facebook client ID —
   App ID, Facebook secret — App secret, Save. Callback URL в этом окне должен совпадать
   с адресом из пункта 4. URL Configuration уже настроен в шаге 5, его не трогаем.
7. **Проверка в режиме Development.** Пока приложение не в Live, войти могут только люди
   с ролью в нём: ты как админ. Других добавляй в App roles → Roles → Testers, они принимают
   приглашение на developers.facebook.com. После моих правок (пункты шага выше):
   - localhost: «Continue with Facebook» → на экране Facebook «Freudin» → онбординг или
     профиль. Если email в Facebook совпадает с email в Google, Supabase привяжет Facebook
     к существующему аккаунту, и откроется твой профиль. Если не совпадает, создастся новый
     аккаунт (ручная привязка — шаг 10.2);
   - «Use account photo» копирует фото из Facebook;
   - то же на проде после коммита.
8. **Live.** Когда вход работает на проде, переключи App Mode в Live (Publish). Meta проверит
   обязательные поля из пункта 5 и потребует бизнес-портфель с подтверждённой компанией:
   без юридической регистрации (ИП или компании) опубликовать вход через Facebook нельзя.
   У `email` в Permissions нажми Get advanced access, если кнопка есть: иначе почту получат
   только люди с ролью в приложении. Раз в год Meta просит пройти Data Use Checkup —
   подтвердить, как используются данные. Без этого доступ приложения ограничат.

#### Шаг 10. Telegram
**🧑‍💻 Разработчик:** в @BotFather выполнить `/newbot` (лучше отдельный бот для сайта), затем
открыть mini app BotFather → бот → Login Widget → «Switch to OpenID Connect Login».
Переключение **необратимо**. BotFather покажет Client ID и Client Secret (это не токен бота).
В Redirect URI указать `https://<ref>.supabase.co/auth/v1/callback`, при необходимости добавить
домены сайта в Trusted origins. **Сделано 27.09.2026:** бот `@freudin_bot`, Redirect URIs —
адрес Supabase, Trusted Origins — `https://www.freud.in`.

- [x] Провайдер в Supabase → Auth → Providers → New Provider → Auto-discovery (OIDC):
      `custom:telegram`, issuer `https://oauth.telegram.org`, scopes `openid profile`, email
      optional. Можешь сделать ты, или я сделаю через коннектор/admin API. Сделал пользователь
      27.09.2026. Через admin API (`/auth/v1/admin/custom-providers`) проверено: провайдер
      включён, PKCE и `email_optional` включены. Цепочка `/api/auth/sign-in?provider=telegram`
      → Supabase → `oauth.telegram.org` открывает экран входа бота без ошибок.
- [x] Кнопка Telegram.
- [x] Обновить `/privacy` и `/terms`: вход через Telegram и какие данные он передаёт. В список
      cookies вернуть `sb-…-code-verifier`, если его ещё нет: его ставит OAuth Supabase на время
      входа. Сделано 27.09.2026: в Privacy новый раздел 1.3 о Telegram Login (следующие
      разделы сдвинулись до 1.7), Telegram в разделах 2, 3, 6, 7, 9, 10 и 13 (в разделе 9 —
      как отвязать сайт и как запросить удаление без email). В Terms — раздел 3 и список
      в разделе 8. Дата «Last updated» — September 27, 2026.
- [x] Добавить `telegram` в `enabledAuthProviders`. Маппинг `telegram` → `custom:telegram`
      в `auth.server.ts` уже есть.
- [x] Приведение метаданных провайдеров к единому виду: имя, аватар, подсказка username.
      У Telegram — `preferred_username`, у Google и Facebook — транслит имени (`anna-smirnova`).
      (аудит) Часть email до `@` — только запасной вариант: сейчас подсказка берётся из email,
      и публичный адрес выдаёт логин почты (`ivan.petrov1987@…` → `ivanpetrov1987`).
      Сделано 27.09.2026: `getProfileSuggestions` берёт первый допустимый адрес из username
      провайдера, имени латиницей (`transliterate` в `shared/lib`: кириллица ru/uk/be
      и диакритика) и части email до «@». Имя и фото Telegram (`name`, `picture`) читались
      и раньше, хосты фото Telegram уже разрешены в `fetchProviderAvatar`.
- [x] Свой адрес возврата, как у Google (решение пользователя 27.09.2026): через OAuth Supabase
      на экране Telegram было «log in on `<ref>.supabase.co`». Своё название вместо домена Telegram
      не показывает, только домен адреса возврата и бота. Сделано 27.09.2026:
      - **Сделал пользователь:** Redirect URIs в BotFather —
        `https://www.freud.in/api/auth/callback/telegram` (адрес с `http://localhost` BotFather
        не принимает), `TELEGRAM_CLIENT_ID` и `TELEGRAM_CLIENT_SECRET` в `.env` и Vercel;
      - вход Google переписан в общий модуль `oidc-sign-in.server.ts` (настройки на провайдера:
        адреса, scopes, способ передачи секрета), колбэк `/api/auth/callback/google` стал
        динамическим `/api/auth/callback/[provider]`, адрес у Google не изменился;
      - Telegram: секрет в заголовке Basic, ошибки токен-эндпоинт отдаёт со статусом 200 (ответ
        разбирается по полям), nonce передаётся в Supabase, только если он есть в ID-токене;
      - на `http://` (localhost) Telegram входит через OAuth Supabase: аккаунт тот же, Client ID
        общий. Cookie попытки входа `freudin-telegram-sign-in` добавлена в Privacy.

      Проверено на прод-сборке: у Google параметры экрана входа прежние; экран Telegram
      с адресом возврата `www.freud.in` открывается с origin `https://www.freud.in`; колбэк
      на неизвестный провайдер, без cookie, с чужим `state`, с отменой у провайдера и с неверным
      кодом отправляет на `/login` с нужной ошибкой. Настоящий обмен кода и `signInWithIdToken`
      для `custom:telegram` проверяются только живым входом на проде.
- [x] **🧑‍💻 Разработчик:** закоммитить, дождаться деплоя и проверить на `www.freud.in`:
      - на экране Telegram — `www.freud.in`;
      - Continue with Telegram → подтвердить вход в Telegram → онбординг: имя и адрес
        предзаполнены, «Use account photo» ставит фото, есть поле «Email (optional)»;
      - выйти и войти снова — тот же профиль, в Settings «Signed in with: Telegram»;
      - вход через Google работает как раньше (его код переписан);
      - есть ли Freudin в Telegram → Settings → Privacy and Security → Active Websites: так
        в Privacy описано, как отвязать сайт;
      - при ошибке — `?error=` из адреса `/login` и строки из логов Vercel (Logs, фильтр
        `rejected` или `sign-in`).

      Проверено пользователем на проде 27.09.2026: на экране Telegram `www.freud.in`, онбординг
      с предзаполненными именем, адресом и фото и полем «Email (optional)», повторный вход
      в тот же профиль, вход через Google работает. В Telegram → Settings → Privacy and Security
      сайт среди подключённых не появляется: у входа через OpenID Connect нет постоянной связи.
      Текст Privacy (раздел 9) исправлен: данные Telegram приходят только при входе, чтобы
      прекратить передачу — не входить через Telegram или удалить аккаунт.

**Готово, когда:** вход через Telegram создаёт пользователя без email и ведёт на онбординг.
✅ Готово 27.09.2026.

**Запасной план:** если связка Telegram OIDC + Supabase не заработает, используем Telegram Login
SDK на клиенте, проверяем `id_token` по JWKS в `POST /api/auth/telegram` и создаём сессию через
admin API.

#### Шаг 10.1. Apple (Sign in with Apple)
Перенесён в этап G 28.09.2026: разработчик пока не платит $99 в год за Apple Developer Program,
поэтому MVP обходится без Apple. План — в этапе G, раздел «Вход через Apple (бывший шаг 10.1)».

#### Шаг 10.2. Несколько способов входа в одном аккаунте
Сейчас один способ входа — один аккаунт (решение 9). Пользователь вошёл через Google, потом
нажал «Continue with Apple» — и получил второй, пустой аккаунт. Исключение — одинаковый
подтверждённый email: такие аккаунты Supabase объединяет сам. Но у Telegram email нет, а Apple
часто отдаёт адрес-пересыльщик, поэтому нужна ручная привязка в настройках (решение
пользователя 26.09.2026). Шаг имеет смысл, когда подключено хотя бы два провайдера
(шаги 9, 10, 10.1).

Привязка — это `linkIdentity` в Supabase: новый способ входа добавляется к текущему
пользователю, и дальше войти можно любым из привязанных. Установленная версия `@supabase/auth-js`
умеет это и через OAuth, и по ID-токену, поэтому Google со своей схемой входа (шаг 8.1) тоже
привязывается.

```
/settings → [Connect Apple]
  → POST /api/auth/identities { provider }        сессия и проверка same-origin
      Facebook, Telegram, Apple: linkIdentity({ provider, skipBrowserRedirect }) → { url }
      Google: cookie попытки входа с mode: "link" → { url } на accounts.google.com
  → браузер уходит к провайдеру и возвращается:
      /api/auth/callback?code=…   → exchangeCodeForSession
      /api/auth/callback/google   → linkIdentity({ provider: "google", token, access_token, nonce })
  → 302 на /settings?linked=apple  или  /settings?error=identity_already_exists
```

- [x] **🧑‍💻 Разработчик:** Supabase → Authentication → Sign In / Providers → включить Allow manual
      linking. На проде и на стенде (шаг 18.9). Прод — включено 27.09.2026, проверено через
      Management API (`security_manual_linking_enabled`). Решения из этого шага пользователь
      подтвердил 27.09.2026.
- [x] API:
      - `POST /api/auth/identities` с `{ provider }` → `{ url }`: старт привязки. Это POST,
        а не ссылка, чтобы чужой сайт не мог запустить привязку (защита от CSRF
        в `withErrorHandling`). Уже привязанный провайдер — 409;
      - колбэки отличают привязку от входа. Для OAuth Supabase — по адресу возврата, для
        Google — по `mode: "link"` в cookie попытки входа: вместо `signInWithIdToken`
        вызывается `linkIdentity` по ID-токену;
      - `DELETE /api/auth/identities/[provider]` — отвязка (`unlinkIdentity`). Последний способ
        входа отвязать нельзя — 409;
      - `GET /api/me` отдаёт список привязанных способов (`user.identities`: провайдер
        и email) вместо одного `user.provider`.

      Сделано 27.09.2026. Отличия от задуманного: список в `/api/me` называется
      `user.signInMethods` (провайдер, email или `@username` у Telegram, фото), его читает
      `getLinkedIdentities` через `auth.getUser()`. OAuth Supabase отмечает привязку
      `?mode=link` в адресе возврата, Google и Telegram на https — `linkUserId` в cookie
      попытки входа; привязка идёт, только если сессия принадлежит тому, кто её начал.
      Отвязка отвечает оставшимися способами и обновляет сессию.
- [x] Ошибки:
      - способ входа уже привязан к другому аккаунту Freudin (`identity_already_exists`) —
        понятное сообщение в настройках. Объединять два аккаунта с профилями не умеем: чтобы
        перенести способ входа, пользователь входит во второй аккаунт и удаляет его;
      - отмена у провайдера — просто возврат в настройки без ошибки.

      Сделано: коды `identity_already_exists` и `link_failed` в `auth-errors.ts`, колбэки
      отдают их в `/settings?link_error=`. Найдена дыра: у второго аккаунта может не быть
      страницы, тогда он попадает на онбординг, где удалить аккаунт было нельзя. Добавлено:
      на онбординге «Signed in with the wrong account?» и Delete account без ввода username,
      `DELETE /api/me` у аккаунта без профиля подтверждения не требует.
- [x] UI в `/settings` → Account, блок «Sign-in methods»: все провайдеры из
      `enabledAuthProviders`. У привязанных — email и кнопка «Disconnect» (неактивна, если
      способ последний), у остальных — «Connect …». После возврата — тост «Apple connected».
      Ожидание на кнопке — как у входа (шаг 17.9). Сделано: логотипы (`AuthProviderIcon`
      перенесён в `entities/viewer`), «Redirecting…» и «Disconnecting…» на кнопках, сброс
      ожидания при возврате из bfcache, подсказка под списком, когда способ один.
- [x] Фото и имя из аккаунта: «Use account photo» и подсказки онбординга берут данные
      конкретного провайдера (`identity_data`), а не общий `user_metadata`. Если фото есть
      у нескольких провайдеров, пользователь выбирает, чьё. Сделано для фото: при нескольких —
      меню «Google photo», «Telegram photo»; `POST /api/profile/avatar` принимает `provider`.
      Крупное фото Facebook — в `user_metadata.facebook_avatar_url` (у аккаунтов, вошедших
      через Facebook до 27.09.2026, до следующего входа будет фото 50×50). Подсказки имени
      и адреса на онбординге остались из `user_metadata`: до создания страницы привязать
      второй способ нельзя, и там данные одного провайдера.
- [x] Удаление аккаунта удаляет все привязанные способы — проверить. Проверено пользователем
      на проде 28.09.2026: после удаления аккаунта с несколькими способами вход любым из них
      создаёт новый пустой аккаунт. Отзыв токена Apple (этап G, «Вход через Apple») делать для
      каждой привязки Apple.
- [x] Документы:
      - `/privacy` и `/terms`: к аккаунту можно привязать несколько способов входа, каждый
        передаёт данные, как описано в его разделе, отвязка — в Settings;
      - README и AGENTS.md: роуты, тип `Viewer`, правило про провайдеры.

      Сделано: Privacy 1.4 (несколько способов, после отвязки имя и фото могут остаться до
      удаления аккаунта) и 9 (удаление на онбординге, удаляются все способы входа), Terms 3.
- [x] **🧑‍💻 Разработчик:** проверка сценариев на `www.freud.in` (Apple пока не подключён, поэтому
      Google, Facebook и Telegram):
      - вход через Google → Connect Telegram → тост «Telegram connected» → выйти → войти через
        Telegram → тот же профиль;
      - Connect Facebook (приложение Meta не в Live: получится только у аккаунта с ролью);
      - отвязать способ; убедиться, что последний отвязать нельзя;
      - привязать второй аккаунт Telegram, у которого уже есть свой профиль Freudin, —
        понятная ошибка;
      - отмена у провайдера — возврат в настройки без ошибки;
      - «Use account photo» при нескольких фото — выбор провайдера;
      - удалить тестовый аккаунт с несколькими способами → вход любым из них создаёт новый
        пустой аккаунт; на онбординге этого аккаунта — «Delete account» без ввода username.

      Проверено мной 27.09.2026 на прод-сборке: без сессии роуты привязки отвечают 401,
      с чужого сайта — 403; колбэки в режиме привязки при отмене возвращают в `/settings`
      без ошибки, при `identity_already_exists` — с этим кодом, при чужой сессии или неверном
      `state` — с `link_failed`; обычный вход не изменился. В браузере с подменёнными ответами
      API: список способов, Connect уводит на адрес провайдера, Disconnect и неактивная кнопка
      у последнего способа, тосты по `?linked=` и `?link_error=` с очисткой адреса, меню фото
      и тело `POST /api/profile/avatar`, фото по умолчанию и удаление аккаунта на онбординге.
      Настоящую привязку через провайдеров проверяешь ты.

      Проверено пользователем на проде 28.09.2026: Connect и Disconnect, привязка чужого
      аккаунта, отмена у провайдера, выбор фото и удаление аккаунта работают. В Supabase видны
      аккаунты с несколькими способами входа.

**Готово, когда:** к одному аккаунту можно привязать и отвязать любой подключённый способ
входа, войти любым из них и попасть в тот же профиль, а последний способ отвязать нельзя.
✅ Готово 28.09.2026.

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
- [x] ~~Живое превью карточки~~ — перенесено в этап G (28.09.2026): пока дизайн минималистичный
      (решение 11).
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
- [x] Подтверждение удаления вводом username (решение пользователя 26.09.2026). В диалоге
      «Delete account?» есть поле «Type `anna` to confirm», и кнопка «Delete» неактивна,
      пока введённое значение не совпадёт с username:
      - сравниваем без пробелов по краям и без учёта регистра;
      - вставка из буфера разрешена;
      - у поля есть подпись (`label`), `autoComplete="off"`, `spellCheck={false}`
        и `autoCapitalize="none"`, при открытии диалога фокус в поле;
      - Enter удаляет аккаунт только при совпадении;
      - при закрытии диалога поле очищается;
      - пока идёт удаление, поле и кнопки неактивны.

      `/settings` открыт только пользователям с профилем, поэтому username есть всегда.
      Сервер тоже проверяет подтверждение: `DELETE /api/me` принимает `{ "username": "…" }`
      и без совпадения с текущим профилем отвечает 400. Это страхует от случайного вызова API.

      Сделано 27.09.2026: `DeleteAccountDialog` в `widgets/account-settings`, сравнение —
      `isAccountDeletionConfirmed`, схема тела — `deleteAccountInputSchema` (обе в
      `entities/viewer`). Пользователь без профиля удалить аккаунт через API не может: подтвердить
      нечем, остаётся запрос на почту поддержки (Privacy, раздел 9). Escape и клик мимо диалога
      во время удаления его не закрывают. Проверено в headless Chromium на прод-сборке
      с подменёнными ответами API: фокус в поле, Enter без совпадения ничего не отправляет,
      `  ANNA ` подходит, вставка работает, поле очищается после закрытия, в `DELETE` уходит
      `{"username":"anna"}`, после ошибки значение остаётся, во время удаления всё неактивно,
      после 204 — переход на главную; 320 px в тёмной теме с длинным username без горизонтальной
      прокрутки.

#### Шаг 20. Данные психолога в личном кабинете
Решение пользователя 28.09.2026: в настройках появляются страна, подход в психологии, формат работы
(онлайн или офлайн; для офлайна нужен город), языки и изображения документов. По решениям 20.2
добавлены «С кем работает» и стоимость сессии, а город выбирается из справочника. Это новые
персональные данные, поэтому меняются `/privacy` и `/terms` (правило 11 AGENTS.md).

- [x] **20.1. 🤖 ИИ:** предложить справочники и правила полей. Итог с учётом решений 20.2:
      - **Подходы** — до 5 из закрытого списка в коде (id и английская подпись, как платформы
        в `social-link`). В списке распространённые в практике подходы с исследованиями
        эффективности; гипноз, НЛП, расстановки и подобное не берём. Варианта «Other» нет:
        подробности психолог пишет в описании. Список из 10 пунктов: Cognitive behavioral therapy
        (CBT), Acceptance and commitment therapy (ACT), Schema therapy, EMDR, Psychodynamic
        therapy, Psychoanalysis, Gestalt therapy, Person-centered therapy, Systemic family therapy,
        Emotion-focused therapy (EFT). БД проверяет только формат и количество значений, поэтому
        список меняется без миграции.
      - **С кем работает** — несколько из списка: Individuals, Couples, Teens, Groups.
      - **Формат работы** — Online и In person (офлайн), можно оба или ни одного. Для In person
        обязательны страна и город.
      - **Страна** — одна, код ISO 3166-1 alpha-2 (`GE`). Список кодов лежит в коде, английские
        названия даёт `Intl.DisplayNames`.
      - **Город** — из справочника и только в выбранной стране. Справочник — таблица `cities`
        в нашей базе с данными GeoNames (лицензия CC BY 4.0, нужна ссылка на источник): внешних
        сервисов, ключей и передачи данных третьим лицам нет. Набор `cities5000` — города от 5000
        жителей и административные центры, без районов городов и исторических мест. Это около
        64 тыс. строк, в Грузии 58: есть Боржоми и Мцхета, которых нет в наборе от 15 000 жителей.
        Названия английские: Tbilisi, Moscow, Munich, Köln. Внутри одной страны около 2 тыс.
        одноимённых городов, поэтому в подсказке виден регион: Portland, Oregon. Поиск идёт по
        началу названия без учёта регистра, диакритики и апострофов (`zurich` находит Zürich),
        выдаёт до 10 городов по убыванию населения. Данные попадают в базу миграцией, которую
        собирает скрипт из выгрузки GeoNames: так справочник появится и в тестовой базе
        (шаг 18.9) обычным `db:push`.
      - **Языки** — до 5, коды ISO 639-1 (`ru`, `ka`), названия даёт `Intl.DisplayNames`.
        В списке 128 живых языков ISO 639-1: мёртвых и искусственных (латынь, санскрит,
        эсперанто) нет. 45 языков убраны 28.09.2026 после проверки на проде (20.8): в Chrome
        урезаны данные ICU, и вместо названия он показывал код (`aa`, `ab`, `av`, `ba`).
        Остались языки, которые называют Chrome, Safari и Firefox.
      - **Цена** — необязательная: целая сумма от 1 до 100 000 000 и валюта ISO 4217 (155
        действующих кодов, названия даёт `Intl.DisplayNames`). Смысл — «от … за сессию»,
        на странице: `From $60 per session`. Сумма и валюта указываются только вместе.
      - **Документы** — до 5 изображений JPEG, PNG или WebP. PDF не принимаем, вместо него можно
        загрузить скриншот. У каждого документа обязательная подпись до 100 символов, она же
        `alt`: например, «MA in Clinical Psychology, Tbilisi State University». На клиенте
        картинка уменьшается до 2048 px по длинной стороне и перекодируется через canvas в WebP
        или JPEG, заодно удаляются EXIF. Сервер проверяет формат по сигнатуре, размер до 2 МБ и
        стороны до 2048 px. Документ загружается и удаляется сразу, без кнопки Save формы.
        Подпись меняется только повторной загрузкой. Под полем предупреждаем, что документы
        видны всем и номера документов лучше закрыть. К каждому документу сохраняется превью
        до 480 px (решение пользователя 28.09.2026): его показывает страница, полное изображение —
        только просмотр.
      - Страну, город, языки и валюту выбирают из списка с поиском, подходы и «С кем работает» —
        галочками. Список с поиском собираем из компонентов shadcn `popover` и `command`, это
        новая зависимость `cmdk` (около 5 КБ). Готовый `combobox` shadcn для Radix не берём: он
        тянет вторую библиотеку примитивов `@base-ui/react`.
      - **Хранение** — публичные колонки `profiles` (их читает `anon`): `country`, `city_id`
        (ссылка на `cities`, город той же страны), `work_formats`, `client_types`, `approaches`,
        `languages`, `price_amount`, `price_currency` и `documents` — jsonb-массив
        `{ id, path, title, width, height }`, как `social_links`. Отдельная таблица документов
        не подошла: гость не видит `profiles.id`, и связь документов с профилем по ней дала бы
        `permission denied`. Публичный bucket `documents`, путь `<user_id>/<uuid>.<ext>`. При
        удалении аккаунта файлы документов удаляются так же, как фото.
- [x] **20.2. 🧑‍💻 Разработчик решает:** решения пользователя 28.09.2026:
      - подходы — 10 самых распространённых, современных и с научной базой (гештальт подходит,
        гипноз и «квантовая психология» — нет); лимиты: 5 подходов, 5 языков, 5 документов;
      - новое поле «С кем работает»: индивидуально, пары, подростки, группы;
      - все поля необязательны и заполняются только в настройках, онбординг не меняется;
      - документы видны всем сразу, без модерации: в `/terms` пользователь подтверждает, что
        документы его и настоящие, а по жалобе мы их удаляем; значок Verified — этап G;
      - город — сразу из справочника;
      - языки показываем на странице пользователя, в поиске (шаг 22) будет фильтр по языку;
      - новое необязательное поле — стоимость сессии; стаж не нужен;
      - список из 10 подходов (20.1) и формат цены «от … за сессию» подтверждены.
- [x] **20.3. 🤖 ИИ:** миграции: таблица `cities` с данными GeoNames (скрипт сборки миграции
      в `scripts/`), новые колонки `profiles` с CHECK-ограничениями как в zod (документы —
      jsonb-колонка), bucket `documents` с политиками, права `anon` на новые публичные колонки
      и `cities`, индексы для поиска (шаг 22). Проверка в транзакции с откатом.

      Сделано 28.09.2026: `*_create_cities.sql`, `*_seed_cities.sql` (64 430 городов, собрана
      `scripts/generate-cities-migration.mjs`), `*_add_psychologist_profile_fields.sql`,
      `*_create_documents_bucket.sql`. На боевой базе в транзакции с откатом проверено:
      корректное заполнение проходит, 28 неверных значений отклоняются (в том числе элемент
      с запятой, вложенный массив, NULL в массиве, цена без валюты, чужая папка документа,
      6 документов), `anon` читает новые колонки и город через связь с `cities`, но не пишет
      в справочник; поиск города идёт по индексу. Проверка нашла и закрыла две дыры:
      нестрогий jsonpath раскрывал вложенные массивы, а NULL у валюты пропускал CHECK цены.
- [x] **20.4. 🧑‍💻 Разработчик:** `npm run db:dump`, затем `npm run db:push`. Сделано 28.09.2026,
      копия `backups/2026-09-28_15-18-47`.
- [x] **20.5. 🤖 ИИ:** `npm run db:types`, справочники и zod-схемы в `entities/profile`,
      `PUBLIC_PROFILE_COLUMNS`, новые поля в `PATCH /api/profile`, роуты `GET /api/cities`
      (поиск города в стране), `POST /api/profile/documents` и
      `DELETE /api/profile/documents/[id]`, серверные функции сущности, удаление файлов
      документов в `DELETE /api/me`.

      Сделано 28.09.2026. Страны и города — новый слайс `entities/location` (`searchCities`,
      `cityQueries`, `getCountryName`). Схема профиля общая для формы и API. Связанные поля
      (`country`, `cityId`, `workFormats` и `priceAmount`, `priceCurrency`) `PATCH` принимает
      только группой, `getProfileChanges` так их и отправляет. Документы пишутся списком
      с проверкой `updated_at`: параллельная загрузка из двух вкладок не теряет запись. Чтение
      картинки из multipart вынесено в `readImageUpload` (`@/app/api/_lib`), фото использует его
      же. Проверено на dev-сервере: поиск городов (`tbi` и `Тбилиси` → Tbilisi, `zurich` →
      Zürich, 400 на неверную страну и пустой запрос), публичный профиль с новыми полями от
      гостя, 401 без сессии; схемы — 20 сценариев скриптом. Запись с сессией (PATCH и документы)
      проверим через форму в 20.8.
- [x] **20.6. 🤖 ИИ:** раздел с данными психолога в `profile-form` в настройках: страна, формат
      работы, город, с кем работает, подходы, языки, цена. Документы — отдельный блок настроек
      вне формы. Изображения документов перекодируются на клиенте через canvas, так пропадают
      EXIF с геолокацией; сервер проверяет формат и размеры, как у фото профиля.

      Сделано 28.09.2026. Раздел Practice в `profile-form` (`showPractice`, только настройки),
      списки с поиском — `Combobox` в `shared/ui` на shadcn `popover` и `command` (зависимость
      `cmdk`), галочки — `checkbox`. Документы — виджет `profile-documents`. По решению
      пользователя к документу сохраняется превью: полное изображение до 2048 px, превью до
      480 px (десятки КБ) — для страницы пользователя, полное — для просмотра. Проверено
      в Playwright на прод-сборке с подменёнными ответами API (город — из настоящего API),
      22 проверки: выбор страны и города (в том числе `Тбили`), лимит 5 подходов, языки, цена,
      тело PATCH, ошибка «In person без города», повторное сохранение отправляет группу полей,
      документ 4000×3000 (10 МБ) уходит как WebP 2048×1536 (1,5 МБ) и превью 480×360 (21 КБ)
      без EXIF, удаление, 320 px в тёмной теме без горизонтальной прокрутки. Нашли и исправили:
      подпись города пропадала после сохранения — форма пересоздаётся раньше, чем приходит
      обновлённый профиль.
- [x] **20.7. 🤖 ИИ:** `/privacy` и `/terms`: новые данные, документы публичны, пользователь
      отвечает за подлинность документов, источник справочника городов (GeoNames, CC BY 4.0);
      дата «Last updated». README и AGENTS.md: роуты, слайсы, таблицы, bucket, скрипт справочника.

      Сделано 28.09.2026, «Last updated» — September 28, 2026. `/privacy`: в публичном профиле
      (раздел 1.5) — данные практики и документы с подписями; документы публикуются сразу,
      номера и подписи лучше закрыть, браузер удаляет EXIF, хранятся изображение и превью,
      удаление стирает оба; справочник городов из GeoNames, выбор города ничего туда не
      отправляет; Supabase хранит и документы; удаление аккаунта удаляет документы. `/terms`:
      Freudin не оказывает психологических услуг, не сторона договорённостей между
      пользователями и не принимает оплату сессий; пользователь подтверждает, что сведения
      о квалификации верны, а документы выданы ему, настоящие и не изменены; документы не
      проверяются, жалоба — на почту поддержки; в отказе от гарантий — «данные пользователей
      не проверяем»; атрибуция GeoNames по CC BY 4.0 в разделе 6. README и AGENTS.md
      обновлены в 20.5–20.6, здесь добавлено, где стоит атрибуция. Черновики `docs/legal`
      не меняли: это дословные исходники владельца.
- [x] **20.8. 🧑‍💻 Разработчик:** проверка на проде: заполнить поля, загрузить и удалить документ.

      Сделано 28.09.2026: всё работает. Замечание — в списке языков были коды вместо названий
      (`aa`, `ab`): Chrome не знает названий 45 редких языков, их убрали из списка (20.1).

**Готово, когда:** психолог заполняет в настройках страну, формат работы (при офлайне — город из
справочника), с кем работает, подходы, языки и цену, загружает и удаляет документы, и всё это
сохраняется.

#### Шаг 21. Данные психолога на странице пользователя
- [x] **21.1. 🤖 ИИ:** `GET /api/profiles/[username]` отдаёт новые поля и документы, демо-профиль
      `demo` дополняется ими.

      Сделано 28.09.2026: роут отдаёт поля с 20.5, демо-профиль заполнен (Tbilisi, три подхода,
      три языка, $60, документ `public/demo-certificate.svg`).
- [x] **21.2. 🤖 ИИ:** `profile-card`: подходы, с кем работает, формат работы, страна и город,
      языки, цена, превью документов с просмотром в диалоге. Семантика: список `dl`, осмысленный
      `alt` у документов, на 320 px без горизонтальной прокрутки.

      Сделано 28.09.2026. После описания — `dl` (`PracticeDetails`): подходы списком `ul`,
      остальное фразой через `Intl.ListFormat` («Individuals and couples», «English, Russian,
      and Georgian»), место — «Tbilisi, Georgia» или только страна, цена через
      `formatPrice` — «From $60 per session», «From GEL 150 per session». После ссылок —
      раздел `h2` «Documents» (`DocumentGallery`): превью с подписью, `alt` превью — подпись
      документа (он же имя кнопки, видимая подпись скрыта от скринридера), по нажатию —
      полное изображение в диалоге. Незаполненные пункты не показываются, профиль без данных
      психолога выглядит как раньше. Проверено в Playwright на прод-сборке, 18 проверок:
      `/demo`, профиль со всеми полями и 5 документами разных пропорций на 320 px в тёмной
      теме (без горизонтальной прокрутки), диалог с клавиатуры и возврат фокуса, профиль без
      данных, без ошибок в консоли.
- [x] **21.3. 🧑‍💻 Разработчик:** проверка на проде: своя страница и чужая в гостевом режиме.
      Проверено пользователем 29.09.2026 на телефоне и на компьютере: всё работает.

**Готово, когда:** на `/<username>` видны подходы, с кем работает, формат работы, страна и город,
языки, цена и документы, а страница профиля без этих данных выглядит как раньше.

#### Шаг 28. Порядок блоков на странице пользователя

Запрос пользователя 28.09.2026: фото, имя и адрес всегда вверху, остальные блоки страницы
владелец расставляет сам в настройках — перетаскиванием или стрелками ↑↓.

- [x] **28.1. 🧑‍💻 Разработчик решает:** решения пользователя 28.09.2026:
      - сначала — отдельный список «Page layout» под полями формы. После проверки локально
        пользователь попросил двигать сами блоки формы: настройки — минималистичный
        конструктор, порядок блоков в них совпадает с порядком на странице; сохраняется
        кнопкой Save вместе с формой;
      - двигается каждый пункт отдельно, 9 блоков: Bio, Approaches, Works with, Format,
        Location (страна и город), Languages, Price, Links, Documents;
      - перетаскивание — новая зависимость `@dnd-kit/core` и `@dnd-kit/sortable`.
- [x] **28.2. 🤖 ИИ:** миграция `*_add_profile_section_order.sql`: колонка
      `profiles.section_order text[]` (пустой массив — порядок по умолчанию), CHECK формата
      и количества, `grant select` для `anon`. Справочник блоков, схема, чтение и запись
      в `entities/profile`, список в `profile-form`, вывод по порядку в `profile-card`.

      Сделано 28.09.2026. Справочник — `profileSectionIds` (порядок по умолчанию — как было
      на странице), названия — `profileSectionLabels` (шапки блоков в настройках и подписи
      `dt` на странице). Сохранённый порядок нормализует `normalizeSectionOrder`: неизвестные
      блоки и повторы отбрасываются, недостающие (в том числе новые блоки) добавляются в конец.
      Форма настроек — конструктор (`SortableBlocks`): после фото, имени и адреса блоки в рамках
      с шапкой (ручка, название, стрелки ↑↓), поля внутри; подпись поля, совпадающая
      с названием блока, видна только скринридеру. Блок документов — виджет
      `profile-documents` слотом `documentsBlock` (загрузка и удаление по-прежнему сохраняются
      сразу; `submit` диалога загрузки не всплывает через портал в форму профиля). Контактная
      почта — после блоков: на странице её нет. Онбординг не изменился: Bio и ссылки без рамок
      и стрелок. Перетаскивание — за ручку мышью и пальцем; с клавиатуры и в скринридере
      порядок меняют стрелки (ручка вне порядка табуляции), фокус остаётся на нажатой
      стрелке, а у крайнего блока уходит на соседнюю, перестановка объявляется через
      `aria-live`. На странице незаполненные блоки не показываются, идущие подряд пункты
      практики — один `dl`, даже если между ними пустой блок. Миграция проверена на боевой
      базе в транзакции с откатом: у существующих профилей пустой порядок, 6 неверных
      значений отклоняются, `anon` читает колонку. Конструктор проверен в Playwright
      на dev-сервере с подменёнными ответами API, 26 проверок: порядок блоков, стрелки мышью
      и с клавиатуры, фокус, перетаскивание, Enter в подписи документа не отправляет форму
      профиля, тело PATCH только с `sectionOrder`, порядок на странице, 320 px в тёмной теме,
      онбординг без рамок.
- [x] **28.3. 🧑‍💻 Разработчик:** `npm run db:dump`, затем `npm run db:push`. Миграцию
      применить до выкладки кода: код читает `section_order`, без колонки страницы профилей
      отвечают ошибкой.
- [x] **28.4. 🤖 ИИ:** `npm run db:types`, `npm run typecheck` и `npm run build`: до миграции
      в типах БД нет `section_order`, и проверка типов не проходит. Сделано 28.09.2026.
- [x] **28.5. 🧑‍💻 Разработчик:** проверка на проде: переставить блоки стрелками
      и перетаскиванием (в том числе на телефоне), сохранить, открыть свою страницу.
      Сделано 28.09.2026: всё работает.

**Готово, когда:** владелец переставляет блоки формы в настройках, а `/<username>` показывает блоки
в том же порядке; у профилей без заданного порядка страница выглядит как раньше.

#### Шаг 29. Запросы, с которыми работает психолог
Из описания продукта (29.09.2026, `docs/PRODUCT.md`, опоры 3.1 и 3.5): на странице видны навыки
психолога, а ассистент подбирает его «по случаю». Для этого нужен список запросов: тревога,
отношения, травма и т. п. Сейчас есть подходы и «С кем работает», а запросов нет.

- [ ] **29.1. 🤖 ИИ:** предложить справочник запросов (закрытый список, как подходы) и лимит.
- [ ] **29.2. 🧑‍💻 Разработчик решает:** утвердить список.
- [ ] **29.3. 🤖 ИИ:** миграция, поле в настройках, блок на странице, фильтр в поиске (шаг 22).
- [ ] **29.4. 🧑‍💻 Разработчик:** `npm run db:dump`, затем `npm run db:push`; проверка на проде.

#### Шаг 30. Образование и контакты для связи
Опора 3.1: на странице есть образование и контакты для связи. Сейчас образование видно только
по изображениям документов, а связаться можно через ссылки на соцсети и сайт.

- [ ] **30.1. 🧑‍💻 Разработчик решает:** нужно ли отдельное поле образования (вуз, степень, год)
      и какие контакты показывать на странице (почта, телефон, WhatsApp, ссылка на запись).
- [ ] **30.2. 🤖 ИИ:** поля, миграция, форма, страница. Публичные контакты — новые персональные
      данные, поэтому обновляем `/privacy` (правило 11 AGENTS.md).
- [ ] **30.3. 🧑‍💻 Разработчик:** миграция и проверка на проде.

### Этап E. Главная страница

Решение пользователя 28.09.2026: у каждой страницы сайта свой этап. Главная — этап E,
«О нас» — этап I, «Контакты» — этап J.

#### Шаг 16. Главная страница
- [x] Минимальная главная (решение 11): заголовок, кнопки «Войти» и «Пример страницы».
      Лендинг с примером карточки и блоком «как это работает» — позже, если решим.
- [x] SEO: описательные `title` и `<h1>` главной вместо просто «Freudin».
- [ ] **🤖 ИИ:** вошедший пользователь видит на главной «My page» или «Create page», как в меню
      шапки, а не «Sign in».

#### Шаг 22. Поиск психологов на главной
Решение пользователя 28.09.2026: на главной поиск по подходу, формату работы и локации. Нужны данные
из шага 20.

- [ ] **22.1. 🧑‍💻 Разработчик решает:**
      - кто попадает в выдачу: все профили или только с заполненными данными психолога (и с
        проверенными документами, если будет проверка);
      - фильтры: подход, формат работы, страна и город, язык (решено в 20.2); нужны ли фильтры
        «С кем работает» и по цене;
      - порядок выдачи и сколько карточек загружать за раз.
- [ ] **22.2. 🤖 ИИ:** `GET /api/profiles?approach=&format=&country=&city=&language=&cursor=`:
      публичный клиент, query через zod, пагинация, только публичные колонки, индексы из 20.3.
      Лимит запросов — вместе с 18.3.
- [ ] **22.3. 🤖 ИИ:** поиск на главной: фильтры хранятся в адресе (`useSearchParams`, компонент в
      `<Suspense>`), поэтому поиском можно поделиться ссылкой; карточки результатов (фото, имя,
      подход, формат, город) со ссылкой на страницу; скелетоны, пустая выдача, «Load more». SEO:
      один `<h1>`; выдача рендерится на клиенте, поисковики её не увидят (этап G).
- [ ] **22.4. 🤖 ИИ:** README и AGENTS.md: роут, слайсы, запросы.
- [ ] **22.5. 🧑‍💻 Разработчик:** проверка на проде: фильтры, ссылка с фильтрами, пустая выдача,
      телефон.

**Готово, когда:** на главной можно найти психологов по подходу, формату работы и локации, а ссылка
с фильтрами открывает ту же выдачу.

#### Шаг 31. Главная: поиск, лента и ассистент
Опора 4 `docs/PRODUCT.md`: главная — вход в каталог для клиента (поиск — шаг 22, лента — шаг 32,
ассистент — шаг 33) и приглашение для психолога создать страницу. Собираем по мере готовности
частей.

- [ ] **31.1. 🤖 ИИ и 🧑‍💻 Разработчик:** структура главной: что на первом экране, как связаны
      части, тексты для двух аудиторий (по `docs/PRODUCT.md`).
- [ ] **31.2. 🤖 ИИ:** вёрстка, SEO по чек-листу AGENTS.md.
- [ ] **31.3. 🧑‍💻 Разработчик:** проверка на проде.

### Этап E2. Полировка

Бывший шаг 17, разбит на шаги 17.1–17.7 (решение пользователя 26.09.2026). Их можно делать
в любом порядке, но английский интерфейс (17.4) — до вычитки текстов (17.5) и до текстов
этапа H. Номера шагов 18–19 и буквы этапов F–H не меняем: на них ссылаются README,
AGENTS.md и сообщения коммитов.

Шаг 17.9 выделен из 17.2 28.09.2026 и стоит сразу после него. Шаг 17.3 лучше не откладывать: иконка
1024×1024 нужна для перевода приложения Meta в Live (9.21).

#### Шаг 17.1. Доступность и адаптив
- [ ] **🤖 ИИ:** клавиатура: видимый фокус у всех интерактивных элементов и понятный порядок
      обхода. Меню в шапке, выбор соцсети, кроп фото и диалог удаления аккаунта работают без мыши.
- [ ] **🤖 ИИ:** семантика и aria: подписи у полей и у кнопок без текста, `aria-live` для
      статусов, осмысленный `alt` у фото, заголовки по порядку.
- [ ] **🤖 ИИ:** контраст по WCAG AA (обычный текст не меньше 4.5:1) в светлой и тёмной темах, в
      том числе у приглушённого текста, ошибок и плейсхолдеров.
- [ ] **🤖 ИИ:** адаптив: экраны от 320 px и масштаб 200% без горизонтальной прокрутки. Длинные
      имена, описания и ссылки не ломают вёрстку.
- [ ] **🤖 ИИ:** автоматическая проверка axe в headless Chromium по всем страницам.
- [ ] **🧑‍💻 Разработчик (по желанию):** пройти сайт с VoiceOver на Mac или iPhone.

**Готово, когда:** axe не находит нарушений, а все сценарии проходятся с клавиатуры.

#### Шаг 17.2. Ошибки и состояния
- [ ] **🤖 ИИ:** `error.tsx` и `global-error.tsx`: своя страница ошибки с кнопкой «Try again» и
      адресом поддержки (`SupportEmailLink`) вместо стандартной страницы Next. Это файлы роутинга,
      их добавим в правила AGENTS.md.
- [ ] **🤖 ИИ:** единые состояния на всех экранах: скелетоны при загрузке, пустые состояния,
      ошибка загрузки с кнопкой «Try again».
- [ ] **🤖 ИИ:** сбой сети и таймауты `apiClient` (`network_error`): понятные тексты, без обрыва
      форм.
- [ ] **🤖 ИИ:** тосты: единые тексты и длительность, без дублей. Тосты с ошибкой, предупреждением
      или о несработавшем действии (например, не удалось привязать способ входа) держатся в 2 раза
      дольше обычных (решение пользователя 28.09.2026).

**Готово, когда:** на любом экране сбой API или ошибка рендера дают понятное сообщение и способ
повторить.

#### Шаг 17.9. Индикаторы ожидания
Выделен из шага 17.2 28.09.2026: маленькая самостоятельная итерация. Подход уже есть у кнопок
Connect в настройках (`sign-in-methods.tsx`): «Redirecting…» и сброс ожидания на `pageshow`.

- [ ] **🤖 ИИ:** ожидание при входе: после клика по кнопке провайдера показывать в ней спиннер и
      текст «Redirecting to Google…», а все кнопки входа делать неактивными, чтобы не было
      повторного клика. Сейчас кнопка никак не реагирует: `/api/auth/sign-in` на проде отвечает за
      ~0,4 с (замер 26.09.2026), при холодном старте функции дольше. Состояние сбрасывать на
      `pageshow` с `persisted`: иначе при «Назад» со страницы провайдера браузер достанет страницу
      из bfcache с крутящимся спиннером. Клик с Cmd/Ctrl открывает новую вкладку, состояние он не
      включает.
- [ ] **🤖 ИИ:** ожидание при выходе: сейчас пункт меню закрывается, и до перезагрузки страницы
      ничего не видно. Показывать «Signing out…» тостом из меню и спиннером на кнопке в настройках.
- [ ] **🤖 ИИ:** единый индикатор ожидания в кнопках: `Spinner` из shadcn
      (`npx shadcn add spinner`) рядом с текстом («Saving…», «Deleting…», «Signing out…»), кнопка
      неактивна, пока идёт запрос. Сейчас у части кнопок только текст, у части — ничего.
- Не делаем: отдельный экран-лоадер между провайдером и сайтом (там только серверные редиректы,
  наша страница в это время не отображается, а промежуточная страница добавила бы ещё
  один переход) и полосу загрузки при переходах (страницы открываются мгновенно, данные
  закрыты скелетонами). На `/login` кнопки не прячем, пока грузится `/api/me`: гость, которых
  там большинство, ждал бы их лишние ~0,4 с.

**Готово, когда:** каждое действие с ожиданием (вход, выход, сохранение, удаление) сразу
показывает, что запрос идёт.

#### Шаг 17.3. Favicon и логотип
- [x] **🤖 ИИ и 🧑‍💻 Разработчик:** логотип. Сейчас в шапке название «Freudin» текстом. Нужен ли знак
      при минималистичном дизайне (решение 11)? Решено 28.09.2026: знака нет, логотип — надпись
      `freud.in` с розовой точкой.
- [x] **🤖 ИИ:** предложить 2–3 варианта иконки сайта (и знака, если он нужен) в SVG. Сделано
      28.09.2026: временная история `Freudin/Logo Concepts` в ките
      (`src/shared/ui/logo-concepts.stories.tsx`) с вариантами «Кушетка» (шезлонг психоаналитика
      с валиком), «Диалог» (две половины круга на разной высоте) и «Точка» (надпись `freud.in`
      с розовой точкой, иконка «f.»), а по просьбе пользователя ещё «Психея» (буква ψ: ножка
      с «головой» в чаше — человек в раскрытых руках) и «Арка» (дверной проём с восходящим
      солнцем — безопасное пространство). У каждого: шапка, фавиконки 16 и 32 px, иконка приложения,
      обе темы. После выбора знак переезжает в `Logo` и `src/app/icon.svg`, историю удаляем.
- [x] **🧑‍💻 Разработчик:** логотип — «Точка» (`freud.in` с розовой точкой), выбрано 28.09.2026.
      Иконка «f.» на фиолетовой плитке отклонена: похожа на Facebook.
- [x] **🤖 ИИ и 🧑‍💻 Разработчик:** фавиконка. Из вариантов «.in», «F.» и «Dot» 🧑‍💻 выбрал
      28.09.2026 «Dot»: розовая точка из логотипа на фиолетовой плитке, правее и ниже центра.
- [x] **🧑‍💻 Разработчик:** утвердить вариант иконки и логотипа, который я предложу, или дать
      свой в SVG.
- [x] **🤖 ИИ:** иконки сайта: `src/app/icon.svg` (или `.png`) вместо стандартного `favicon.ico`
      из create-next-app, `apple-icon.png` 180×180. Версию для тёмной темы — по необходимости.
      Заодно иконка 1024×1024 для приложения Meta (шаг 9.21). Стандартный `favicon.ico` удалить
      (перенесено из шага 17.7). Сделано 28.09.2026: `icon.svg`, `apple-icon.png` (квадрат без
      скругления) и `favicon.ico` с той же точкой вместо стандартного — его запрашивают напрямую
      старые браузеры и сервисы. Тёмная версия не нужна: фиолетовая плитка видна на любой
      панели. Временная история с концепциями удалена.
- [x] **🤖 ИИ:** картинка превью `opengraph-image.jpg` в новом стиле: сейчас на ней «Freudin»
      белым по чёрному, без палитры и логотипа `freud.in`. Сделано 29.09.2026: кремовый фон,
      логотип `freud.in` с розовой точкой, подзаголовок из `siteConfig.description` в две строки,
      всё по центру: квадратная обрезка в мессенджерах и 2:1 в X ничего не срезают. Alt обновлён.
- [x] **🤖 ИИ:** иконка приложения Meta 1024×1024 для шага 9.21: `docs/brand/meta-app-icon-1024.png`
      (29.09.2026), тот же знак, что у `apple-icon.png`. Точка остаётся внутри и при круглой
      обрезке.
- [ ] **🤖 ИИ:** `src/app/manifest.ts`: название, цвета темы, иконки 192 и 512 px. Статические
      metadata-файлы добавим в правила AGENTS.md.

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
- [ ] **🤖 ИИ:** все английские тексты интерфейса, сообщения ошибок API, `title` и `description`
      страниц: единый тон, американский вариант английского, sentence case в кнопках и заголовках,
      короткие понятные формулировки.
- [ ] **🤖 ИИ:** одинаковые подписи кнопок и полей на онбординге и в настройках.
- [ ] **🧑‍💻 Разработчик:** вычитать итоговую таблицу текстов, которую я соберу.

#### Шаг 17.6. Вес JS и библиотеки
- [ ] **🤖 ИИ:** (аудит) вес JS: главная грузит 341 КБ gzip, из них 97 КБ — zod со всеми
      локалями. Импорт `import * as z from "zod"` вместо `import { z }` даёт 277 КБ (−19%,
      замерено). Дальше — убрать zod из `apiClient`: ответ с ошибкой можно проверить без схемы.
- [ ] **🤖 ИИ:** отчёт о составе бандла по страницам, до и после оптимизации. Инструмент — по
      возможности без новых зависимостей.
- [ ] **🤖 ИИ:** ленивая загрузка редких частей: кроп фото (`react-easy-crop`) — только после
      выбора файла, тяжёлые диалоги — по открытию.
- [ ] **🤖 ИИ:** проверить tree-shaking `radix-ui`, `lucide-react` и TanStack, а также то, что
      devtools TanStack Query не попадают в прод-сборку.
- [ ] **🤖 ИИ:** (ревью) замер скорости на проде: Lighthouse (mobile) для `/`, `/demo` и
      настоящей личной страницы — LCP, TBT, CLS. Цифры записать в этот шаг. По LCP личной
      страницы 🧑‍💻 решает, переносить ли её серверный рендер из этапа G в MVP.
- [ ] **🤖 ИИ и 🧑‍💻 Разработчик:** (ревью) `/privacy` и `/terms` без клиентского JS. Их
      чанки весят около 20 КБ gzip (сборка 29.09.2026), а в них лишь текст, который уже есть в HTML.
      Хуков в этих view и в `legal-document` нет, поэтому правка — убрать `"use client"` из этих
      файлов. Это исключение из правила «весь UI клиентский»: 🧑‍💻 решает, нужно ли оно, и если да,
      записываем его в AGENTS.md.

**Готово, когда:** главная и личная страница грузят заметно меньше JS; цифры до и после записаны
в этом шаге.

#### Шаг 17.7. Удаление неиспользуемого
- [ ] **🤖 ИИ:** неиспользуемые компоненты shadcn в `shared/ui` (сейчас нигде не импортируется
      `card`) и лишние экспорты public API слайсов.
- [ ] **🤖 ИИ:** неиспользуемые файлы, экспорты и зависимости: разовая проверка (например,
      `npx knip`) без добавления инструмента в проект.

### Этап E3. Темизация

Решение пользователя 27.09.2026: цвета, шрифты и размеры всего сайта задаются в одном месте,
и их можно поменять сразу для всех страниц. Это настройка для разработчика: тема меняется
правкой файла и деплоем. Выбор темы пользователем для своей страницы — отдельная задача этапа G
(«темы оформления страницы»), токены этого шага станут для неё основой.

Делать можно в любой момент, но лучше до шагов 17.1 и 17.3: контраст проверяем по итоговым
токенам, а иконки и `manifest.ts` берут цвета из них. Номер шага продолжает 17.x, чтобы
не менять номера 18–19.

#### Шаг 17.8. Дизайн-токены в одном месте

Что есть сейчас (27.09.2026):
- цвета уже заданы токенами shadcn в `src/app/globals.css` (`:root` и `.dark`), компоненты
  используют семантические классы (`bg-background`, `text-muted-foreground`). Радиусы считаются
  от одной переменной `--radius`;
- вне токенов: `themeColor` в `layout.tsx` (`#ffffff` и `#0a0a0a` повторяют `--background`),
  затемнение под диалогами `bg-black/10` в `dialog.tsx` и `alert-dialog.tsx`, ползунок
  `bg-white` в `slider.tsx`;
- типографика и размеры заданы классами по месту: заголовок страницы
  `font-semibold text-2xl tracking-tight` повторяется 8 раз, отступ страницы `py-10` — 11 раз,
  ширину контента (`max-w-sm`, `md`, `lg`, `3xl`, `5xl`) каждый view выбирает сам;
- шрифт подключается в `layout.tsx` (Geist в `--font-sans`), Geist Mono не используется;
- токены `sidebar-*` и `chart-*` от shadcn не используются.

- [x] **🧑‍💻 Разработчик решает:** где лежит «одно место». **Решено 27.09.2026 (решение 18):**
      `src/app/globals.css`, разбитый на разделы с комментариями: палитра светлой и тёмной темы,
      шрифты, типографика, размеры и отступы, радиусы. Туда же пишут `npx shadcn add`
      и `npx shadcn apply`, а генераторы тем для shadcn (например, tweakcn) выдают CSS, который
      вставляется в этот файл как есть. Отдельный `theme.css` отклонён: новые переменные CLI
      shadcn дописывал бы в `globals.css`, и переносить их пришлось бы руками.
- [ ] **🤖 ИИ:** цвета: только семантические токены (фон, текст, `primary`, `muted`,
      `destructive`, `border`, `ring` и т. п.) в светлом и тёмном вариантах. Вместо захардкоженных
      значений: токен `--overlay` для затемнения под диалогами, существующий токен для ползунка.
      Правка файлов shadcn здесь оправдана.
- [ ] **🤖 ИИ:** шрифты: в CSS — переменные `--font-sans`, `--font-heading` и `--font-mono`, а
      сами шрифты подключаются в одном модуле. `next/font` принимает в вызове только литералы,
      поэтому выбор шрифта остаётся кодом, а не значением в CSS. Сменить шрифт — поменять импорт в
      этом модуле. Подмножество `cyrillic` обязательно. Заодно убрать неиспользуемый Geist Mono
      (аудит, перенесено из шага 17.7): он даёт 2 из 4 предзагрузок шрифтов на каждой странице.
- [ ] **🤖 ИИ:** типографика: именованные размеры текста в `@theme`. Токен `--text-*` вместе
      с `--line-height`, `--letter-spacing` и `--font-weight` даёт один класс на всё
      (Tailwind 4.3 это поддерживает, проверено): например, `text-page-title`,
      `text-section-title`, `text-body`, `text-caption`. На них переходят заголовки страниц
      и разделов и типографика юридических текстов (`LegalDocument`).
- [ ] **🤖 ИИ:** размеры и отступы: общий шаг сетки `--spacing` (0.25rem по умолчанию, меняет
      все отступы сразу), именованные ширины (`--container-page` для `Container`,
      `--container-form`, `--container-prose`) и отступ страницы (`--spacing-page` → `py-page`).
      Views используют их вместо `max-w-lg` и `py-10`.
- [ ] **🤖 ИИ:** значения вне CSS: `themeColor` в `layout.tsx` и цвета `manifest.ts` (шаг 17.3)
      CSS-переменные прочитать не могут. Держим их в `shared/config/theme.ts` с пометкой,
      от какого токена они взяты. По возможности расхождение ловит проверка в `npm run lint`
      (небольшой скрипт без новых зависимостей).
- [ ] **🤖 ИИ:** убрать неиспользуемые токены `sidebar-*` и `chart-*`, чтобы файл темы легко
      читался. Если они понадобятся компоненту shadcn, CLI добавит их снова.
- [ ] **🤖 ИИ:** правило в AGENTS.md («Стили и UI»): цвета, шрифты, размеры текста, ширины и
      отступы страниц задаём только токенами. Сырые цвета (`bg-white`, `text-red-500`, hex)
      допустимы только в файле темы и в логотипах брендов. Biome классы Tailwind не проверяет,
      поэтому при ревью — поиск по коду.
- [ ] **🤖 ИИ:** README, раздел «Тема»: где лежат токены и как поменять основной цвет, шрифт,
      радиус, размеры текста и плотность отступов. После смены цветов — проверка контраста WCAG AA
      (шаг 17.1) и новая картинка превью: `opengraph-image.jpg` статичная, её перерисовывает
      🤖 ИИ (генерация из токенов — этап G).
- [ ] **🤖 ИИ:** проверка. Пока дизайн минималистичный (решение 11), значения токенов равны
      текущим, и сайт выглядит как раньше: сверяю скриншоты всех страниц в обеих темах до и после
      (headless Chromium). Затем пробная правка, например цветной `--primary` и другой `--radius`:
      она должна поменять весь сайт и откатиться правкой одного файла. Пробную правку покажу тебе.
- Не темизируем: цвета логотипов Google, Facebook и Telegram в `provider-icon.tsx` (правила
  брендов требуют оригинальных цветов) и белый фон при сжатии фото в `crop-image.ts` (это
  содержимое JPEG, а не интерфейс).

**Готово, когда:** цвета, радиус, размеры текста, ширины и отступы меняются правкой файла темы,
а шрифт — правкой модуля шрифтов, сразу на всех страницах и в обеих темах. В компонентах
не осталось захардкоженных значений, кроме перечисленных исключений.

#### Шаг 23. UI kit в Storybook
Решение пользователя 28.09.2026: базовые визуальные элементы собраны в UI kit на Storybook. Это
новая dev-зависимость, её упоминаем в README. Лучше делать после 17.8: кит показывает итоговые
токены.

- [x] **23.1. 🧑‍💻 Разработчик решает:** где смотреть кит — только локально (`npm run storybook`) или
      публиковать (отдельный проект Vercel с защитой, как у стенда). **Решено 29.09.2026:**
      публикуем (23.11).
- [x] **23.2. 🤖 ИИ:** установить Storybook через npm 11. Фреймворк для Next.js
      (`@storybook/nextjs-vite` или `@storybook/nextjs`): проверить совместимость с Next.js 16,
      React 19, React Compiler и Tailwind 4. Светлая и тёмная темы (класс `.dark`), шрифт Geist,
      скрипты `storybook` и `build-storybook`, папка `storybook-static` в `.gitignore` и в
      исключениях Biome. Сделано 28.09.2026: Storybook 10.6 с `@storybook/nextjs-vite` и Vite 8.
      Tailwind 4 подхватывается из `postcss.config.mjs`. React Compiler в ките не работает,
      компонентам он и не нужен. Тему ставит next-themes по тулбару, Biome пропускает
      `storybook-static` через `.gitignore`.
- [x] **23.3. 🤖 ИИ:** истории `*.stories.tsx` рядом с компонентами `shared/ui`: кнопки, поля,
      диалоги, меню, аватар, скелетоны, тосты, а также `Logo`, `Container`, `NotFoundState`,
      `SupportEmailLink`. Отдельная страница токенов: палитра, типографика, отступы, радиусы (шаг
      17.8). Сделано 28.09.2026: 21 файл историй. Нет историй у `card` и `tooltip`: сайт их не
      использует. `label`, `popover`, `command`, `input-group` и `separator` показаны внутри
      `Field`, `Combobox` и `Dropdown Menu`. На странице токенов палитра, шрифт и радиусы;
      типографика и отступы появятся с токенами шага 17.8.
- [x] **23.6. 🤖 ИИ:** палитра пользователя от 28.09.2026 в токенах светлой темы
      (`globals.css`): фон `#FAF7F2`, текст `#292535`, карточки `#FFFFFF`, `primary`
      и `secondary` `#59456B`, `accent` `#F0EAF3`. Новые токены: `cta` `#F47C61` для главной
      кнопки (`Button` без `variant`) и `link` `#AD4739` для ссылок в тексте. `muted`
      и `muted-foreground` подобраны под тёплый фон: прежний серый давал 4.4:1. `themeColor`
      тоже `#FAF7F2`. Тёплый акцент `#F2DCD1` не используется: для него пока нет элементов.
- [x] **23.7. 🤖 ИИ:** бренд-кит (по запросу пользователя через brandkit 28.09.2026) и палитра
      тёмной темы. В `globals.css` добавлены примитивы — шкалы OKLCH `plum`, `coral`, `neutral`
      и `red` по 11 шагов, цвета бренда стоят в них без изменений (тёплый акцент `#F2DCD1` —
      `coral-200`). Семантические токены ссылаются на шкалы. Тёмная тема продумана отдельно:
      фон `neutral-950`, карточки `neutral-900`, активные элементы `plum-300`, ссылки
      `coral-300`. Попутно: `destructive` светлой темы стал темнее (`red-700`), иначе при
      наведении на кнопку удаления текст давал 3.8:1. Рамки полей и чекбоксов (`input`) теперь
      не ниже 3:1 (было 1.2:1, WCAG 1.4.11). Контраст всех пар проверен в браузере по
      вычисленным значениям обеих тем, шкалы показаны на странице токенов в ките.
      DTCG-файлы `tokens/*.json` не заводили: токены живут в `globals.css` (решение 18).
- [x] **23.8. 🧑‍💻 Разработчик:** посмотреть светлую и тёмную темы на сайте и в ките, особенно
      более заметные рамки полей и тёмно-красный `destructive`. Принято пользователем 29.09.2026.
- [x] **23.9. 🤖 ИИ и 🧑‍💻 Разработчик:** фиолетовый и розовый вместо кораллового и `#59456B`
      (запрос пользователя 28.09.2026). Шкалы `plum` и `coral` заменены на `violet` и `pink`.
      Из трёх вариантов (A «Lilac & Rose», B «Violet & Fuchsia», C «Iris & Orchid») пользователь
      выбрал C: фиолетовый `#4C429D`, розовый `#CF87CE` (главная кнопка), ссылки `#983F95`,
      выбранный элемент `#E7EAFE`. Пары проходят WCAG AA в обеих темах. Временный переключатель
      палитр в ките удалён. Тёплый акцент `#F2DCD1` ушёл вместе с шкалой `coral`.
- [ ] **23.4. 🤖 ИИ:** README (стек, скрипты), AGENTS.md: Storybook в стеке, место историй в FSD,
      правило «новый компонент в `shared/ui` — с историей». Сборка кита в CI (18.7).
      README и AGENTS.md обновлены 28.09.2026, осталась сборка в CI: ждёт 18.7.
- [x] **23.5. 🧑‍💻 Разработчик:** посмотреть кит. Посмотрел 29.09.2026: устройство кита подходит,
      замечание — тосты разных типов должны различаться цветом (23.10).
- [x] **23.10. 🤖 ИИ:** цвет тоста по типу (запрос пользователя 29.09.2026): успех — `violet-200`,
      ошибка — `red-200`, информация — как раньше (`popover`). Из предложенных для успеха
      `violet-200` и `pink-200` выбран фиолетовый: светло-розовый рядом со светло-красным
      ошибки почти не отличить. Сделано 29.09.2026: токены `success` и `error` с текстом
      `violet-900` и `red-900` (10:1), в тёмной теме — шаги 800 с текстом шага 50 (10:1): шаги
      900 сливались бы с фоном страницы. `Toaster` включает `richColors` и берёт цвета из
      токенов; предупреждение, которого пока нет на сайте, выглядит как информация. Проверено
      в ките в обеих темах, пары добавлены на страницу токенов.
- [x] **23.11. 🧑‍💻 Разработчик:** проект Vercel для кита, отдельный от сайта, из того же
      репозитория:
      - Add New → Project → репозиторий сайта, имя например `freudin-storybook`;
      - Framework Preset — Other, Build Command — `npm run build-storybook`, Output Directory —
        `storybook-static`, переменные окружения не нужны (сборка проверена без них);
      - Settings → Deployment Protection → Vercel Authentication, область — All Deployments:
        кит откроется только под твоим аккаунтом Vercel и не попадёт в поиск. На Hobby это
        бесплатно. Свой домен не нужен, хватит адреса `*.vercel.app`;
      - прислать адрес кита.

      Сделано 29.09.2026: https://freudin-storybook.vercel.app. Проверено: без входа в Vercel
      адрес отвечает 302 на страницу авторизации Vercel.
- [x] **23.12. 🤖 ИИ:** после 23.11 — адрес кита и как он публикуется в README и AGENTS.md.
      Сделано 29.09.2026: README (стек, «Дизайн», «Внешние сервисы», «Деплой»), AGENTS.md (стек,
      UI kit).

**Готово, когда:** `npm run storybook` показывает все компоненты `shared/ui` и токены темы в светлой
и тёмной темах, а опубликованный кит открывается только владельцу.

### Этап F. Запуск

#### Шаг 18. Прод
- [x] **18.1.** Vercel: домен `www.freud.in` подключён, `freud.in` редиректит на него. Переменные
      окружения Production задаются раньше, на шаге 5.
- [x] **18.2.** ~~Прод-URL во всех провайдерах и в Supabase~~ — закрыт 28.09.2026 как дубль: Google
      в In production и Telegram с прод-доменом готовы (шаги 8.1 и 10), перевод Facebook в Live —
      шаг 9.21.
- [ ] **18.3. 🤖 ИИ:** защита прода до публичного анонса:
      - (аудит) заголовки безопасности в `next.config.ts`:
        `Content-Security-Policy: frame-ancestors 'none'` (защищает «Delete account» от
        clickjacking), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
        Сейчас на проде есть только HSTS от Vercel;
      - rate limiting API (перенесён из этапа G 28.09.2026). В первую очередь
        `GET /api/usernames/[username]` (перебор адресов), `POST /api/profile/avatar` (нагрузка на
        Storage), `/api/auth/sign-in`, `POST /api/auth/identities`, а после шагов 20 и 22 — загрузка
        документов и поиск `GET /api/profiles`. Способ — правило Vercel Firewall или сторонний
        сервис: выбрать, что доступно на тарифе Vercel (18.6). Стороннему сервису нужны аккаунт 🧑‍💻
        Разработчика и новая зависимость.
- [x] **18.4.** (аудит) **🧑‍💻 Разработчик:** Vercel → Settings → Functions → регион `fra1`. Сейчас
      функции работают в `iad1` (Вашингтон), а база во Франкфурте: каждый запрос к базе пересекает
      Атлантику (порядка 90 мс). Переключено на `fra1` 26.09.2026.
- [ ] **18.5. 🤖 ИИ и 🧑‍💻 Разработчик:** (аудит) мониторинг ошибок: Sentry или Vercel Observability.
      Сейчас есть только логи Vercel. Для Sentry нужны твой аккаунт и DSN в переменных Vercel,
      подключаю я.
- [ ] **18.6. 🧑‍💻 Разработчик решает:** тарифы Supabase и Vercel.
      - Supabase ✅: на Free проект засыпает после недели без запросов, а бэкапы делаются только
        вручную (`npm run db:dump`). Pro ($25 в месяц) не засыпает и хранит ежедневные бэкапы 7
        дней. **Решено 26.09.2026:** пока Free;
      - Vercel (перенесено из шага 18.9 28.09.2026): по условиям Vercel тариф Hobby — только для
        личных некоммерческих проектов, с рекламой и монетизацией (этап G) понадобится Pro.
        Проверить, на каком тарифе прод, и решить до публичного анонса.
- [ ] **18.7. 🤖 ИИ:** (аудит) CI в GitHub Actions: lint, typecheck, build. Сейчас перед продом код
      проверяет только сборка Vercel.
- [x] **18.8.** ~~Защита ветки `main`~~ — перенесено в шаг 18.9 (28.09.2026): обязательный CI
      рассчитан на мерж из другой ветки, поэтому защита нужна вместе с работой в `dev`.
- (аудит) Отдельный проект Supabase для разработки и превью-деплои Vercel на нём — вынесено
  в шаг 18.9.

#### Шаг 18.9. Тестовая среда на Vercel (staging)
Сейчас тестовой среды нет. Каждый коммит в `main` сразу уходит в прод, `npm run dev` работает
с боевой базой, а миграции применяются сразу к проду (решения 8 и 12). Нужен постоянный стенд
на Vercel со своей базой: изменения сначала проверяем там и только потом мержим в `main`
(решение пользователя 26.09.2026). Шаг можно делать в любой момент. Лучше — до шагов 9–10
и этапа E2: Facebook, Telegram и крупные правки удобнее проверять не на проде.

```
ветка dev   ── push ──▶ Vercel Preview    ──▶ dev.freud.in  ──▶ Supabase freudin_staging
ветка main  ── merge ─▶ Vercel Production ──▶ www.freud.in  ──▶ Supabase freudin_data
npm run dev (локально) ─────────────────────────────────────▶ Supabase freudin_staging
```

- [ ] **🧑‍💻 Разработчик решает:**
      - имя ветки и адрес стенда. Предлагаю ветку `dev` и домен `dev.freud.in`;
      - кто видит стенд. Предлагаю закрыть его Vercel Authentication (Settings → Deployment
        Protection → Standard Protection, есть на бесплатном тарифе): открыть стенд сможешь
        только ты под своим аккаунтом Vercel.
- [ ] **🧑‍💻 Разработчик:** второй проект Supabase `freudin_staging` в eu-central-1. На Free можно
      держать два активных проекта. Как и прод, он засыпает после недели без запросов, будить
      его кнопкой Restore. Ключи стенда пойдут в Vercel (Preview) и в локальный `.env`,
      поэтому `npm run dev` перестанет трогать прод.
- [ ] **🤖 ИИ:** скрипты БД для двух проектов. Сейчас `db:push`, `db:types` и `db:dump` работают
      со связанным проектом (`--linked`), и миграция легко уйдёт не туда. Нужны явные команды
      для стенда и прода (например, `db:push:staging` и `db:push:prod`). Порядок для миграции:
      стенд → проверка → `db:dump` прода → `db:push` в прод. Схема, bucket `avatars`
      и политики стенда создаются теми же миграциями.
- [ ] **🧑‍💻 Разработчик:** Supabase стенда → Authentication:
      - Providers → Google: те же Client ID и Secret, что у прода, Skip nonce check выключен;
      - провайдер Email выключен, как на проде;
      - Allow manual linking включён, как на проде (шаг 10.2);
      - URL Configuration: Site URL `https://dev.freud.in`, Redirect URLs
        `https://dev.freud.in/**` и `http://localhost:3000/**`. Понадобятся для Facebook
        и Telegram.
- [ ] **🧑‍💻 Разработчик:** Google Cloud → OAuth-клиент → Authorized redirect URIs: добавить
      `https://dev.freud.in/api/auth/callback/google`. Клиент и подтверждённый бренд те же:
      `freud.in` подтверждён в Search Console вместе с поддоменами.
- [ ] **🧑‍💻 Разработчик:** Telegram: в Redirect URIs бота добавить
      `https://dev.freud.in/api/auth/callback/telegram`, в Trusted Origins — `https://dev.freud.in`;
      провайдер `custom:telegram` в Supabase стенда с теми же Client ID и Secret.
- [ ] **🧑‍💻 Разработчик:** Vercel:
      - Settings → Environment Variables: `SUPABASE_*` стенда для окружения Preview (можно
        только для ветки `dev`), `GOOGLE_*` и `TELEGRAM_*` — тоже для Preview;
      - Settings → Domains → добавить `dev.freud.in` и привязать к ветке `dev` (Git Branch);
      - DNS в Timeweb: CNAME `dev` на адрес, который покажет Vercel;
      - Deployment Protection — по решению выше.
- [ ] **🧑‍💻 Разработчик:** защита ветки `main` в GitHub (Settings → Branches, перенесено из шага
      18.8): изменения попадают в `main` только pull request из `dev`, проверки CI (шаг 18.7)
      обязательны перед мержем.
- [ ] **🧑‍💻 Разработчик:** если будем работать в облачной сессии — её переменные (перенесено из шага
      5): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `GOOGLE_CLIENT_ID`,
      `GOOGLE_CLIENT_SECRET`, `TELEGRAM_CLIENT_ID`, `TELEGRAM_CLIENT_SECRET` (для приложения),
      `SUPABASE_ACCESS_TOKEN` и `SUPABASE_DB_PASSWORD` (для миграций и генерации типов). Ключи
      Supabase и пароль БД — стенда: с прод-ключами облачная сессия работала бы с боевой базой.
- [ ] **🤖 ИИ:** стенд не попадает в поиск. Проверить, ставит ли Vercel заголовок
      `X-Robots-Tag: noindex` на своём домене превью. Если нет — `robots.ts` и `metadata`
      отдают `noindex` вне прода (по `VERCEL_ENV`). Canonical и так ведут на `www.freud.in`.
- [ ] **🤖 ИИ:** другие превью-деплои (адреса `*.vercel.app` для прочих веток): вход через
      Google на них не работает, потому что Google принимает только заранее записанные адреса
      возврата. Задокументировать: вход проверяем только на `dev.freud.in` и localhost.
- [ ] **🤖 ИИ:** правила и документация. AGENTS.md: правила 9 и 10 и «Хостинг» в стеке.
      Процесс: работаем в `dev`, проверяем на стенде, мержишь в `main` ты. README: «Деплой»,
      «Переменные окружения» и «Внешние сервисы». В плане — решения 8 и 12 и риски.
- [ ] **🧑‍💻 Разработчик:** проверка стенда на `dev.freud.in`: вход через Google, онбординг, фото
      (в Storage стенда), редактирование, удаление аккаунта. В базе прода при этом ничего
      не меняется.

**Готово, когда:** push в `dev` сам появляется на `dev.freud.in`, стенд и локальная разработка
работают со своей базой, а в `main` попадает только проверенное на стенде.

#### Шаг 24. Юнит-тесты критичной логики
Запрос пользователя 28.09.2026 (правило 4 AGENTS.md: тесты пишем только по прямому запросу). E2e и
тесты интерфейса — по-прежнему только по отдельному запросу.

- [ ] **24.1. 🤖 ИИ:** предложить фреймворк и список логики. Фреймворк — Vitest: для него есть
      руководство в документации Next.js 16
      (`node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`). Кандидаты:
      `getSafeRedirectPath` (open redirect), проверка same-origin в `withErrorHandling` (CSRF),
      проверка `state` входа Google и Telegram, правила username и зарезервированные адреса,
      `normalizeSocialLinkUrl`, zod-схемы профиля (с полями шага 20), `getProfileChanges`,
      `isAccountDeletionConfirmed`, `detectAvatarImage` и лимиты размеров, `transliterate` и
      `getProfileSuggestions`, `getOAuthErrorCode`.
- [ ] **24.2. 🧑‍💻 Разработчик решает:** утвердить фреймворк и список.
- [ ] **24.3. 🤖 ИИ:** установить через npm 11, конфиг, скрипт `npm test`, тесты. README: стек,
      команды, покрытая логика. AGENTS.md: `npm test` в проверках, правило 4 — тесты этой логики
      поддерживаем при её изменении.
- [ ] **24.4. 🤖 ИИ:** запуск тестов в CI (18.7).

**Готово, когда:** `npm test` проходит локально и в CI, а список покрытой логики записан в README.

#### Шаг 19. Ручная приёмка
- [ ] **19.1. 🤖 ИИ:** чек-лист приёмки по сценариям ниже: что открыть, что нажать и что должно
      получиться.
- [ ] **19.2. 🧑‍💻 Разработчик:** для каждого провайдера: новый пользователь → онбординг → страница;
      повторный вход. Отдельно — Facebook без email (перенесено из 9.15): в онбординге и настройках
      есть поле «Email (optional)», почта сохраняется; у аккаунта Google этого поля нет. Если
      аккаунта Facebook без email нет, сценарий пропускаем: поле проверено в браузере с подменёнными
      ответами API (9.14).
- [ ] **19.3. 🧑‍💻 Разработчик:** редактирование профиля, смена фото и username, удаление аккаунта,
      404, мобильные устройства, тёмная тема.

### Этап G. После MVP (по согласованию)

- **Серверный рендер личных страниц `/<username>`** — единственное осознанное исключение
  из правила «без server components». Сейчас данные грузятся в браузере, и из-за этого:
  - поисковики, которые не выполняют JavaScript, видят пустую страницу;
  - превью ссылки в мессенджерах и соцсетях одно на весь сайт, а не с фото и именем человека;
  - на несуществующий адрес сервер отвечает 200, а не 404 («мягкая 404»);
  - (ревью) содержимое появляется поздно: HTML → JS → `/api/profiles/[username]` → отрисовка, всё
    это время виден скелетон, а заголовок вкладки выставляет эффект после загрузки. Насколько это
    медленно, покажет замер в шаге 17.6.

  Что сделать: `generateMetadata` со своими `title`, `description` и Open Graph,
  `opengraph-image` с фото и именем, настоящий 404 через `notFound()` и личные страницы
  в `sitemap.xml`. Формы и остальной UI остаются клиентскими.
- (аудит) Кеш публичного профиля в CDN: `s-maxage` у `GET /api/profiles/[username]` или
  `revalidateTag` после серверного рендера. Сейчас каждый просмотр страницы идёт в базу.
  (ревью) Срок кеша выбирать вместе с решением, как быстро правки должны видеть другие.
  Учесть: старое фото и документы удаляются из Storage сразу после замены, поэтому
  закешированный ответ со старой ссылкой покажет битую картинку. Владелец после перезагрузки
  тоже увидит старую версию. Пока посетителей мало, поиск по уникальному индексу справляется.
- (аудит) Редирект со старого адреса после смены username (например, 30 дней): ссылки,
  уже вставленные в био, продолжат работать. Сейчас настройки только предупреждают о смене.
- Разметка JSON-LD `ProfilePage` с `Person` внутри: имя, фото, описание, ссылки на соцсети в
  `sameAs`, после шагов 20–21 — подход, языки (`knowsLanguage`) и город. Делаем вместе с серверным
  рендером, иначе поисковики увидят её не везде.
- Привязка нескольких способов входа к одному аккаунту — перенесено в шаг 10.2.
- Собственный домен для Supabase Auth (тариф Pro и дополнение Custom Domain): для Google
  не нужен, это решено шагом 8.1. Понадобится, только если захотим домен сайта в адресах
  возврата Facebook и Telegram.
- Модерация и жалобы, QR-код страницы, статистика кликов, темы оформления страницы. Rate
  limiting API перенесён в шаг 18.3.
- Живое превью карточки в онбординге (перенесено из шага 13): пока дизайн минималистичный
  (решение 11).
- Картинка превью по умолчанию из токенов темы (перенесено из шага 17.8): `opengraph-image.tsx`
  через `ImageResponse` вместо статичного `opengraph-image.jpg`, чтобы после смены темы не
  перерисовывать её вручную. Это код в `src/app`, поэтому по согласованию, вместе с картинками
  превью личных страниц.
- Юнит-тесты критичной логики — шаг 24. E2e и остальные тесты — только по запросу.

#### Вход через Apple (бывший шаг 10.1)
Перенесён из этапа C 28.09.2026 (решение пользователя): Apple Developer Program стоит $99 в год,
пока не платим.

Вход через Apple ID (решение пользователя 26.09.2026). Идёт через OAuth Supabase, как Facebook
и Telegram, а не по схеме Google из шага 8.1, по двум причинам:
- Apple присылает ответ POST-запросом (`response_mode=form_post`) с `appleid.apple.com`,
  а наша защита от CSRF отклоняет такие запросы с чужого сайта;
- Apple не принимает адреса возврата с `http://` и `localhost`. Через Supabase адрес возврата
  у Apple один (`https://<ref>.supabase.co/auth/v1/callback`), и вход работает и локально.

**🧑‍💻 Разработчик:** участие в Apple Developer Program ($99 в год). В developer.apple.com →
Certificates, Identifiers & Profiles:
1. **App ID** с включённой возможностью Sign in with Apple. Это основной идентификатор.
2. **Services ID** — Client ID для веба, например `in.freud.web`. Название, которое увидит
   пользователь, задаётся здесь. Configure: Primary App ID из пункта 1, Domains
   `<ref>.supabase.co`, Return URLs `https://<ref>.supabase.co/auth/v1/callback`.
3. **Key** с Sign in with Apple. Файл `.p8` скачивается только один раз, сохрани его
   в менеджере паролей. Запиши Key ID и Team ID.
4. **Supabase** → Authentication → Providers → Apple:
   - Client IDs — Services ID;
   - Secret Key — JWT, собранный из `.p8`, Key ID и Team ID (генератор есть в документации
     Supabase про Apple).

   **Секрет живёт не больше 6 месяцев:** поставь напоминание перевыпустить его, иначе вход
   через Apple перестанет работать.

Для стенда (шаг 18.9) в тот же Services ID добавляются домен и Return URL проекта
`freudin_staging`.

- [ ] **🧑‍💻 Разработчик решает:** платить ли $99 в год за Apple Developer Program и как
      регистрироваться: как физлицо (Individual) или как организация (Organization, нужен номер
      D-U-N-S). 28.09.2026: пока не платим, поэтому вход через Apple перенесён после MVP.
- [ ] **🧑‍💻 Разработчик:** App ID, Services ID, ключ `.p8` и провайдер Apple в Supabase (пункты
      1–4 выше). Поставить напоминание перевыпустить секрет через 6 месяцев.
- [ ] **🤖 ИИ:** провайдер `apple` в `authProviders`, маппинг в `auth.server.ts`, подпись и
      логотип. Кнопка — по правилам Apple (Human Interface Guidelines): логотип Apple, текст
      «Continue with Apple», чёрная в светлой теме и белая в тёмной, не меньше остальных кнопок.
- [ ] **🤖 ИИ:** обновить `/privacy` и `/terms`: вход через Apple и какие данные он передаёт.
      Это идентификатор Apple ID, имя (только при первом входе) и email или адрес-пересыльщик
      `…@privaterelay.appleid.com`, если пользователь скрыл почту. Ещё cookie `sb-…-code-verifier` и
      как отвязать сайт в настройках Apple ID.
- [ ] **🤖 ИИ:** данные Apple в профиле:
      - фото Apple не отдаёт, поэтому кнопки «Use account photo» у таких пользователей нет;
      - имя приходит только при первом входе, без него пользователь вводит имя сам;
      - подсказку адреса не строим из адреса-пересыльщика: там случайные символы.

      Связано с приведением данных провайдеров в шаге 10.
- [ ] **🤖 ИИ:** добавить `apple` в `enabledAuthProviders`. В README — настройка Apple и дата
      выпуска секрета, в AGENTS.md — Apple в описании проекта и в роутах.
- [ ] **🧑‍💻 Разработчик:** проверить вход на localhost и на проде. На экране Apple должно быть
      название Freudin из Services ID. Если виден `<ref>.supabase.co`, решаем, как в шаге 8.1.
- [ ] **🤖 ИИ (по желанию):** отзыв токена Apple при удалении аккаунта (`/auth/revoke`), чтобы
      сайт пропал из списка «Вход с Apple» в настройках Apple ID. Для сайтов это не обязательно
      (требование App Store относится к приложениям), и Supabase сам этого не делает.

**Готово, когда:** вход через Apple, в том числе со скрытой почтой, создаёт пользователя и ведёт
на онбординг, а повторный вход попадает в тот же аккаунт.

#### Аналитика и реклама (Google Analytics 4, Meta Pixel)
Решение пользователя 26.09.2026: пока не подключаем, тексты опубликованы без них.
- [ ] Баннер согласия на cookies с категориями (необходимые, аналитика, реклама) и ссылка
      «Cookie settings» в подвале, чтобы изменить выбор.
- [ ] GA4 с Consent Mode: до согласия не ставит cookies. Срок хранения данных в GA — 14 месяцев.
- [ ] Meta Pixel только после согласия на рекламные cookies.
- [ ] Вернуть в `/privacy` и `/terms` разделы про аналитику и рекламу из `docs/legal/*.draft.md`
      и обновить дату «Last updated».
- [ ] **🧑‍💻 Разработчик:** Measurement ID из Google Analytics и Pixel ID из Meta Events Manager.

### Этап H. Юридические требования (отдельный этап)

Нужен до шага 18: без `/privacy` и `/terms` Meta не переведёт приложение в Live, а Google
не пропустит брендинг. Проверка приложений идёт днями, поэтому лучше не откладывать.
(аудит) Google в Supabase уже включён, поэтому сайт может собирать email, имя и фото: этап H
нужен до публичного анонса. С 26.09.2026 Google в статусе In production: зарегистрироваться
может любой аккаунт Google. Тексты `/privacy` и `/terms` опубликованы в тот же день (H.5).

- [x] **H.1. 🧑‍💻 Разработчик:** почта поддержки (решение 17). Адрес нужен для текстов `/privacy`
      и `/terms`, экрана согласия Google и приложения Meta. Сделано 26.09.2026: ящик
      `freudin.support@gmail.com`, адрес в коде и текстах. В `/privacy` и `/terms` провайдер
      почты — Gmail (Google), письма могут обрабатываться за пределами ЕС.
- [ ] **H.2. 🧑‍💻 Разработчик:** включить двухфакторную защиту ящика и сохранить резервные коды
      (инструкция ниже, пункт 1).
- [x] **H.3. 🧑‍💻 Разработчик:** прописать адрес в Google Branding и в Contact email приложения Meta
      (инструкция ниже, пункт 2). Сделано: подтвердил разработчик 28.09.2026.
- [x] **H.4.** Адрес поддержки в коде: `siteConfig.supportEmail`, ссылка в подвале, контакты в
      текстах `/privacy` и `/terms`, подсказка на странице ошибки (шаг 17.2). Сделано:
      `SupportEmailLink` в `shared/ui`, адрес в подвале и в текстах; страница ошибки — в шаге 17.2.
- [x] **H.5.** Тексты `/privacy` и `/terms`, раздел «Удаление данных» с инструкцией для Meta. Тексты
      — на английском (решение 16). **🧑‍💻 Разработчик:** оператор данных (ФИО, ИП или компания) и
      юрисдикция. Контактный email — `freudin.support@gmail.com`. Сделано 26.09.2026: тексты
      владельца опубликованы без Google Analytics и Meta Pixel (их на сайте нет), домен
      `www.freud.in` вместо `freudin.com`, дописаны публичный профиль, удаление аккаунта в
      настройках, провайдеры по именам (Supabase, Vercel, Gmail) и фактические cookies. Исходники с
      аналитикой — `docs/legal/*.draft.md`. Реквизиты оператора — `legalConfig` в `shared/config`, у
      разделов есть якоря (`/privacy#account-and-data-deletion`). Проверено в headless Chromium:
      один `<h1>`, заголовки по порядку, без горизонтальной прокрутки на 320 px.
- [ ] **H.6. 🧑‍💻 Разработчик (рекомендуется):** вычитать опубликованные тексты с юристом, особенно
      разделы, которые я дописал.
- [x] **H.7.** Применимое право с учётом того, что база в ЕС (eu-central-1). Если появится аудитория
      из РФ, вернуться к 152-ФЗ (см. «Риски»). Решено: право Грузии, обязательные нормы страны
      пользователя (в том числе GDPR) — где требуется (решение 13).
- [x] **H.8.** (аудит) Пока текстов нет, закрыть `/privacy` и `/terms` от индексации (`noindex`) и
      убрать их из `sitemap.xml`: сейчас пустые страницы индексируются. Не понадобилось: тексты
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

### Этап I. Страница «О нас»

Решение пользователя 28.09.2026: страница о проекте, где Freudin сравнивается с сервисами поиска
психологов и с поиском через сарафанное радио и соцсети. Адрес `about` уже зарезервирован,
пользователь занять его не мог.

#### Шаг 25. Текст «О нас»
- [ ] **25.1. 🧑‍💻 Разработчик решает:** с чем сравниваем (конкретные сервисы или их типы: каталоги,
      платформы с подбором специалиста) и ключевые тезисы: зачем Freudin и чем он отличается.
      Основа тезисов — `docs/PRODUCT.md`: пять опор и «Чего Freudin не делает».
- [ ] **25.2. 🤖 ИИ:** черновик на английском: о проекте и таблица сравнения Freudin, сервисов
      поиска, сарафанного радио и соцсетей по критериям вроде «кто выбирает специалиста»,
      «комиссия», «проверка документов», «кто управляет страницей». О чужих сервисах — только
      проверяемые факты со ссылкой на их условия: неточное сравнение с конкурентами — юридический
      риск.
- [ ] **25.3. 🧑‍💻 Разработчик:** вычитать и утвердить текст.

#### Шаг 26. Вёрстка «О нас»
- [ ] **26.1. 🤖 ИИ:** страница `/about`: путь в `routes`, view `about`, `metadata` с canonical,
      `sitemap.xml`, ссылка в подвале. Сравнение — семантическая таблица; на 320 px прокручивается
      только таблица, а не страница. SEO по чек-листу AGENTS.md. README и AGENTS.md: роут.
- [ ] **26.2. 🧑‍💻 Разработчик:** проверка на проде.

**Готово, когда:** `/about` открывается из подвала, проходит SEO-чек-лист и есть в `sitemap.xml`.

### Этап J. Страница «Контакты»

Решение пользователя 28.09.2026: отдельная страница контактов. Адреса `contact` и `contacts` уже
зарезервированы.

#### Шаг 27. Страница «Контакты»
- [ ] **27.1. 🧑‍💻 Разработчик решает:**
      - адрес: `/contact` или `/contacts`;
      - что на странице: почта поддержки, реквизиты оператора (`legalConfig`), соцсети проекта;
      - нужна ли форма обратной связи. Для неё понадобятся сервис отправки писем (новая зависимость
        и его аккаунт), защита от спама и rate limiting, а в `/privacy` — новый получатель данных.
        Форма — отдельный шаг.
- [ ] **27.2. 🤖 ИИ:** страница: путь в `routes`, view, `metadata` с canonical, `sitemap.xml`, ссылка
      в подвале, `SupportEmailLink` и `OperatorDetails`. README и AGENTS.md: роут.
- [ ] **27.3. 🧑‍💻 Разработчик:** проверка на проде.

**Готово, когда:** страница контактов открывается из подвала и есть в `sitemap.xml`.

### Этап K. Лента постов из соцсетей

Опора 3.4 `docs/PRODUCT.md` (29.09.2026): на главной — лента последних постов психологов из их
соцсетей. В неё попадают только те, кто разрешил это в настройках аккаунта.

#### Шаг 32. Лента на главной
- [ ] **32.1. 🤖 ИИ:** исследование: какие соцсети из справочника `social-link` отдают посты и на
      каких условиях (API, разрешение владельца аккаунта, тип аккаунта, цена, лимиты). Что нужно
      от психолога: подключить аккаунт или достаточно ссылки.
- [ ] **32.2. 🧑‍💻 Разработчик решает:** соцсети первой версии и свежесть ленты («в реальном
      времени» — минуты или часы).
- [ ] **32.3. 🤖 ИИ:** согласие в настройках аккаунта (включить и отозвать), получение и хранение
      постов, `/privacy` и `/terms` (правило 11 AGENTS.md).
- [ ] **32.4. 🤖 ИИ:** лента на главной: превью постов со ссылкой на оригинал и на страницу
      психолога.
- [ ] **32.5. 🧑‍💻 Разработчик:** приложения и ключи в выбранных соцсетях, проверка на проде.

**Готово, когда:** психолог включает показ постов в настройках, и его новые посты появляются в ленте
на главной; после отключения они пропадают.

### Этап L. AI-ассистент подбора

Опора 3.5 `docs/PRODUCT.md` (29.09.2026): посетитель рассказывает о своём случае, а ассистент
предлагает психологов из каталога с учётом случая, языка, локации и бюджета. Нужны поиск
(шаг 22) и запросы психологов (шаг 29).

#### Шаг 33. AI-ассистент
- [ ] **33.1. 🤖 ИИ:** предложить схему: AI-сервис и модель; как ассистент выбирает из каталога
      (параметры поиска из рассказа → `GET /api/profiles`); что уходит AI-сервису и что хранится
      (лучше ничего: рассказ — данные о здоровье); предупреждение, что это не медицинская помощь,
      и ответ на кризисные сообщения; лимиты запросов и оценка стоимости.
- [ ] **33.2. 🧑‍💻 Разработчик решает:** AI-сервис, месячный бюджет и лимит запросов
      на посетителя.
- [ ] **33.3. 🤖 ИИ:** API ассистента (ключ AI-сервиса — серверная переменная), интерфейс
      на главной, rate limiting (шаг 18.3), `/privacy` и `/terms`: новый получатель данных
      и данные о здоровье.
- [ ] **33.4. 🧑‍💻 Разработчик:** аккаунт AI-сервиса и ключ в Vercel, проверка на проде на разных
      сценариях.

**Готово, когда:** посетитель без регистрации описывает свой случай и получает подходящих
психологов из каталога со ссылками на их страницы.

## 6. Что понадобится от разработчика (сводка)

| Когда | Что |
|-------|-----|
| ✅ Сделано | Решения раздела 3, доступ к `ui.shadcn.com`, юрисдикция (решение 13); проект Supabase, ключи, URL Configuration, провайдер Email выключен, тариф Supabase Free и копии через `npm run db:dump`; миграции; Google: OAuth-клиент, свой адрес возврата, Search Console, проверка бренда, In production; бот Telegram и его прод-домен; Allow manual linking и проверка привязки способов входа (10.2); регион функций `fra1`; почта поддержки, оператор данных и право для `/privacy` и `/terms`; адрес поддержки в Google Branding и Meta (H.3); где лежат токены темы (17.8); Facebook в Live (9.21); проверки шагов 20, 21 и 28 на проде; публикация кита (23.1, 23.11), его просмотр (23.5) и темы (23.8) |
| Шаг 9 | 9.18 — бизнес-портфель и подтверждение компании в Meta (в процессе); 9.20 — статус разрешения `email` в App Review |
| Этап E2 | 17.1 — проверка с VoiceOver (по желанию); 17.5 — вычитать таблицу текстов |
| Этап E3 | 17.8 — посмотреть пробную смену темы |
| Шаг 18 | 18.3 — аккаунт стороннего сервиса для rate limiting, если он понадобится; 18.5 — выбрать мониторинг ошибок; 18.6 — тариф Vercel |
| Шаг 18.9 | Имя ветки, домен стенда и доступ к нему; проект `freudin_staging` и его Auth; адреса возврата стенда в Google и Telegram; переменные, домен и DNS в Vercel и Timeweb; защита ветки `main`; переменные облачной сессии, если она нужна; проверка стенда |
| Шаг 19 | 19.2–19.3 — ручная приёмка, в том числе Facebook без email |
| Этап H | H.2 — двухфакторная защита ящика поддержки; H.6 — вычитка текстов с юристом (рекомендуется) |
| Шаг 22 | 22.1 — кто попадает в поиск и какие фильтры; 22.5 — проверка на проде |
| Шаги 29–31 | 29.2 — утвердить список запросов; 30.1 — образование и публичные контакты; 31.1 — структура главной; миграции и проверки на проде |
| Шаг 24 | 24.2 — утвердить фреймворк и список логики для юнит-тестов |
| Этап I | 25.1 — с чем сравниваем и ключевые тезисы; 25.3 — утвердить текст; 26.2 — проверка на проде |
| Этап J | 27.1 — адрес, содержание и нужна ли форма обратной связи; 27.3 — проверка на проде |
| Этап K | 32.2 — соцсети первой версии и свежесть ленты; 32.5 — приложения в соцсетях и проверка |
| Этап L | 33.2 — AI-сервис, бюджет и лимиты; 33.4 — аккаунт и ключ AI-сервиса, проверка |
| Этап G | Вход через Apple: решить про Apple Developer Program ($99 в год), затем App ID, Services ID, ключ `.p8`, секрет в Supabase и его перевыпуск раз в 6 месяцев. Measurement ID и Pixel ID, когда решим подключать аналитику |

Реальный вход через провайдеров проверяешь ты, на localhost или на проде. Из облачной сессии
я проверяю сборку, типы, линт и API, но пройти OAuth не могу.

## 7. Риски

| Риск | Что делаем |
|------|------------|
| Связка Telegram OIDC + кастомный провайдер Supabase появилась недавно | Проверяем на шаге 10 в первую очередь, есть запасной план |
| Facebook: без Live-режима входят только тестировщики, у части аккаунтов нет email | Live на шаге 9.21, понятная ошибка на `/login` |
| Секрет Apple для Supabase истекает не позже чем через 6 месяцев, и вход через Apple молча ломается | Напоминание о перевыпуске, дата выпуска — в README (этап G, «Вход через Apple») |
| Способ входа, который хотят привязать, уже есть у другого аккаунта: объединять аккаунты с профилями не умеем | Понятная ошибка и инструкция: войти во второй аккаунт и удалить его, потом привязать (шаг 10.2) |
| Экран согласия Google показывает `<ref>.supabase.co` | Свой адрес возврата на `www.freud.in` и проверка бренда (шаг 8.1) |
| Свой обмен кода Google: ошибка в проверке `state` или `nonce` ослабит вход | `state` в httpOnly-cookie на 10 минут, одноразовой; PKCE; `nonce` и подпись токена проверяет Supabase |
| react-hook-form + React Compiler | Используем TanStack Form |
| Личные страницы рендерятся на клиенте: без JavaScript поисковик видит пустую страницу, превью ссылок общее, несуществующий адрес отдаёт 200 («мягкая 404») | Серверный рендер `/<username>` и JSON-LD на этапе G, по согласованию |
| Если аудитория в РФ, 152-ФЗ требует хранить персональные данные россиян на серверах в России, а Supabase за рубежом | ✅ Решено: пока считаем, что пользователи не из РФ (решение 13). Если аудитория изменится, вернёмся к вопросу на этапе H |
| Сетевая политика облачного окружения закрывает `ui.shadcn.com`, `*.supabase.co`, `api.supabase.com` | ✅ Снято: окружению открыт полный доступ в сеть |
| Username совпадает с роутом сайта | Список зарезервированных имён и проверка на сервере |
| Лимит тела запроса на Vercel 4.5 МБ | Сжимаем фото на клиенте до 512 px |
| Каждый коммит в `main` сразу уходит в прод, превью нет, база одна для разработки и прода | Перед мержем прогоняем lint, typecheck и build; переменные окружения прода задаём до мержа кода, который их читает. CI — шаг 18.7, тестовая среда со своей базой — шаг 18.9 |

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
