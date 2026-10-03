# Freudin

Сайт для психологов и их будущих клиентов. Психолог входит через Google, Meta (Facebook) или
Telegram и делает личную страницу-визитку с уникальной ссылкой, а клиент без регистрации находит
психолога. Сайт не проверяет психологов, не участвует в их общении с клиентами и не берёт оплату.

> Проект в разработке. О продукте: [`docs/PRODUCT.md`](docs/PRODUCT.md). План и прогресс:
> [`docs/PLAN.md`](docs/PLAN.md). Правила для разработчиков и AI-агентов: [`AGENTS.md`](AGENTS.md).

## Возможности (MVP)

- вход и регистрация через Google, Facebook и Telegram;
- онбординг: фото, имя, описание, адрес страницы, ссылки на соцсети;
- публичная страница `https://<домен>/<username>`;
- редактирование профиля, выход, удаление аккаунта.

Провайдер появляется на странице входа, когда его добавляют в `enabledAuthProviders`
(`src/entities/viewer/config/auth-providers.ts`). Интерфейс сайта, ошибки API и юридические
тексты `/privacy` и `/terms` — на английском. Пример личной страницы — демо-профиль по адресу
`/demo`.

Лента постов из соцсетей пока в плане: в [этапе K](docs/PLAN.md#этап-k-лента-постов-из-соцсетей)
записаны два референса Linktree — виджет последних постов и сетка публикаций. Формат и место
показа выбираются перед реализацией.

## Стек

| Задача | Выбор | Статус |
|--------|-------|--------|
| Фреймворк | Next.js 16 (App Router, React Compiler), React 19, TypeScript 5 | ✅ |
| Стили | Tailwind CSS 4, `tw-animate-css` | ✅ |
| UI-компоненты | shadcn/ui на Radix (`radix-ui`, `cn` — слияние классов; варианты классов — своя `cva` в `shared/lib` вместо `class-variance-authority`), lucide-react; `cmdk` — список с поиском (`command`); `@dnd-kit/core` и `@dnd-kit/sortable` — перетаскивание в списке порядка блоков | ✅ |
| Темы и уведомления | next-themes, sonner | ✅ |
| Запросы к API | TanStack Query (+ Devtools в dev) | ✅ |
| Валидация | zod | ✅ |
| Формы | TanStack Form | ✅ |
| Клиентское состояние | Zustand (черновик онбординга) | ✅ |
| Кроп фото | react-easy-crop | ✅ |
| QR-код страницы | qrcode.react (рисуется в браузере, без внешних сервисов) | ✅ |
| БД, авторизация, файлы | Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Supabase CLI (миграции и типы) | ✅ БД, вход через Google, Facebook и Telegram |
| UI kit | Storybook 10 (`storybook`, `@storybook/nextjs-vite`, `vite`), dev-зависимость | ✅ локально и на `freudin-storybook.vercel.app` |
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
| `GOOGLE_CLIENT_ID` | Google Cloud → Google Auth Platform → Clients (тот же, что в Supabase → Providers → Google) | шага 8.1 |
| `GOOGLE_CLIENT_SECRET` | там же, секрет `GOCSPX-…` | шага 8.1 |
| `TELEGRAM_CLIENT_ID` | @BotFather → бот → Web Login (OpenID Connect), тот же, что в Supabase → Providers → `custom:telegram` | шага 10 |
| `TELEGRAM_CLIENT_SECRET` | там же, Client Secret (не токен бота) | шага 10 |

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
| `npm run storybook` | UI kit на http://localhost:6006: компоненты `shared/ui`, которые использует сайт, и токены темы; тема — в тулбаре |
| `npm run build-storybook` | статическая сборка кита в `storybook-static/` (не в git) |
| `npm run db:push` | применить новые миграции из `supabase/migrations` к базе проекта |
| `npm run db:types` | сгенерировать типы БД в `src/shared/api/supabase/database.types.ts` |
| `npm run db:dump` | резервная копия базы в `backups/<дата-время>/`, нужен запущенный Docker (см. «Резервные копии») |

## Структура проекта

Код организован по [Feature-Sliced Design](https://feature-sliced.design) с двумя поправками:
вместо слоя `pages` используется `views`, а слоя `features` нет.

```
src/
├─ app/                # роутинг Next.js (App Router) и слой app
│  ├─ layout.tsx       # html/body, metadata, шапка, <main>, подвал
│  ├─ error.tsx, global-error.tsx   # страница ошибки (view error); global-error — со своими html и body
│  ├─ fonts.ts         # шрифты сайта (next/font), их же берёт Storybook
│  ├─ globals.css      # тема: палитра, шрифты, типографика, размеры и отступы, радиусы
│  ├─ _providers/      # темы, TanStack Query, тултипы, уведомления
│  ├─ robots.ts, sitemap.ts, opengraph-image.jpg   # SEO-файлы
│  ├─ icon.svg, apple-icon.png, favicon.ico       # иконки сайта (розовая точка из логотипа)
│  ├─ manifest.ts      # веб-манифест: название, цвета, иконки из public/icon-*.png
│  └─ api/             # API-роуты; _lib — общие хелперы (ошибки, ответы, zod, защита от CSRF)
├─ views/              # страницы: home, login, onboarding, settings, profile, privacy, terms, not-found, error
├─ widgets/            # header, footer, sign-in-panel, profile-card, profile-form, profile-documents, account-settings, legal-document
├─ entities/           # viewer (вход), profile (профиль, username, данные психолога), location (страны и города), social-link (ссылки на соцсети)
└─ shared/
   ├─ ui/              # компоненты shadcn/ui, Container, Logo, ThemeToggle, NotFoundState, ErrorState, Spinner, toast (обёртка sonner), SupportEmailLink, Combobox; истории *.stories.tsx и токены (tokens.stories.tsx)
   ├─ lib/             # утилиты: cn, cva (варианты классов компонентов), безопасный редирект по ?next=, кроп и сжатие картинок, буфер обмена, ошибки форм
   ├─ api/             # apiClient, ApiError, QueryClient; на сервере — клиенты Supabase и типы БД
   └─ config/          # routes, apiRoutes, site, цвета темы для <meta name="theme-color">, зарезервированные адреса, серверный env
supabase/
├─ config.toml         # настройки Supabase CLI
└─ migrations/         # SQL-миграции схемы БД и Storage
scripts/
├─ db-dump.sh          # резервная копия базы (npm run db:dump)
└─ generate-cities-migration.mjs   # миграция со справочником городов из выгрузки GeoNames
public/
├─ demo-certificate.svg   # документ демо-профиля
└─ icon-192.png, icon-512.png, icon-maskable-512.png   # иконки веб-манифеста
backups/               # резервные копии; не в git: в них персональные данные
components.json        # настройки shadcn/ui (алиасы под FSD)
.storybook/            # настройки Storybook: истории из src/**/*.stories.tsx, globals.css, шрифты из src/app/fonts.ts, переключатель темы
.env.example           # шаблон переменных окружения
docs/
├─ PLAN.md             # пошаговый план
├─ brand/              # файлы бренда вне сайта: иконка приложения Meta 1024×1024
└─ legal/              # исходные тексты /privacy и /terms с разделами про аналитику (заготовка)
```

Файлы в `src/app` только реэкспортируют страницы из `src/views`. Страницы — клиентские
компоненты, а серверная логика живёт в `src/app/api`. Исключения: личная страница `/<username>`
загружает профиль на сервере, а `/privacy` и `/terms` — серверные компоненты без клиентского JS. Правила слоёв и импортов
описаны в [`AGENTS.md`](AGENTS.md), линтер проверяет их при `npm run lint`.

## Роуты

| Путь | Страница | Статус |
|------|----------|--------|
| `/` | главная | готово (минимальная) |
| `/login` | вход; вошедшего пользователя уводит дальше | готово: Google |
| `/onboarding` | создание страницы после первого входа | готово; превью страницы рядом с формой (на телефоне — кнопка Preview); вошедшего с профилем уводит на его страницу |
| `/settings` | настройки профиля и аккаунта | готово, доступна только вошедшим с профилем: редактор на весь экран без шапки и подвала сайта, превью страницы видно во всех разделах; разделы Account, Public profile и Search details в сайдбаре (`/settings?section=account`, по умолчанию Public profile; у каждого раздела свой Save — в Account под полями, в остальных в липкой панели; при переходе в другой раздел несохранённые правки сбрасываются после подтверждения), блоки сворачиваются (состояние — в localStorage, по пользователю), панель Save видна при прокрутке, превью несохранённой страницы; `/settings#block-<id>` разворачивает блок и ведёт к нему |
| `/<username>` | личная страница пользователя | готово, рендерится на сервере; владельцу — подсказки «Finish your page» со ссылками на блоки настроек; `/demo` — демо-профиль, нет профиля — 404, адрес с заглавными редиректит на нижний регистр (`/Anna` → `/anna`) |
| `/privacy` | политика конфиденциальности (Privacy Policy) | готово |
| `/terms` | условия использования (Terms of Service) | готово |

API:

| Метод | Путь | Назначение | Статус |
|-------|------|------------|--------|
| GET | `/api/health` | проверка связки клиент → API | готово |
| GET | `/api/auth/sign-in?provider=&next=` | старт входа, редирект к провайдеру | готово: Google, Facebook, Telegram |
| GET | `/api/auth/callback?code=&next=` | обмен кода на сессию после OAuth Supabase (Facebook, Telegram на localhost), редирект дальше | готово |
| GET | `/api/auth/callback/[provider]?code=&state=` | возврат от Google и Telegram на наш домен: код → ID-токен → сессия Supabase, редирект дальше | готово |
| POST | `/api/auth/sign-out` | выход | готово |
| POST | `/api/auth/identities` | старт привязки способа входа: `{ provider }` → `{ url }` провайдера | готово |
| DELETE | `/api/auth/identities/[provider]` | отвязка способа входа (последний нельзя — 409) | готово |
| GET | `/api/me` | текущий пользователь, привязанные способы входа, контактная почта, его профиль, закрытые данные психолога (дата рождения, пол, запросы) и подсказки для онбординга | готово |
| DELETE | `/api/me` | удаление аккаунта со всеми данными; тело `{ "username": "…" }` — подтверждение, без совпадения 400; у аккаунта без страницы подтверждение не нужно | готово |
| POST | `/api/profile` | создание профиля (онбординг) и контактной почты | готово |
| PATCH | `/api/profile` | обновление профиля, контактной почты, закрытых данных психолога, порядка и выделения блоков страницы, FAQ, карточек услуг и варианта обложки (только переданные поля) | готово |
| POST | `/api/profile/avatar` | новое фото: файл (JPEG, PNG, WebP до 2 МБ и 1024×1024) или копия фото из аккаунта привязанного провайдера (`provider` — чьё) | готово |
| DELETE | `/api/profile/avatar` | удаление фото | готово |
| POST | `/api/profile/documents` | документ психолога: изображение (JPEG, PNG, WebP до 2 МБ и 2048×2048), превью (до 480×480) и подпись, до 5 документов | готово |
| DELETE | `/api/profile/documents/[id]` | удаление документа | готово |
| GET | `/api/cities?country=&q=` | поиск города в стране по справочнику GeoNames | готово |
| GET | `/api/profiles/[username]` | публичный профиль; скрытая страница — 403, с паролем — по cookie доступа | готово |
| POST | `/api/profiles/[username]/access` | пароль скрытой страницы: cookie доступа на 30 дней | готово |
| GET | `/api/usernames/[username]` | свободен ли адрес страницы | готово |

Полный список запланированных API-роутов со статусами — в [`AGENTS.md`](AGENTS.md#api).

Служебные файлы: `/robots.txt`, `/sitemap.xml`, `/opengraph-image.jpg` (картинка превью ссылок),
иконки `/icon.svg`, `/apple-icon.png`, `/favicon.ico` и веб-манифест `/manifest.webmanifest`.
Ошибку рендера любой страницы показывает `src/app/error.tsx` (Try again и почта поддержки),
падение корневого layout — `src/app/global-error.tsx`.

## SEO

- Прод-адрес — `https://www.freud.in` (`siteConfig.url`), `freud.in` редиректит на него. От этого
  адреса строятся `metadataBase`, canonical, `robots.txt` и `sitemap.xml`.
- Open Graph и карточка Twitter по умолчанию: название, описание, `en_US` и картинка
  `src/app/opengraph-image.jpg` (1200×630).
- У `/`, `/privacy` и `/terms` есть canonical, и они перечислены в `sitemap.xml`.
- `/login`, `/onboarding` и `/settings` закрыты от индексации (`noindex, follow`).
- Личные страницы рендерятся на сервере: в HTML сразу есть контент, `title` — имя человека,
  `description` — начало «О себе», canonical — адрес в нижнем регистре, в превью ссылки — фото
  (без фото — картинка сайта). Несуществующий адрес отвечает 404. В `sitemap.xml` их пока нет.

## Дизайн

- Пока минималистичный дизайн: стандартные компоненты shadcn/ui и минимум контента — только
  навигация и поля ввода.
- shadcn/ui на Radix, стиль по умолчанию (nova), шрифт Geist (с кириллицей для
  пользовательских имён и описаний),
  иконки lucide. Токены темы — в `src/app/globals.css` (см. «Тема» ниже).
- Палитра «Iris & Orchid» (28.09.2026) в `globals.css` двумя слоями. Примитивы — шкалы OKLCH
  по 11 шагов `violet`, `pink`, `neutral` и `red`. Семантические токены shadcn ссылаются на
  примитивы, а тёмная тема переопределяет только их. Светлая тема: текст `#292535`, фон
  `#FAF7F2`, карточки `#FFFFFF`, активные элементы и второстепенная кнопка `#4C429D`
  (`primary`, `secondary`), выбранный элемент `#E7EAFE` (`accent`), главная кнопка `#CF87CE`
  с текстом `#292535` (`cta`), ссылки в тексте `#983F95` (`link`). Тёмная тема: фон
  `neutral-950`, карточки `neutral-900` (`#292535`), активные элементы `violet-300`. Все пары
  текста проходят WCAG AA, рамки полей (`input`) — не ниже 3:1 в обеих темах. Тосты по типу
  (29.09.2026): успех — `violet-200` (`success`), ошибка — `red-200` (`error`), информация —
  как меню (`popover`); в тёмной теме — шаги 800 тех же шкал.
- Логотип (28.09.2026) — адрес `freud.in`, точка розовая (`text-cta`). Фавиконка — та же точка
  на фиолетовой плитке (`src/app/icon.svg`), из неё отрисованы `apple-icon.png`, `favicon.ico` и иконки манифеста `public/icon-*.png`.
- UI kit — Storybook (`npm run storybook`): компоненты `shared/ui`, которые использует сайт, страница токенов
  и виджеты с данными психолога (карточка профиля, форма настроек) в светлой и тёмной темах. Опубликован на https://freudin-storybook.vercel.app (см. «Деплой»).
- Светлая, тёмная и системная темы, переключатель в шапке.
- Хранилище браузера (всё описано в `/privacy`, раздел 2): `theme` (localStorage), черновик
  онбординга `freudin:onboarding-draft` (sessionStorage), свёрнутые блоки настроек
  `freudin:settings-collapsed-blocks` и скрытые подсказки владельца `freudin:page-checklist`
  (localStorage, Zustand `persist`). Cookie `freudin-page-access-<username>` — доступ гостя
  к странице с паролем (httpOnly, 30 дней). Новый ключ — только вместе с правкой `/privacy`.
- Вёрстка mobile-first, есть ссылка Skip to content для навигации с клавиатуры.
- Компоненты добавляются командой `npx shadcn add <component>` и попадают в `src/shared/ui`.
  Варианты классов CLI пишет на `class-variance-authority`: импорт меняем на `@/shared/lib/cva`
  (тот же API), зависимость удаляем.

### Тема

Вид всего сайта задаётся в одном месте, `src/app/globals.css`, разделами с комментариями.
Правка файла меняет все страницы в обеих темах, после неё нужен деплой.

| Что поменять | Где |
|--------------|-----|
| Основной цвет, фон, текст, ссылки | «Семантические токены»: `--primary`, `--cta`, `--background`, `--link` в `:root` (светлая тема) и `.dark`. Новый цвет берём из шкал-примитивов (`--violet-*`, `--pink-*`, `--neutral-*`, `--red-*`) |
| Шрифт | `src/app/fonts.ts`: импорт и вызов `next/font` (он принимает только литералы). Заголовкам отдельный шрифт — `--font-heading` в разделе «Шрифты» |
| Размеры заголовков | «Типографика»: `--text-page-title`, `--text-section-title`, `--text-document-*` — размер, интерлиньяж, трекинг и насыщенность. Обычный текст — шкала Tailwind, переопределяется там же (`--text-sm`) |
| Плотность отступов | «Размеры и отступы»: `--spacing` (шаг сетки, от него считаются все отступы Tailwind), отступ страницы `--spacing-page` |
| Ширины | `--container-site` (шапка, подвал, контент) и колонки `--container-document`, `form`, `profile`, `sign-in`. Страница выбирает ширину пропом `width` у `Container` |
| Скругления | «Радиусы»: `--radius`, остальные считаются от него |

После смены цветов:
- цвет фона повторите в `src/shared/config/theme.ts`: `<meta name="theme-color">` не читает
  CSS-переменные;
- проверьте контраст по WCAG AA в обеих темах (текст не ниже 4.5:1);
- перерисуйте картинку превью `src/app/opengraph-image.jpg`: она статичная.

Не темизируются: цвета логотипов Google, Facebook и Telegram (правила брендов), белый фон
при сжатии фото и чёрно-белый QR-код (это содержимое картинок, а не интерфейс).

## Внешние сервисы

Инструкции по настройке появятся здесь по мере интеграции:

- Supabase (БД, авторизация, хранилище фото): см. ниже;
- вход через Google: см. ниже;
- вход через Facebook: см. ниже;
- вход через Telegram: см. ниже;
- Vercel: сайт и UI kit — два проекта, см. «Деплой»;
- почта поддержки `freudin.support@gmail.com` (Gmail): где прописать адрес и как позже перейти
  на `support@freud.in` — в [`docs/PLAN.md`](docs/PLAN.md), этап H. Адрес задан
  в `siteConfig.supportEmail` и показан в подвале и юридических текстах.

### Supabase

Один облачный проект `freudin_data` в регионе eu-central-1 (Франкфурт). Он же прод: отдельной
базы для разработки нет. Тариф Free: если к базе неделю никто не обращается, проект засыпает,
и сайт перестаёт открывать страницы. Разбудить его можно кнопкой Restore в дашборде.
Автоматических бэкапов на Free нет, копии делаем сами (см. «Резервные копии»).

- Authentication → URL Configuration: Site URL `https://www.freud.in`, в Redirect URLs —
  `http://localhost:3000/**` для локальной разработки.
- Схема меняется только миграциями. Новая миграция создаётся командой
  `npx supabase migration new <name>`, применяется командой `npm run db:push`, после неё
  обновляются типы: `npm run db:types`. Команда берёт типы через Management API по
  `SUPABASE_ACCESS_TOKEN`: если токен истёк, она пишет в файл типов ошибку `Unauthorized` —
  выпусти новый токен (Account → Access Tokens в дашборде Supabase) и замени его в `.env`.
- Supabase CLI уже привязан к проекту (`supabase link`). На новой машине привяжи заново:
  `npx supabase link --project-ref <ref>`.
- Прямой адрес базы доступен только по IPv6. Если сеть его не поддерживает, CLI сам идёт через
  пулер, а для `psql` используй `aws-0-eu-central-1.pooler.supabase.com:5432` с пользователем
  `postgres.<ref>`.
- Гость (роль `anon`) читает из `profiles` только колонки публичной страницы, без `id` и дат,
  и только открытые страницы. Скрытую страницу (Settings → Account → Hide my page) видит
  владелец, а с режимом «по паролю» — гость с cookie доступа: проверку пароля и чтение делают
  функции базы, пароль лежит в `profile_page_access` открытым текстом и виден только владельцу.
- Данные психолога, которых нет на странице (дата рождения, пол, запросы клиентов), лежат
  в `profile_private`: RLS пускает только владельца, у `anon` прав нет. Поиск (шаг 22) будет
  читать их на сервере.
- FAQ, карточки услуг, выделенные блоки и вариант обложки — колонки `profiles.faq`, `services`,
  `highlighted_sections` и `cover` (миграция `*_add_page_content.sql`). jsonb-списки проверяют
  CHECK-функции `is_valid_profile_faq` и `is_valid_profile_services` (длины строк, категория
  карточки — из `client_types`). Выделение ссылки или карточки — поле `highlighted` в самом
  элементе, у ссылки ещё необязательный заголовок `title`.
- Справочник городов `cities` для профиля психолога (шаг 20) — данные
  [GeoNames](https://www.geonames.org) (лицензия CC BY 4.0): города от 5000 жителей
  и административные центры, около 64 тыс. строк. Их загружает миграция `*_seed_cities.sql`,
  собранная скриптом, руками её не правим. Обновить справочник:
  `npx supabase migration new update_cities`, затем
  `node scripts/generate-cities-migration.mjs supabase/migrations/<новый файл>.sql`
  (нужны Node 23.6+ и `unzip`) и `npm run db:push`. Миграция добавляет и обновляет города,
  но не удаляет: на них могут ссылаться профили.
  Атрибуцию GeoNames, которую требует лицензия, публикует `/terms` (раздел Intellectual property).

#### Резервные копии

Запусти Docker Desktop и выполни `npm run db:dump`. Делай копию перед каждым `npm run db:push`
и регулярно, например раз в неделю. Команда создаёт папку `backups/<дата-время>/` с тремя
файлами:

- `roles.sql` — настройки ролей;
- `schema.sql` — схема `public`: таблицы, функции, RLS-политики, права;
- `data.sql` — данные: пользователи (`auth.users`, `auth.identities`), профили, записи
  о файлах Storage.

В копию не входят:

- сессии и токены входа: после восстановления пользователи войдут заново;
- сами файлы фото и документов (Storage хранит их отдельно от базы);
- политики Storage: они есть в миграциях `*_create_avatars_bucket.sql`
  и `*_create_documents_bucket.sql`.

В копиях персональные данные. Папка `backups/` не попадает в git, файлы доступны только
владельцу. Старые копии удаляй вручную.

Восстановление в новый пустой проект Supabase (строку подключения к его базе возьми
в дашборде: Connect → Session pooler):

```bash
cd backups/<дата-время>
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file roles.sql --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql --dbname "<строка подключения>"
```

После этого выполни блоки `create policy` из миграций `*_create_avatars_bucket.sql`
и `*_create_documents_bucket.sql`. В рабочую
базу копию целиком не накатывают: отдельные строки восстанавливай вручную по `data.sql`.

### Вход через Google

1. Google Cloud → Google Auth Platform:
   - Branding: название, логотип, ссылки на `/privacy` и `/terms`;
   - Audience: External, статус In production: войти может любой аккаунт Google. В статусе
     Testing пускают только тестовых пользователей из этого же раздела. Название и логотип
     Freudin на экране Google видны после проверки бренда (brand verification). Бренд
     подтверждён 26.09.2026. Для проверки домен `freud.in` подтверждён в Google Search Console
     TXT-записью в DNS: её не удалять;
   - Data access: `openid`, `email`, `profile`.
2. Clients → Create client → Web application:
   - Authorized JavaScript origins: `http://localhost:3000` и `https://www.freud.in`;
   - Authorized redirect URIs: `https://www.freud.in/api/auth/callback/google`
     и `http://localhost:3000/api/auth/callback/google`. Адрес Supabase здесь не нужен.
3. Client ID и Client Secret внести в Supabase → Authentication → Sign In / Providers → Google
   и включить провайдер: Supabase проверяет по этому Client ID ID-токены Google. Skip nonce
   check оставить выключенным: мы передаём nonce, и Supabase его сверяет.
4. Те же Client ID и Client Secret задать в `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`
   (`.env` и Vercel).

Как устроен вход: кнопка ведёт на `/api/auth/sign-in`, оттуда браузер уходит прямо к Google,
а `state`, `nonce` и PKCE-верификатор хранятся в httpOnly-cookie `freudin-google-sign-in`
(10 минут). Google возвращает на `/api/auth/callback/google`: сервер меняет код на токены
Google и создаёт сессию Supabase по ID-токену (`signInWithIdToken`). Так же, тем же кодом
(`oidc-sign-in.server.ts`), входит Telegram. Supabase узнаёт
пользователя по Google ID, поэтому аккаунты, созданные раньше через OAuth Supabase, остались
теми же. Дальше онбординг, если профиля ещё нет, иначе своя страница или `?next=`. Cookies
сессии `httpOnly`: браузер их не читает, сессию видят только API-роуты.

### Вход через Facebook

Подробная инструкция — в [`docs/PLAN.md`](docs/PLAN.md), шаг 9. Кратко:

1. Meta for Developers → приложение `Freudin` с use case «Authenticate and request data from
   users with Facebook Login», разрешения `public_profile` и `email`. `public_profile` Meta
   выдаёт автоматически. Для `email` в режиме Development диалог входа показывает людям
   с ролью «Submit for Login Review»; перед Live нужны подтверждение компании (Business
   verification) и, возможно, App Review для `email`.
2. Facebook Login → Settings → Valid OAuth Redirect URIs:
   `https://<ref>.supabase.co/auth/v1/callback`.
3. App settings → Basic: App domains `freud.in`, ссылки на `/privacy` и `/terms`, Data deletion
   instructions URL `https://www.freud.in/privacy#account-and-data-deletion`, контакт
   `freudin.support@gmail.com`.
4. App ID и App secret внести в Supabase → Authentication → Sign In / Providers → Facebook.
5. Пока приложение в режиме Development, войти могут только люди с ролью в нём. Для всех —
   App Mode Live.

Как устроен вход: `/api/auth/sign-in?provider=facebook` → Supabase → Facebook →
`https://<ref>.supabase.co/auth/v1/callback` → `/api/auth/callback` (обмен кода на сессию,
PKCE-верификатор в cookie `sb-…-code-verifier`). Email от Facebook Supabase считает
подтверждённым: если он совпадает с email аккаунта Google, вход попадает в тот же аккаунт.
Если у аккаунта Facebook нет email, а вход без email в Supabase выключен, `/login` показывает
ошибку `email_required`. Supabase сохраняет фото Facebook размером 50×50, а подписанную ссылку
увеличить нельзя. Поэтому `/api/auth/sign-in` передаёт в адресе возврата `provider=facebook`,
и после входа колбэк по токену Facebook берёт у Graph API ссылку на фото 512×512 и кладёт её
в `user_metadata`. Для этого в приложении Meta должен быть выключен Require app secret
(App settings → Advanced → Security).

### Вход через Telegram

Telegram подключён через OpenID Connect как свой провайдер Supabase (`custom:telegram`).
На сайте он входит, как Google, через свой адрес возврата: так на экране Telegram виден
`www.freud.in`, а не `<ref>.supabase.co`.

1. @BotFather: `/newbot` — отдельный бот только для входа (`@freudin_bot`). В мини-приложении
   BotFather: бот → Bot Settings → Web Login → OpenID Connect Login. Переключение необратимо:
   старый Login Widget у этого бота больше не работает.
2. Там же: Redirect URIs — `https://www.freud.in/api/auth/callback/telegram` и
   `https://<ref>.supabase.co/auth/v1/callback` (для localhost, см. ниже), Trusted Origins —
   `https://www.freud.in`. BotFather показывает Client ID и Client Secret (это не токен бота).
   Адреса с `http://` BotFather не принимает.
3. Supabase → Authentication → Sign In / Providers → New Provider → Auto-discovery (OIDC):
   Identifier `custom:telegram`, Issuer URL `https://oauth.telegram.org`, scopes
   `openid profile`, PKCE включён, вход без email разрешён (Telegram email не отдаёт).
   Supabase по этим настройкам проверяет ID-токены Telegram. На тарифе Free можно до трёх
   своих провайдеров.
4. Те же Client ID и Client Secret задать в `TELEGRAM_CLIENT_ID` и `TELEGRAM_CLIENT_SECRET`
   (`.env` и Vercel).

Как устроен вход на сайте: `/api/auth/sign-in?provider=telegram` → `oauth.telegram.org` →
`/api/auth/callback/telegram`, cookie попытки входа `freudin-telegram-sign-in`. Код меняется
на токены с секретом в заголовке Basic. Ошибки токен-эндпоинт Telegram отдаёт со статусом 200,
поэтому ответ разбирается по полям. На `http://localhost` вход идёт через OAuth Supabase, как
у Facebook (`… → Supabase → /api/auth/callback`), и на экране Telegram виден `<ref>.supabase.co`.
Аккаунт в обоих случаях один: Client ID общий, и `sub` у пользователя тот же. Telegram передаёт
имя, username и фото. Email нет, поэтому онбординг и настройки показывают необязательное поле
контактной почты. Подсказка адреса страницы — username Telegram, иначе имя латиницей
(`transliterate` из `shared/lib`), и только в последнюю очередь часть email до «@».

### Несколько способов входа в одном аккаунте

В Supabase → Authentication → Sign In / Providers включён **Allow manual linking**: без него
привязка и отвязка не работают. В Google Cloud, BotFather и Meta ничего дополнительно
не настраивается: привязка возвращает браузер на те же адреса, что и вход.

Как устроено: Settings → Account → Sign-in methods → Connect → `POST /api/auth/identities`
отдаёт адрес провайдера. Google и Telegram на https возвращаются на
`/api/auth/callback/<provider>` и привязываются по ID-токену (`linkIdentity`), остальные —
через OAuth Supabase и `/api/auth/callback?mode=link`. Итог приходит в `/settings?section=account&linked=`
или `&link_error=` и показывается тостом. Способ, уже привязанный к другому аккаунту
Freudin, даёт ошибку `identity_already_exists`: аккаунты не объединяются, второй нужно удалить.
Для аккаунта без страницы кнопка удаления есть на онбординге. Отвязка —
`DELETE /api/auth/identities/<provider>`, последний способ отвязать нельзя. Крупное фото
Facebook хранится в `user_metadata.facebook_avatar_url`, чтобы вход через другого провайдера
его не перезаписал.

## Деплой

Хостинг — Vercel. Каждый коммит в `main` сразу выкладывается в прод на `https://www.freud.in`,
`freud.in` редиректит туда. Отдельного стенда нет, превью-деплои не используем: вход и интеграции
проверяем локально, а после мержа — на проде.

UI kit — отдельный проект Vercel `freudin-storybook` из того же репозитория, адрес
https://freudin-storybook.vercel.app. Он тоже пересобирается при каждом коммите в `main`:
Framework Preset — Other, Build Command — `npm run build-storybook`, Output Directory —
`storybook-static`, переменных окружения нет. Deployment Protection — Vercel Authentication для
All Deployments: кит открывается только под аккаунтом Vercel владельца и не индексируется.

Переменные окружения прода задаются в Vercel → Settings → Environment Variables (окружение
Production). Приложению они нужны с шага 7, и задать их надо до того, как код, который их читает,
попадёт в `main`.
