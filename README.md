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
- вход и выход через Google (OAuth через Supabase), меню пользователя в шапке, защита
  приватных страниц: гостя `/onboarding` и `/settings` отправляют на вход;
- личная страница: карточка, состояния загрузки, 404 и ошибки, кнопка «Поделиться»;
- API профиля: создание и обновление профиля, публичный профиль из БД, проверка, свободен ли
  адрес страницы;
- фото профиля: загрузка с кропом и сжатием на клиенте, копирование фото из аккаунта
  провайдера, удаление;
- онбординг: форма с предзаполнением из данных провайдера, проверкой адреса и черновиком,
  который переживает перезагрузку страницы;
- настройки: редактирование профиля и фото, способ входа, выход и удаление аккаунта;
  владелец видит на своей странице кнопку «Редактировать»;
- минимальная главная;
- схема БД в Supabase: таблица `profiles` с RLS и bucket `avatars` для фото.

Вход через Facebook и Telegram пока возвращает на `/login` с ошибкой «Этот способ входа пока
недоступен» (шаги 9–10). Страницы `/privacy` и `/terms` — заглушки (этап H). Пример личной
страницы — демо-профиль по адресу `/demo`.

## Стек

| Задача | Выбор | Статус |
|--------|-------|--------|
| Фреймворк | Next.js 16 (App Router, React Compiler), React 19, TypeScript 5 | ✅ |
| Стили | Tailwind CSS 4, `tw-animate-css` | ✅ |
| UI-компоненты | shadcn/ui на Radix (`radix-ui`, `class-variance-authority`, `cn`), lucide-react | ✅ |
| Темы и уведомления | next-themes, sonner | ✅ |
| Запросы к API | TanStack Query (+ Devtools в dev) | ✅ |
| Валидация | zod | ✅ |
| Формы | TanStack Form | ✅ |
| Клиентское состояние | Zustand (черновик онбординга) | ✅ |
| Кроп фото | react-easy-crop | ✅ |
| БД, авторизация, файлы | Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Supabase CLI (миграции и типы) | ✅ БД и вход через Google; Facebook и Telegram — шаги 9–10 |
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

Шаблон — [`.env.example`](.env.example): скопируй его в `.env` и заполни. Этот файл читают
и Next.js, и Supabase CLI. Все переменные серверные и в браузер не попадают. Без них
сайт открывается, но API-роуты, которые работают с Supabase (`/api/me`, `/api/profile`,
`/api/profiles/…`, `/api/usernames/…`), отвечают 500. Демо-профиль `/demo` работает и без них.

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
| `npm run db:push` | применить новые миграции из `supabase/migrations` к базе проекта |
| `npm run db:types` | сгенерировать типы БД в `src/shared/api/supabase/database.types.ts` |

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
├─ widgets/            # header, footer, sign-in-panel, profile-card, profile-form, account-settings
├─ entities/           # viewer (вход), profile (профиль и username), social-link (ссылки на соцсети)
└─ shared/
   ├─ ui/              # компоненты shadcn/ui, Container, Logo, ThemeToggle, NotFoundState, PagePlaceholder
   ├─ lib/             # утилиты: cn, безопасный редирект по ?next=, кроп фото, буфер обмена
   ├─ api/             # apiClient, ApiError, QueryClient; на сервере — клиенты Supabase и типы БД
   └─ config/          # routes, apiRoutes, site, зарезервированные адреса, серверный env
supabase/
├─ config.toml         # настройки Supabase CLI
└─ migrations/         # SQL-миграции схемы БД и Storage
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
| `/login` | вход; вошедшего пользователя уводит дальше | готово: Google |
| `/onboarding` | создание страницы после первого входа | готово; вошедшего с профилем уводит на его страницу |
| `/settings` | настройки профиля и аккаунта | готово, доступна только вошедшим с профилем |
| `/<username>` | личная страница пользователя | готово; `/demo` — демо-профиль |
| `/privacy` | политика конфиденциальности | заглушка |
| `/terms` | условия использования | заглушка |

