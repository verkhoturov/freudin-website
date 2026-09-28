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

- каркас Feature-Sliced Design;
- минималистичный интерфейс на стандартных компонентах shadcn/ui: светлая и тёмная темы,
  шапка и подвал (ссылки на документы, почта поддержки, реквизиты ИП-оператора);
- клиент API на TanStack Query и первый API-роут `/api/health`;
- SEO-база: домен `www.freud.in`, Open Graph с картинкой превью, `robots.txt`, `sitemap.xml`,
  `noindex` для служебных страниц;
- проверка границ между слоями FSD в линтере;
- модель профиля: правила адреса страницы (username) и зарезервированные адреса, проверка имени,
  описания и ссылок на соцсети, приведение `@handle` к ссылке;
- экран входа с кнопками подключённых провайдеров (Google, Facebook, Telegram) и показом ошибок;
- вход и выход через Google (своя схема OAuth), Facebook и Telegram (OAuth через Supabase), меню
  пользователя в шапке, защита
  приватных страниц: гостя `/onboarding` и `/settings` отправляют на вход;
- личная страница: карточка, состояния загрузки, 404 и ошибки, кнопка Share;
- API профиля: создание и обновление профиля, публичный профиль из БД, проверка, свободен ли
  адрес страницы;
- фото профиля: загрузка с кропом и сжатием на клиенте, копирование фото из аккаунта
  провайдера, удаление;
- онбординг: форма с предзаполнением из данных провайдера (адрес — username Telegram или имя
  латиницей), проверкой адреса и черновиком,
  который переживает перезагрузку страницы;
- настройки: редактирование профиля и фото, способы входа (к одному аккаунту можно привязать
  Google, Facebook и Telegram и отвязать лишние), выход и удаление аккаунта;
  владелец видит на своей странице кнопку Edit;
- минимальная главная;
- схема БД в Supabase: таблица `profiles` с RLS, `account_contacts` (контактная почта, видна
  только владельцу) и bucket `avatars` для фото;
- необязательная контактная почта в онбординге и настройках для аккаунтов без email
  у провайдера (Telegram, Facebook по номеру телефона).

Провайдер появляется на странице входа, когда его добавляют в `enabledAuthProviders`
(`src/entities/viewer/config/auth-providers.ts`). Интерфейс сайта, ошибки API и юридические
тексты `/privacy` и `/terms` — на английском. Пример личной страницы — демо-профиль по адресу
`/demo`.

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
| БД, авторизация, файлы | Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Supabase CLI (миграции и типы) | ✅ БД, вход через Google, Facebook и Telegram |
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
| `npm run db:push` | применить новые миграции из `supabase/migrations` к базе проекта |
| `npm run db:types` | сгенерировать типы БД в `src/shared/api/supabase/database.types.ts` |
| `npm run db:dump` | резервная копия базы в `backups/<дата-время>/`, нужен запущенный Docker (см. «Резервные копии») |

## Структура проекта

