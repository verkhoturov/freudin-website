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
- дизайн-система на shadcn/ui со светлой и тёмной темами, шапка и подвал;
- клиент API на TanStack Query и первый API-роут `/api/health`;
- проверка границ между слоями FSD в линтере.

Авторизации и базы данных пока нет.

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
| Хостинг | Vercel | шаг 18 |

Номера шагов указаны по [`docs/PLAN.md`](docs/PLAN.md).

## Быстрый старт

Нужны Node.js 20.9+ и npm 11+ (с npm 10 в `package-lock.json` появляются лишние изменения).

```bash
npm install
npm run dev
```

Сайт откроется на http://localhost:3000. На главной временно выведены список всех
страниц-заглушек и статус API.

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
│  └─ api/             # API-роуты; _lib — общие хелперы (ошибки, ответы, zod)
├─ views/              # страницы: home, login, onboarding, settings, profile, privacy, terms, not-found
├─ widgets/            # header, footer
├─ entities/           # бизнес-сущности (пока пусто)
└─ shared/
   ├─ ui/              # компоненты shadcn/ui, Container, Logo, ThemeToggle, PagePlaceholder
   ├─ lib/             # утилиты (cn)
   ├─ api/             # apiClient, ApiError, QueryClient, запрос /api/health
   └─ config/          # routes, apiRoutes, site, серверный env
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
| `/` | главная | заглушка |
| `/login` | вход | заглушка |
| `/onboarding` | создание страницы после первого входа | заглушка |
| `/settings` | настройки профиля и аккаунта | заглушка |
| `/<username>` | личная страница пользователя | заглушка |
| `/privacy` | политика конфиденциальности | заглушка |
| `/terms` | условия использования | заглушка |

API:

| Метод | Путь | Назначение | Статус |
|-------|------|------------|--------|
| GET | `/api/health` | проверка связки клиент → API | готово |

Полный список запланированных API-роутов со статусами — в [`AGENTS.md`](AGENTS.md#api).

## Дизайн

- shadcn/ui на Radix, стиль Maia: нейтральная палитра с фиолетовым акцентом, шрифт Geist
  (с кириллицей), иконки lucide. Токены темы — в `src/app/globals.css`.
- Светлая, тёмная и системная темы, переключатель в шапке. Акцентный цвет тёмной темы подобран
  под контраст WCAG AA.
- Вёрстка mobile-first, есть ссылка «Перейти к содержимому» для навигации с клавиатуры.
- Компоненты добавляются командой `npx shadcn add <component>` и попадают в `src/shared/ui`.

## Внешние сервисы

Инструкции по настройке появятся здесь по мере интеграции:

- Supabase (БД, авторизация, хранилище фото): шаги 5–7;
- вход через Google: шаг 8;
- вход через Facebook: шаг 9;
- вход через Telegram: шаг 10;
- Vercel: шаг 18.

## Деплой

Планируется на Vercel (шаг 18).