API:

| Метод | Путь | Назначение | Статус |
|-------|------|------------|--------|
| GET | `/api/health` | проверка связки клиент → API | готово |
| GET | `/api/auth/sign-in?provider=&next=` | старт входа, редирект к провайдеру | готово: Google |
| GET | `/api/auth/callback?code=&next=` | обмен кода на сессию, редирект дальше | готово |
| POST | `/api/auth/sign-out` | выход | готово |
| GET | `/api/me` | текущий пользователь, способ входа, его профиль и подсказки для онбординга | готово |
| DELETE | `/api/me` | удаление аккаунта со всеми данными | готово |
| POST | `/api/profile` | создание профиля (онбординг) | готово |
| PATCH | `/api/profile` | обновление профиля (только переданные поля) | готово |
| POST | `/api/profile/avatar` | новое фото: файл или копия фото из аккаунта провайдера | готово |
| DELETE | `/api/profile/avatar` | удаление фото | готово |
| GET | `/api/profiles/[username]` | публичный профиль | готово |
| GET | `/api/usernames/[username]` | свободен ли адрес страницы | готово |

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

- Supabase (БД, авторизация, хранилище фото): см. ниже;
- вход через Google: см. ниже;
- вход через Facebook: шаг 9;
- вход через Telegram: шаг 10;
- Vercel: подключён, см. «Деплой».

### Supabase

Один облачный проект `freudin_data` в регионе eu-central-1 (Франкфурт). Он же прод: отдельной
базы для разработки нет.

- Authentication → URL Configuration: Site URL `https://www.freud.in`, в Redirect URLs —
  `http://localhost:3000/**` для локальной разработки.
- Схема меняется только миграциями. Новая миграция создаётся командой
  `npx supabase migration new <name>`, применяется командой `npm run db:push`, после неё
  обновляются типы: `npm run db:types`.
- Supabase CLI уже привязан к проекту (`supabase link`). На новой машине привяжи заново:
  `npx supabase link --project-ref <ref>`.
- Прямой адрес базы доступен только по IPv6. Если сеть его не поддерживает, CLI сам идёт через
  пулер, а для `psql` используй `aws-0-eu-central-1.pooler.supabase.com:5432` с пользователем
  `postgres.<ref>`.

### Вход через Google

1. Google Cloud → Google Auth Platform:
   - Branding: название, логотип, ссылки на `/privacy` и `/terms`;
   - Audience: External. Пока приложение в статусе Testing, войти могут только тестовые пользователи из этого же раздела;
   - Data access: `openid`, `email`, `profile`.
2. Clients → Create client → Web application:
   - Authorized JavaScript origins: `http://localhost:3000` и `https://www.freud.in`;
   - Authorized redirect URIs: `https://<ref>.supabase.co/auth/v1/callback`.
3. Client ID и Client Secret внести в Supabase → Authentication → Sign In / Providers → Google и включить провайдер.

Как устроен вход: кнопка ведёт на `/api/auth/sign-in`, оттуда браузер уходит к Google через
Supabase (PKCE, верификатор хранится в cookie), возвращается на `/api/auth/callback` и попадает
на онбординг, если профиля ещё нет, иначе на свою страницу или на `?next=`. Cookies сессии
`httpOnly`: браузер их не читает, сессию видят только API-роуты.

## Деплой

Хостинг — Vercel. Каждый коммит в `main` сразу выкладывается в прод на `https://www.freud.in`,
`freud.in` редиректит туда. Отдельного стенда нет, превью-деплои не используем: вход и интеграции
проверяем локально, а после мержа — на проде.

Переменные окружения прода задаются в Vercel → Settings → Environment Variables (окружение
Production). Приложению они нужны с шага 7, и задать их надо до того, как код, который их читает,
попадёт в `main`.