Код организован по [Feature-Sliced Design](https://feature-sliced.design) с двумя поправками:
вместо слоя `pages` используется `views`, а слоя `features` нет.

```
src/
├─ app/                # роутинг Next.js (App Router) и слой app
│  ├─ layout.tsx       # html/body, шрифты, metadata, шапка, <main>, подвал
│  ├─ _providers/      # темы, TanStack Query, тултипы, уведомления
│  ├─ robots.ts, sitemap.ts, opengraph-image.jpg   # SEO-файлы
│  └─ api/             # API-роуты; _lib — общие хелперы (ошибки, ответы, zod, защита от CSRF)
├─ views/              # страницы: home, login, onboarding, settings, profile, privacy, terms, not-found
├─ widgets/            # header, footer, sign-in-panel, profile-card, profile-form, account-settings, legal-document
├─ entities/           # viewer (вход), profile (профиль и username), social-link (ссылки на соцсети)
└─ shared/
   ├─ ui/              # компоненты shadcn/ui, Container, Logo, ThemeToggle, NotFoundState, SupportEmailLink
   ├─ lib/             # утилиты: cn, безопасный редирект по ?next=, кроп фото, буфер обмена
   ├─ api/             # apiClient, ApiError, QueryClient; на сервере — клиенты Supabase и типы БД
   └─ config/          # routes, apiRoutes, site, зарезервированные адреса, серверный env
supabase/
├─ config.toml         # настройки Supabase CLI
└─ migrations/         # SQL-миграции схемы БД и Storage
scripts/
└─ db-dump.sh          # резервная копия базы (npm run db:dump)
backups/               # резервные копии; не в git: в них персональные данные
components.json        # настройки shadcn/ui (алиасы под FSD)
.env.example           # шаблон переменных окружения
docs/
├─ PLAN.md             # пошаговый план
└─ legal/              # исходные тексты /privacy и /terms с разделами про аналитику (заготовка)
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
| `/<username>` | личная страница пользователя | готово; `/demo` — демо-профиль, регистр адреса не важен (`/Anna` → `/anna`) |
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
| GET | `/api/me` | текущий пользователь, привязанные способы входа, контактная почта, его профиль и подсказки для онбординга | готово |
| DELETE | `/api/me` | удаление аккаунта со всеми данными; тело `{ "username": "…" }` — подтверждение, без совпадения 400; у аккаунта без страницы подтверждение не нужно | готово |
| POST | `/api/profile` | создание профиля (онбординг) и контактной почты | готово |
| PATCH | `/api/profile` | обновление профиля и контактной почты (только переданные поля) | готово |
| POST | `/api/profile/avatar` | новое фото: файл (JPEG, PNG, WebP до 2 МБ и 1024×1024) или копия фото из аккаунта привязанного провайдера (`provider` — чьё) | готово |
| DELETE | `/api/profile/avatar` | удаление фото | готово |
| GET | `/api/profiles/[username]` | публичный профиль | готово |
| GET | `/api/usernames/[username]` | свободен ли адрес страницы | готово |

Полный список запланированных API-роутов со статусами — в [`AGENTS.md`](AGENTS.md#api).

Служебные файлы: `/robots.txt`, `/sitemap.xml` и `/opengraph-image.jpg` (картинка превью ссылок).

## SEO

- Прод-адрес — `https://www.freud.in` (`siteConfig.url`), `freud.in` редиректит на него. От этого
  адреса строятся `metadataBase`, canonical, `robots.txt` и `sitemap.xml`.
- Open Graph и карточка Twitter по умолчанию: название, описание, `en_US` и картинка
  `src/app/opengraph-image.jpg` (1200×630).
- У `/`, `/privacy` и `/terms` есть canonical, и они перечислены в `sitemap.xml`.
- `/login`, `/onboarding` и `/settings` закрыты от индексации (`noindex, follow`).
- Личные страницы пока рендерятся на клиенте, поэтому поисковики и превью ссылок видят только
  общие данные сайта. Серверный рендер для них запланирован на этапе G.

## Дизайн

- Пока минималистичный дизайн: стандартные компоненты shadcn/ui и минимум контента — только
  навигация и поля ввода.
- shadcn/ui на Radix, стиль по умолчанию (nova), нейтральная палитра, шрифт Geist (с кириллицей для
  пользовательских имён и описаний),
  иконки lucide. Токены темы — в `src/app/globals.css`.
- Светлая, тёмная и системная темы, переключатель в шапке.
- Вёрстка mobile-first, есть ссылка Skip to content для навигации с клавиатуры.
- Компоненты добавляются командой `npx shadcn add <component>` и попадают в `src/shared/ui`.

## Внешние сервисы

Инструкции по настройке появятся здесь по мере интеграции:

- Supabase (БД, авторизация, хранилище фото): см. ниже;
- вход через Google: см. ниже;
- вход через Facebook: см. ниже;
- вход через Telegram: см. ниже;
- Vercel: подключён, см. «Деплой»;
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
  обновляются типы: `npm run db:types`.
- Supabase CLI уже привязан к проекту (`supabase link`). На новой машине привяжи заново:
  `npx supabase link --project-ref <ref>`.
- Прямой адрес базы доступен только по IPv6. Если сеть его не поддерживает, CLI сам идёт через
  пулер, а для `psql` используй `aws-0-eu-central-1.pooler.supabase.com:5432` с пользователем
  `postgres.<ref>`.
- Гость (роль `anon`) читает из `profiles` только колонки публичной страницы, без `id` и дат.

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
- сами файлы фото (Storage хранит их отдельно от базы);
- политики Storage: они есть в миграции `*_create_avatars_bucket.sql`.

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

После этого выполни блоки `create policy` из миграции `*_create_avatars_bucket.sql`. В рабочую
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
через OAuth Supabase и `/api/auth/callback?mode=link`. Итог приходит в `/settings?linked=`
или `?link_error=` и показывается тостом. Способ, уже привязанный к другому аккаунту
Freudin, даёт ошибку `identity_already_exists`: аккаунты не объединяются, второй нужно удалить.
Для аккаунта без страницы кнопка удаления есть на онбординге. Отвязка —
`DELETE /api/auth/identities/<provider>`, последний способ отвязать нельзя. Крупное фото
Facebook хранится в `user_metadata.facebook_avatar_url`, чтобы вход через другого провайдера
его не перезаписал.

## Деплой

Хостинг — Vercel. Каждый коммит в `main` сразу выкладывается в прод на `https://www.freud.in`,
`freud.in` редиректит туда. Отдельного стенда нет, превью-деплои не используем: вход и интеграции
проверяем локально, а после мержа — на проде.

Переменные окружения прода задаются в Vercel → Settings → Environment Variables (окружение
Production). Приложению они нужны с шага 7, и задать их надо до того, как код, который их читает,
попадёт в `main`.
