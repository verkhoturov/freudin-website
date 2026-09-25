# Freudin

Сайт, где можно зарегистрироваться через Google, Meta (Facebook) или Telegram и получить личную
страницу с уникальной ссылкой: фото, имя, описание и ссылки на соцсети.

> Проект в разработке. План и прогресс: [`docs/PLAN.md`](docs/PLAN.md). Правила для
> разработчиков и AI-агентов: [`AGENTS.md`](AGENTS.md).

## Возможности (MVP)

- вход и регистрация через Google, Facebook и Telegram;
- онбординг: фото, имя, описание, адрес страницы, ссылки на соцсети;
- публичная страница `https://<домен>/<username>`;
- редактирование профиля, выход, удаление аккаунта.

## Текущее состояние

Готовы:

- каркас Feature-Sliced Design и страницы-заглушки для всех роутов;
- минималистичный интерфейс на стандартных компонентах shadcn/ui: светлая и тёмная темы,
  шапка и подвал;
- клиент API на TanStack Query и первый API-роут `/api/health`;
- SEO-база: домен `www.freud.in`, Open Graph с картинкой превью, `robots.txt`, `sitemap.xml`,
  `noindex` для служебных страниц;
- проверка границ между слоями FSD в линтере;
- модель профиля: правила адреса страницы (username) и зарезервированные адреса, проверка имени,
  описания и ссылок на соцсети, приведение `@handle` к ссылке;
- экран входа с кнопками Google, Facebook и Telegram и показом ошибок;
- личная страница: карточка, состояния загрузки, 404 и ошибки, кнопка «Поделиться»;
- минимальная главная.

Авторизации и базы данных пока нет. Поэтому кнопки входа ведут на заглушку
`/api/auth/sign-in`, которая возвращает на `/login` с ошибкой «Вход пока недоступен», а личная
страница показывает только демо-профиль по адресу `/demo`.

## Стек

| Задача | Выбор | Статус |
|--------|-------|--------|
| Фреймворк | Next.js 16 (App Router, React Compiler), React 19, TypeScript 5 | ✅ |
| Стили | Tailwind CSS 4, `tw-animate-css` | ✅ |
| UI-компоненты | shadcn/ui на Radix (`radix-ui`, `class-variance-authority`, `cn`), lucide-react | ✅ |
| Темы и уведомления | next-themes, sonner | ✅ |
| Запросы к API | TanStack Query (+ Devtools в dev) | ✅ |
| Валидация | zod | ✅ |
| Формы | TanStack Form | шаг 13 |
| Клиентское состояние | Zustand | шаг 13 |
| БД, авторизация, файлы | Supabase | шаги 5–7 |
| Линтер и форматтер | Biome | ✅ |
| Хостинг | Vercel, прод на `www.freud.in` | ✅ |

Номера шагов указаны по [`docs/PLAN.md`](docs/PLAN.md).

## Быстрый старт

Нужны Node.js 20.9+ и npm 11+ (с npm 10 в `package-lock.json` появляются лишние изменения).

```bash
npm install
npm run dev
```

Сайт откроется на http://localhost:3000. Пример личной страницы — http://localhost:3000/demo.

## Переменные окружения

Сейчас приложение запускается без них. Шаблон — [`.env.example`](.env.example): скопируй его
в `.env.local` и заполни, когда дойдём до Supabase. Все переменные серверные и в браузер
не попадают.

| Переменная | Где взять | Нужна с |
|------------|-----------|---------|
| `SUPABASE_URL` | Supabase → Project Settings → API Keys | шага 7 |
| `SUPABASE_PUBLISHABLE_KEY` | там же, ключ `sb_publishable_…` | шага 7 |
| `SUPABASE_SECRET_KEY` | там же, ключ `sb_secret_…` | шага 7 |

Переменные проверяются zod-схемой при первом обращении (`getServerEnv()`), поэтому
`npm run build` проходит без них.

Для Supabase CLI (миграции и генерация типов) нужны ещё две переменные. Приложению они не нужны:

| Переменная | Где взять |
|------------|-----------|
| `SUPABASE_ACCESS_TOKEN` | Supabase → Account → Access Tokens |
| `SUPABASE_DB_PASSWORD` | пароль базы, задаётся при создании проекта (Project Settings → Database) |

## Скрипты

| Команда | Что делает |
|---------|------------|
| `npm run dev` | dev-сервер на http://localhost:3000 |
| `npm run build` | прод-сборка |
| `npm run start` | запуск прод-сборки |
| `npm run lint` | Biome: линт, формат, порядок импортов, границы слоёв FSD |
| `npm run lint:fix` | то же с автоисправлением |
| `npm run typecheck` | генерация типов роутов (`next typegen`) и проверка типов (`tsc --noEmit`) |

## Структура проекта

