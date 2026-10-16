# Freudin

Сайт для психологов и их будущих клиентов. Психолог входит через Google или Telegram и делает
личную страницу-визитку с уникальной ссылкой, а клиент без регистрации находит психолога. Сайт
не проверяет психологов, не участвует в их общении с клиентами и не берёт оплату.

Этот файл описывает текущее состояние системы и то, как ею управлять: запуск, окружение,
внешние сервисы, деплой. Подробные процедуры настройки сервисов — в
[`docs/operations/`](docs/operations). Остальное — в отдельных документах:

- о продукте — [`docs/PRODUCT.md`](docs/PRODUCT.md);
- индекс активных задач и ссылки на карточки этапов — [`docs/PLAN.md`](docs/PLAN.md);
- завершённые задачи и результаты проверок — [`docs/plan/HISTORY.md`](docs/plan/HISTORY.md);
- архитектура по модели C4 — [`docs/architecture/`](docs/architecture);
- поиск модулей и файлов по сценарию — [`docs/code-map.md`](docs/code-map.md);
- решения и их причины — [`docs/DECISIONS.md`](docs/DECISIONS.md);
- правила для разработчиков и AI-агентов — [`AGENTS.md`](AGENTS.md) и
  [`docs/workflows/`](docs/workflows).

Быстрые переходы: [запуск](#быстрый-старт) · [env](#переменные-окружения) ·
[скрипты](#скрипты) · [роуты](#роуты) · [сервисы](#внешние-сервисы) · [деплой](#деплой).

## Возможности

- вход и регистрация через Google и Telegram, несколько способов входа в одном аккаунте
  (вход через Facebook есть в коде, но выключен — см. «Вход через Facebook»);
- онбординг: фото, имя, описание, адрес страницы, ссылки на соцсети;
- личная страница `https://www.freud.in/<username>` с FAQ, услугами, документами и прямыми
  контактами; страницу можно скрыть ото всех или открыть только по паролю;
- редактор `/settings` с превью несохранённых правок, порядком и выделением блоков, пресетами
  оформления и тремя обложками;
- редактирование профиля, выход, удаление аккаунта.

Пример личной страницы — демо-профиль по адресу `/demo`.

## Стек

| Задача | Выбор |
|--------|-------|
| Фреймворк | Next.js 16 (App Router, React Compiler), React 19, TypeScript 5 |
| Стили | Tailwind CSS 4, `tw-animate-css` |
| UI-компоненты | shadcn/ui на Radix (`radix-ui`, `cn` — слияние классов; варианты классов — своя `cva` в `shared/lib` вместо `class-variance-authority`), lucide-react; `cmdk` — список с поиском (`command`); `@dnd-kit/core` и `@dnd-kit/sortable` — перетаскивание в списке порядка блоков |
| Темы и уведомления | next-themes, sonner |
| Запросы к API | TanStack Query (+ Devtools в dev) |
| Валидация | zod |
| Формы | TanStack Form |
| Клиентское состояние | Zustand: черновик онбординга, свёрнутые блоки настроек, скрытые подсказки владельца |
| Кроп фото | react-easy-crop |
| QR-код страницы | qrcode.react (рисуется в браузере, без внешних сервисов) |
| БД, авторизация, файлы | Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Supabase CLI (миграции и типы) |
| UI kit | Storybook 10 (`storybook`, `@storybook/nextjs-vite`, `vite`), dev-зависимость; опубликован на `freudin-storybook.vercel.app` |
| Линтер и форматтер | Biome |
| Юнит-тесты | Vitest 4 (`vitest`), dev-зависимость; окружение node, только чистая логика; запускаются локально, CI нет |
| Хостинг | Vercel, прод на `www.freud.in` |

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

| Переменная | Где взять |
|------------|-----------|
| `SUPABASE_URL` | Supabase → Project Settings → API Keys |
| `SUPABASE_PUBLISHABLE_KEY` | там же, ключ `sb_publishable_…` |
| `SUPABASE_SECRET_KEY` | там же, ключ `sb_secret_…` |
| `GOOGLE_CLIENT_ID` | Google Cloud → Google Auth Platform → Clients (тот же, что в Supabase → Providers → Google) |
| `GOOGLE_CLIENT_SECRET` | там же, секрет `GOCSPX-…` |
| `TELEGRAM_CLIENT_ID` | @BotFather → бот → Web Login (OpenID Connect), тот же, что в Supabase → Providers → `custom:telegram` |
| `TELEGRAM_CLIENT_SECRET` | там же, Client Secret (не токен бота) |

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
| `npm test` | юнит-тесты Vitest (`vitest run`); в режиме наблюдения — `npx vitest` (см. «Тесты») |
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
   ├─ ui/              # компоненты shadcn/ui, Container, Logo, ThemeToggle, NotFoundState, ErrorState, Spinner, toast (обёртка sonner), SupportEmailLink, SectionNav, DisclosureButton, Combobox; истории *.stories.tsx и токены (tokens.stories.tsx)
   ├─ lib/             # утилиты: cn, cva (варианты классов компонентов), безопасный редирект по ?next=, кроп и сжатие картинок, буфер обмена, ошибки форм, транслитерация
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
vitest.config.mts      # юнит-тесты: src/**/*.test.ts, окружение node, server-only подменён пустым модулем
.storybook/            # настройки Storybook: истории из src/**/*.stories.tsx, globals.css, шрифты из src/app/fonts.ts, переключатель темы
.env.example           # шаблон переменных окружения
docs/
├─ PLAN.md             # индекс активных задач, состояния и очередь
├─ plan/
│  ├─ stage-*.md       # карточки этапов: контекст, связи, точки входа, подшаги и критерии
│  ├─ context.md       # сводка действий разработчика, риски и справочные ссылки
│  ├─ review-sources.md # источники замечаний сводного ревью и привязка к задачам
│  └─ HISTORY.md       # завершённые шаги и подшаги, результаты проверок
├─ PRODUCT.md          # описание продукта
├─ DECISIONS.md        # реестр решений: что, когда и почему
├─ code-map.md         # карта сценариев, FSD-слайсы, public API и файлы реализации
├─ architecture/       # C4: 1.context, 2.containers, 3.components, 4.code; отдельно dynamic (сквозные сценарии)
├─ workflows/          # правила: process (проверки и Git), code (FSD и Next.js), api, database, ui; процедуры: plan-step, qa-subagent, plan-report, seo-checklist, ui-kit
├─ operations/         # настройка и обслуживание: Supabase и бэкапы, вход и домен, почта поддержки
├─ brand/              # файлы бренда вне сайта: иконка приложения Meta 1024×1024
└─ legal/              # архивные юридические черновики с аналитикой; действующие тексты — в views
```

Статическое устройство системы — уровни C4 в [`docs/architecture/`](docs/architecture):
[контекст](docs/architecture/1.context.md), [контейнеры](docs/architecture/2.containers.md),
[компоненты](docs/architecture/3.components.md),
[внутреннее устройство выбранных компонентов](docs/architecture/4.code.md).
Сквозные сценарии — в [dynamic.md](docs/architecture/dynamic.md), поиск реализации —
в [code-map.md](docs/code-map.md). Правила слоёв и импортов — в
[`docs/workflows/code.md`](docs/workflows/code.md), линтер проверяет их при `npm run lint`.

## Тесты

Юнит-тесты лежат рядом с кодом: `<модуль>.test.ts`. Покрыта логика, ошибка в которой дорого
стоит или незаметна в интерфейсе:

| Что | Тесты |
|-----|-------|
| Безопасность | `getSafeRedirectPath` (open redirect), `assertSameOrigin` (CSRF) |
| Адрес страницы | `usernameSchema`: формат, служебные слова и сегменты роутов из `routes` |
| Ссылки | `normalizeSocialLinkUrl`, `socialLinkSchema` |
| Профиль | `profileInputSchema` и `profileUpdateSchema`: связанные поля (город и формат, карточки услуг, запросы, способ связи, пароль скрытой страницы), валюта профиля, даты (обычный и високосный день с фиксированными часами), контакты |
| Сохранение и превью | `getProfileChanges`, `normalizeSectionOrder`, `toPreviewProfile` (без закрытых данных) |
| Аккаунт | `isAccountDeletionConfirmed`, `canUnlinkSignInMethod` (последний способ входа, отключённый Facebook не в счёт) |
| Загрузки | `detectImage`: формат по сигнатуре, размеры из заголовка PNG, JPEG и WebP |
| Подсказки и поиск | `transliterate`, `toSearchKey`, `getProfileSuggestions` |
| Ошибки | `getOAuthErrorCode`, `toFieldErrors`, `toFormFieldName` |

Проверка `state` при входе через Google и Telegram не покрыта: это сравнение в роуте, для теста
пришлось бы подменять `cookies()` из Next. Тестов интерфейса и e2e нет.

## Роуты

Пути в коде строят `routes` (страницы) и `apiRoutes` (API) из `src/shared/config`.

### Страницы

| Путь | Страница | Файл роутинга | View | Доступ | Особенности |
|------|----------|---------------|------|--------|-------------|
| `/` | главная | `src/app/page.tsx` | `home` | все | Минимальная |
| `/login` | вход | `src/app/login/page.tsx` | `login` | гости; вошедшего уводим дальше | Google и Telegram (Facebook выключен) |
| `/onboarding` | создание страницы после первого входа | `src/app/onboarding/page.tsx` | `onboarding` | вошедшие без профиля; с профилем уводим на `/<username>` | Превью страницы рядом с формой (на телефоне — кнопка Preview) |
| `/settings` | настройки профиля и аккаунта | `src/app/settings/page.tsx` | `settings` | вошедшие с профилем | Редактор на весь экран без шапки и подвала сайта, превью несохранённой страницы во всех разделах (ширина Desktop или Phone). Разделы Account (адрес, почта, страна и город, валюта цен, способы входа), Public profile и Search details в сайдбаре (`?section=`, `routes.settingsSection`, по умолчанию Public profile); у каждого раздела свой Save — в Account под полями, в остальных в липкой панели; при переходе в другой раздел несохранённые правки сбрасываются после подтверждения. Блоки сворачиваются (состояние — в localStorage, по пользователю; без сохранённого выбора Appearance свёрнут); блок Appearance — пресет и обложка; `routes.settingsBlock(id)` (`#block-<id>`) разворачивает блок и ведёт к нему |
| `/privacy` | политика конфиденциальности (Privacy Policy) | `src/app/privacy/page.tsx` | `privacy` | все | На английском, у разделов якоря (`#account-and-data-deletion`) |
| `/terms` | условия использования (Terms of Service) | `src/app/terms/page.tsx` | `terms` | все | На английском |
| `/<username>` | личная страница пользователя | `src/app/[username]/page.tsx` | `profile` | все | Серверный рендер (данные из БД, `/demo` — демо-профиль); владельцу — подсказки «Finish your page» со ссылками на блоки настроек; нет профиля — 404, адрес с заглавными — редирект 308 на нижний регистр (`/Anna` → `/anna`) |
| 404 | страница не найдена | `src/app/not-found.tsx` | `not-found` | все | — |
| Ошибка | ошибка рендера страницы | `src/app/error.tsx`, `src/app/global-error.tsx` | `error` | все | Try again (`retry`) и почта поддержки; `global-error.tsx` — при падении корневого layout |

### Служебные файлы

| Путь | Файл | Что это |
|------|------|---------|
| `/robots.txt` | `src/app/robots.ts` | правила для поисковиков и ссылка на sitemap |
| `/sitemap.xml` | `src/app/sitemap.ts` | публичные страницы |
| `/opengraph-image.jpg` | `src/app/opengraph-image.jpg` | картинка превью ссылок по умолчанию (1200×630) |
| `/icon.svg` | `src/app/icon.svg` | фавиконка: розовая точка из логотипа на фиолетовой плитке, цвета `violet-700` и `pink-400` |
| `/apple-icon.png` | `src/app/apple-icon.png` | та же иконка для iOS, 180×180, квадрат без скругления (углы срезает iOS) |
| `/favicon.ico` | `src/app/favicon.ico` | та же иконка 32×32 (PNG внутри ICO) для тех, кто запрашивает `/favicon.ico` напрямую |
| `/manifest.webmanifest` | `src/app/manifest.ts` | название, цвета (`themeColors`) и иконки для «На экран Домой»: `public/icon-192.png`, `icon-512.png` и `icon-maskable-512.png` (квадрат без скругления, точка в безопасной зоне) |

### API

«Сессия ✓» — роут работает от имени вошедшего пользователя: без сессии — 401 (выход отвечает
204). Формат ошибки и правила роутов — в [`docs/workflows/api.md`](docs/workflows/api.md).

| Метод | Путь | Назначение | Сессия |
|-------|------|------------|:------:|
| GET | `/api/health` | проверка связки клиент → API | — |
| GET | `/api/auth/sign-in?provider=&next=` | старт входа и редирект к провайдеру; выключенный провайдер (сейчас Facebook) — на `/login` с `auth_unavailable` | — |
| GET | `/api/auth/callback?code=&provider=&next=&mode=` | обмен кода на сессию и редирект (вход через OAuth Supabase: Facebook, Telegram на localhost); ошибку провайдера переводит в код через `getOAuthErrorCode`; после Facebook берёт фото 512×512 из Graph API. `mode=link` — привязка способа входа, итог в `/settings` | — |
| GET | `/api/auth/callback/[provider]?code=&state=` | возврат от Google и Telegram без OAuth Supabase (`provider`: `google`, `telegram`): проверка `state` по cookie `freudin-<provider>-sign-in`, код → ID-токен → сессия Supabase, редирект. С `linkUserId` в cookie — привязка способа входа, итог в `/settings` | — |
| POST | `/api/auth/identities` | старт привязки способа входа: `{ provider }` → `{ url }` провайдера; не подключён — 400, уже привязан — 409 | ✓ |
| DELETE | `/api/auth/identities/[provider]` | отвязка способа входа, ответ — оставшиеся способы; не привязан — 404, последний из подключённых (`enabledAuthProviders`) — 409 | ✓ |
| POST | `/api/auth/sign-out` | выход; без сессии тоже 204 | ✓ |
| GET | `/api/me` | текущий пользователь (`email` от провайдера, `contactEmail` — своя почта, если провайдер её не дал, `signInMethods` — привязанные способы входа), его профиль (или `null`), `privateDetails` (дата рождения, пол, запросы — из `profile_private`) и подсказки для онбординга | ✓ |
| DELETE | `/api/me` | удаление аккаунта: тело `{ "username": "…" }` — подтверждение, без совпадения с профилем (пробелы по краям и регистр не важны) 400 с `fields.username`; без профиля подтверждение не нужно (`{}`); фото и документы (из профиля, затем из Storage), пользователь через admin API (профиль — каскадом), cookies сессии; 204 | ✓ |
| POST | `/api/profile` | создание профиля (онбординг) и контактной почты, если она указана: 201; занятый username — 409 с `fields.username`, профиль уже есть — 409, город не из справочника или не из `country` — 400 с `fields.cityId` | ✓ |
| PATCH | `/api/profile` | обновление переданных полей профиля; `contactEmail: ""` удаляет контактную почту; `sectionOrder` — порядок блоков страницы; `birthDate`, `gender`, `concerns` пишутся в `profile_private`; связанные поля передаются группой (`linkedFieldGroups`: `country`, `cityId`, `workFormats`; `socialLinks`, `contacts`, `preferredContact`; `clientTypes`, `concerns`, `services`); `currency` — валюта всех цен профиля; `faq`, `services`, `highlightedSections`, `cover`, `pageTheme`, `linkIcons`, `ctaPlacement` — содержимое и оформление страницы, иначе 400; `visibility` и `pagePassword` (4–8 символов, пустой — не менять) — режим скрытой страницы, `password` без заданного пароля — 400 с `fields.pagePassword`; нет профиля — 404, занятый username — 409 | ✓ |
| POST | `/api/profile/avatar` | новое фото: `multipart/form-data` с полем `file` (JPEG, PNG, WebP до 2 МБ и не больше 1024×1024, иначе 400 или 413) или JSON `{ "source": "provider", "provider"?: "telegram" }` — копия фото привязанного способа входа (без `provider` — первого с фото) | ✓ |
| DELETE | `/api/profile/avatar` | удаление фото | ✓ |
| POST | `/api/profile/documents` | документ психолога: `multipart/form-data` с полями `file` (JPEG, PNG, WebP до 2 МБ и 2048×2048), `thumbnail` (превью до 256 КБ и 480×480) и `title` (подпись до 100 символов); 201 с профилем, шестой документ — 409 | ✓ |
| DELETE | `/api/profile/documents/[id]` | удаление документа, ответ — профиль; нет документа — 404 | ✓ |
| GET | `/api/cities?country=&q=` | поиск города в стране по началу названия (регистр, диакритика и апострофы не важны, кириллица транслитерируется): до 10 `City`, крупные первыми; ответ кешируется (`s-maxage` сутки) | — |
| GET | `/api/profiles/[username]` | публичный профиль (регистр не важен), в том числе данные психолога (город — объект `City` из справочника, документы со ссылками), `demo` — демо-профиль из кода; скрытая страница — 403, страница с паролем открывается cookie доступа (ответ `no-store`) | — |
| POST | `/api/profiles/[username]/access` | пароль скрытой страницы `{ password }`: верный — cookie доступа на 30 дней и 204, неверный — 400 с `fields.password`; защиты от перебора нет (мягкий замок) | — |
| GET | `/api/usernames/[username]` | `{ username, available }`; неверный формат или зарезервированный адрес — 400. Свой текущий адрес тоже «занят» | — |

## SEO

- Прод-адрес — `https://www.freud.in` (`siteConfig.url`), `freud.in` редиректит на него. От этого
  адреса строятся `metadataBase`, canonical, `robots.txt` и `sitemap.xml`.
- Open Graph и карточка Twitter по умолчанию: название, описание, `en_US` и картинка
  `src/app/opengraph-image.jpg` (1200×630).
- У `/`, `/privacy` и `/terms` есть canonical, и они перечислены в `sitemap.xml`.
- `/login`, `/onboarding` и `/settings` закрыты от индексации (`noindex, follow`).
- Личные страницы рендерятся на сервере: в HTML сразу есть контент, `title` — имя человека,
  `description` — начало «О себе», canonical — адрес в нижнем регистре, в превью ссылки — фото
  (без фото — картинка сайта). Несуществующий адрес отвечает 404. Личных страниц в `sitemap.xml` нет.

## Дизайн

- shadcn/ui на Radix, стиль по умолчанию (nova), шрифт Geist (с кириллицей для пользовательских
  имён и описаний), иконки lucide.
- Палитра «Iris & Orchid»: фиолетовые активные элементы и второстепенная кнопка, розовая главная
  кнопка. Светлая, тёмная и системная темы, переключатель в шапке.
  Значения цветов — в `src/app/globals.css` (см. «Тема»), наглядно — на странице
  `Foundations/Tokens` в Storybook.
- Логотип — адрес `freud.in` с розовой точкой (`text-cta`). Фавиконка — та же точка
  на фиолетовой плитке (`src/app/icon.svg`), из неё отрисованы `apple-icon.png`, `favicon.ico`
  и иконки манифеста `public/icon-*.png`.
- UI kit — Storybook (`npm run storybook`): компоненты `shared/ui`, страница токенов и виджеты
  с данными психолога (карточка профиля, оформление страницы — пресеты и обложки, форма
  настроек) в светлой и тёмной темах. Опубликован на https://freudin-storybook.vercel.app
  (см. «Деплой»).
- Вёрстка mobile-first, есть ссылка Skip to content для навигации с клавиатуры.
- Cookies и хранилище браузера перечислены в `/privacy` (раздел 2) и в
  [`docs/architecture/2.containers.md`](docs/architecture/2.containers.md#хранилище-браузера).

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

- Supabase — БД, авторизация, хранилище фото и документов;
- Google и Telegram — вход; Meta (Facebook) — вход настроен, но выключен;
- Google Search Console — подтверждение домена `freud.in` для проверки бренда Google;
- Vercel — сайт и UI kit, два проекта (см. «Деплой»);
- почта поддержки `freudin.support@gmail.com` (Gmail).

### Supabase

Один облачный проект `freudin_data` в eu-central-1 (Франкфурт), он же прод; отдельной базы
для разработки нет. Подключение CLI и `psql`, миграции, генерация типов и обновление
справочника городов — в [инструкции Supabase](docs/operations/supabase.md).

#### Резервные копии

Перед `npm run db:push` сделай `npm run db:dump`. Состав копии, ограничения и восстановление —
в [инструкции резервного копирования](docs/operations/supabase.md#резервные-копии).

### Почта поддержки

`freudin.support@gmail.com` — обычный ящик Gmail. Где указан адрес и как поддерживать доступ —
в [инструкции почты поддержки](docs/operations/support-email.md).

### Вход через Google

Google входит через наш `/api/auth/callback/google`, сессия создаётся по ID-токену Supabase.
Параметры Google Cloud и Supabase — в [инструкции Google](docs/operations/authentication.md#вход-через-google).

#### Подтверждение домена в Google Search Console

Домен `freud.in` подтверждён TXT-записью `google-site-verification=…`; её не удалять.
Повторное подтверждение — в [инструкции Search Console](docs/operations/authentication.md#подтверждение-домена-в-google-search-console).

### Вход через Facebook

Facebook выключен в `enabledAuthProviders` до подтверждения компании в Meta. Код и настройки
сохранены; кнопок входа и привязки нет. Условия включения и параметры приложения —
в [инструкции Facebook](docs/operations/authentication.md#вход-через-facebook).

### Вход через Telegram

Telegram подключён через OpenID Connect (`custom:telegram`): на проде — через наш callback,
на localhost — через OAuth Supabase. Настройки BotFather и Supabase —
в [инструкции Telegram](docs/operations/authentication.md#вход-через-telegram).

### Несколько способов входа в одном аккаунте

В Supabase включён **Allow manual linking**. Способы входа привязываются в настройках;
существующие аккаунты не объединяются. Требования к настройке и занятым способам входа —
в [инструкции привязки](docs/operations/authentication.md#несколько-способов-входа-в-одном-аккаунте).

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
Production). Новую переменную задают там до того, как код, который её читает, попадёт в `main`.