Код организован по [Feature-Sliced Design](https://feature-sliced.design) с двумя поправками:
вместо слоя `pages` используется `views`, а слоя `features` нет.

```
src/
├─ app/                # роутинг Next.js (App Router) и слой app
│  ├─ layout.tsx       # html/body, шрифты, metadata, шапка, <main>, подвал
│  ├─ _providers/      # темы, TanStack Query, тултипы, уведомления
│  ├─ robots.ts, sitemap.ts, opengraph-image.jpg   # SEO-файлы
│  └─ api/             # API-роуты; _lib — общие хелперы (ошибки, ответы, zod)
├─ views/              # страницы: home, login, onboarding, settings, profile, privacy, terms, not-found
├─ widgets/            # header, footer, sign-in-panel, profile-card
├─ entities/           # viewer (вход), profile (профиль и username), social-link (ссылки на соцсети)
└─ shared/
   ├─ ui/              # компоненты shadcn/ui, Container, Logo, ThemeToggle, NotFoundState, PagePlaceholder
   ├─ lib/             # утилиты: cn, безопасный редирект по ?next=
   ├─ api/             # apiClient, ApiError, QueryClient
   └─ config/          # routes, apiRoutes, site, зарезервированные адреса, серверный env
components.json        # настройки shadcn/ui (алиасы под FSD)
.env.example           # шаблон переменных окружения
docs/
└─ PLAN.md             # пошаговый план
```

Файлы в `src/app` только реэкспортируют страницы из `src/views`. Страницы — клиентские
компоненты, а вся серверная логика будет жить в `src/app/api`. Правила слоёв и импортов
описаны в [`AGENTS.md`](AGENTS.md), линтер проверяет их при `npm run lint`.

## Роуты

| Путь | Страница | Статус |
|------|----------|--------|
| `/` | главная | готово (минимальная) |
| `/login` | вход | интерфейс готов, сам вход — после Supabase |
| `/onboarding` | создание страницы после первого входа | заглушка |
| `/settings` | настройки профиля и аккаунта | заглушка |
| `/<username>` | личная страница пользователя | интерфейс готов, данные — демо-профиль `/demo` |
| `/privacy` | политика конфиденциальности | заглушка |
| `/terms` | условия использования | заглушка |

API:

| Метод | Путь | Назначение | Статус |
|-------|------|------------|--------|
| GET | `/api/health` | проверка связки клиент → API | готово |
| GET | `/api/auth/sign-in?provider=&next=` | старт входа | заглушка: возвращает на `/login` с ошибкой |
| GET | `/api/profiles/[username]` | публичный профиль | заглушка: только `demo`, остальным 404 |

Полный список запланированных API-роутов со статусами — в [`AGENTS.md`](AGENTS.md#api).

Служебные файлы: `/robots.txt`, `/sitemap.xml` и `/opengraph-image.jpg` (картинка превью ссылок).

## SEO

- Прод-адрес — `https://www.freud.in` (`siteConfig.url`), `freud.in` редиректит на него. От этого
  адреса строятся `metadataBase`, canonical, `robots.txt` и `sitemap.xml`.
- Open Graph и карточка Twitter по умолчанию: название, описание, `ru_RU` и картинка
  `src/app/opengraph-image.jpg` (1200×630).
- У `/`, `/privacy` и `/terms` есть canonical, и они перечислены в `sitemap.xml`.
- `/login`, `/onboarding` и `/settings` закрыты от индексации (`noindex, follow`).
- Личные страницы пока рендерятся на клиенте, поэтому поисковики и превью ссылок видят только
  общие данные сайта. Серверный рендер для них запланирован на этапе G.

## Дизайн

- Пока минималистичный дизайн: стандартные компоненты shadcn/ui и минимум контента — только
  навигация и поля ввода.
- shadcn/ui на Radix, стиль по умолчанию (nova), нейтральная палитра, шрифт Geist (с кириллицей),
  иконки lucide. Токены темы — в `src/app/globals.css`.
- Светлая, тёмная и системная темы, переключатель в шапке.
- Вёрстка mobile-first, есть ссылка «Перейти к содержимому» для навигации с клавиатуры.
- Компоненты добавляются командой `npx shadcn add <component>` и попадают в `src/shared/ui`.

## Внешние сервисы

Инструкции по настройке появятся здесь по мере интеграции:

- Supabase (БД, авторизация, хранилище фото): шаги 5–7;
- вход через Google: шаг 8;
- вход через Facebook: шаг 9;
- вход через Telegram: шаг 10;
- Vercel: подключён, см. «Деплой».

## Деплой

Хостинг — Vercel. Каждый коммит в `main` сразу выкладывается в прод на `https://www.freud.in`,
`freud.in` редиректит туда. Отдельного стенда нет, превью-деплои не используем: вход и интеграции
проверяем локально, а после мержа — на проде.

Переменные окружения прода задаются в Vercel → Settings → Environment Variables (окружение
Production). Приложению они нужны с шага 7, и задать их надо до того, как код, который их читает,
попадёт в `main`.
