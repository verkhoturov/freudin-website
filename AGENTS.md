<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Freudin: правила проекта

Freudin — сайт, где пользователь входит через Google, Meta (Facebook Login) или Telegram
и получает личную страницу `/<username>` с фото, именем, описанием и ссылками на соцсети.

- `docs/PLAN.md` — пошаговый план и прогресс. Работаем по нему шаг за шагом.
- `README.md` — описание проекта для людей: запуск, окружение, структура, роуты.

## Процесс работы

1. Перед задачей прочитай этот файл и текущий шаг в `docs/PLAN.md`.
2. **После каждой итерации сверь `README.md` с кодом и обнови его**: стек, скрипты, переменные
   окружения, структура, роуты, настройка внешних сервисов.
3. Если изменились стек, роуты или правила, обнови этот файл. Выполненные пункты отметь
   в `docs/PLAN.md`.
4. **Юнит-тесты пишем ТОЛЬКО по прямому запросу пользователя.** По своей инициативе не добавляй
   тесты (unit, integration, e2e), тестовые фреймворки и их конфиги.
5. **Для проверки результата работы над задачей запускай `npm run lint:fix` и `npm run typecheck`.**
   Обе команды должны завершаться без ошибок. Перед коммитом дополнительно проверь `npm run build`.
6. Зависимости ставь через **npm 11+** (`npx npm@11 install …`, если локально npm 10):
   `package-lock.json` создан npm 11, а npm 10 переписывает его лишними изменениями. CLI shadcn
   ставит пакеты системным npm, поэтому после `npx shadcn add …` пересобери lock-файл:
   `git checkout package-lock.json && npx npm@11 install`.
7. **Тексты интерфейса пишем на английском** (решение 16 в `docs/PLAN.md`): подписи, тосты,
   `aria-label`, `alt`, `metadata`, сообщения zod-схем, `message` ошибок API, юридические тексты.
   Апостроф в них типографский: `Couldn’t`, `can’t`. Логи сервера тоже на английском.
   Документацию и комментарии в коде по-прежнему пишем на русском. Кириллицу в шрифте Geist не убираем: имена и описания пользователей бывают на любом языке.
8. **При вёрстке UI проверяй, насколько разметка соответствует хорошей SEO-оптимизации, и
   предлагай пользователю правки, если SEO можно улучшить** (чек-лист — в разделе «SEO»).
9. Каждый коммит в `main` сразу выкладывается в прод на `www.freud.in`, превью-деплоев нет.
   Если коду нужны новые переменные окружения или настройки внешних сервисов, напомни
   пользователю задать их для прода до мержа.
10. **Git в локальной сессии (CLI, VS Code) — только пользователь.** Не создавай ветки и коммиты,
    не пушь и не переключай ветки без его прямого указания. В облачной сессии коммит и push
    в рабочую ветку разрешены.
11. **Если меняется обработка персональных данных** (новый провайдер входа или сервис, cookies,
    хранилище браузера, аналитика), обнови тексты `/privacy` и `/terms` и дату «Last updated».
    Исходные тексты с разделами про аналитику лежат в `docs/legal/*.draft.md`.

## Стек

| Задача | Выбор |
|--------|-------|
| Фреймворк | Next.js 16 (App Router, React Compiler включён), React 19, TypeScript 5 (strict) |
| Стили и UI | Tailwind CSS 4, shadcn/ui (Radix), lucide-react, next-themes, sonner |
| Запросы к API, серверное состояние | TanStack Query 5 |
| Клиентское состояние | Zustand 5 |
| Формы и валидация | TanStack Form + zod 4 |
| Backend | Route Handlers в `src/app/api` |
| БД, авторизация, файлы | Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Supabase CLI для миграций и типов |
| Линтер и форматтер | Biome |
| Хостинг | Vercel: `main` сразу выкладывается в прод, превью не используем |

Библиотеки ставим на тех шагах `docs/PLAN.md`, где они нужны: что уже установлено, видно
в `package.json`. Не заменяй элементы стека аналогами (react-hook-form, Redux, SWR, axios,
ESLint, Prettier и т. п.). Новую зависимость добавляй, только если задачу нельзя решить стеком,
и упомяни её в `README.md`.

## Клиент и сервер

- **Server Components избегаем.** Серверными остаются только файлы, без которых Next.js не
  работает: корневой `src/app/layout.tsx` (html/body, шрифты, metadata, провайдеры) и тонкие
  файлы роутинга `page.tsx` и `not-found.tsx`. В них нет хуков, загрузки данных и логики:
  только реэкспорт view и статического `metadata`. Кроме них в `src/app` лежат статические
  metadata-файлы без загрузки данных: `robots.ts`, `sitemap.ts`, `opengraph-image.jpg`
  (с `opengraph-image.alt.txt`).
- Весь интерфейс состоит из клиентских компонентов. `"use client"` обязателен в UI-файлах
  слайсов `views` (это граница клиентского дерева) и в модулях, которые импортирует `src/app`
  (например, провайдеры).
- **Вся серверная логика живёт только в Route Handlers `src/app/api/**/route.ts`.** Клиент получает
  данные только из них: через `apiClient` и TanStack Query.
- Не используем Server Actions, загрузку данных в серверных компонентах, `proxy.ts`
  (бывший `middleware.ts`) и `generateMetadata`. Исключения только по согласованию
  с пользователем (см. этап G в `docs/PLAN.md`).
- Клиент никогда не обращается к Supabase напрямую. `@supabase/*` импортируется только
  в `src/shared/api/supabase/`, остальной серверный код берёт клиенты и типы из
  `@/shared/api/index.server`. Ключи Supabase лежат только в серверных env, без `NEXT_PUBLIC_`.
- Серверные модули начинаются с `import "server-only";` и выходят наружу только через
  `index.server.ts` слайса или сегмента.
- Route handler занимается только HTTP: сессия, валидация zod, коды ответов. Работа с данными
  идёт в серверных функциях сущностей (`@/entities/<slice>/index.server`).
- Хелперы route handlers лежат в `@/app/api/_lib`: обработчик оборачиваем в `withErrorHandling`,
  успешный ответ отдаём через `jsonOk<T>(data)`, ожидаемую ошибку — `throw new HttpError(status,
  code, message)`, тело запроса читаем через `parseJsonBody(request, schema)` (ошибка валидации
  превращается в 400 с `fields`).
- `withErrorHandling` защищает от CSRF: изменяющий запрос (не GET, HEAD, OPTIONS) с чужого сайта
  (`Sec-Fetch-Site` не `same-origin` или чужой `Origin`) получает 403 до вызова обработчика.
  Запросы без обоих заголовков (curl, вебхуки) проходят. Роуты без обёртки не пишем.
- Роут с сессией начинается с `const { supabase, claims } = await requireUser()` из
  `@/app/api/_lib`: без сессии это 401, а обновлённая сессия пишется в cookies. Дальше работаем
  через этот `supabase` (RLS действует). Публичные роуты без сессии читают данные через
  `createSupabasePublicClient()` (роль `anon`, cookies не трогает). `createSupabaseAdminClient()`
  обходит RLS, поэтому он только для служебных операций вроде удаления аккаунта.
- Серверные функции сущностей принимают клиент типа `SupabaseClient` из
  `@/shared/api/index.server` и не бросают `HttpError` (слой `app` им недоступен). Ожидаемый исход
  вроде занятого username они возвращают как `{ ok: false, reason }`, а роут превращает его
  в код ответа.
- Ответ с данными пользователя отдаём с заголовком `Cache-Control: private, no-store`
  (`NO_STORE_HEADERS` из `@/app/api/_lib`).
- Роуты, куда браузер приходит переходом, а не через `apiClient` (`/api/auth/sign-in`,
  `/api/auth/callback`), отвечают редиректом, а не JSON. Редирект строим через `redirectTo`,
  ошибку отправляем на страницу входа через `redirectToLogin(origin, code, next)`. Коды ошибок
  и их тексты лежат в `entities/viewer/config/auth-errors.ts`.
- Cookies сессии Supabase — `httpOnly`: браузер их не читает, сессию видят только API-роуты.
  Подключённые провайдеры входа перечислены в `enabledAuthProviders`
  (`entities/viewer/config/auth-providers.ts`): только их кнопки видны на `/login`, остальные
  `/api/auth/sign-in` отправляет на `auth_unavailable`. Подключая провайдер в Supabase,
  добавь его туда.
- Формат ошибки API: `{ "error": { "code": string, "message": string, "fields"?: Record<string, string> } }`
  плюс корректный HTTP-статус. Коды: `bad_request` и `validation_error` (400), `unauthorized` (401),
  `forbidden` (403), `not_found` (404), `conflict` (409), `payload_too_large` (413),
  `internal_error` (500). На клиенте у `ApiError` бывают ещё `network_error` (status 0) и
  `unexpected_response`. Поле `message` пишем для пользователя, на английском.
- В серверном коде из `@/shared/api` импортируем только типы (`import type`): модуль клиентский
  и тянет за собой TanStack Query.
- Путь для редиректа из `?next=` пропускаем только через `getSafeRedirectPath` из
  `@/shared/lib/safe-redirect` — защита от open redirect.
- Серверные переменные окружения читаем только через `getServerEnv()` из
  `@/shared/config/index.server`. Новую переменную добавляй в его zod-схему и в `.env.example`.

## Архитектура: Feature-Sliced Design с поправками

Модуль может импортировать только слои ниже своего:

| Слой | Где | Что лежит |
|------|-----|-----------|
| `app` | `src/app` | Роутинг Next.js и одновременно FSD-слой app: layout, глобальные стили, провайдеры (`_providers/`), API (`api/`) |
| `views` | `src/views` | Страницы (вместо FSD-слоя `pages`): один слайс — один экран |
| `widgets` | `src/widgets` | Крупные самостоятельные блоки и пользовательские сценарии: шапка, форма профиля, панель входа |
| `entities` | `src/entities` | Бизнес-сущности: типы, zod-схемы, API-хуки, серверные функции, простой UI |
| `shared` | `src/shared` | Переиспользуемый код без бизнес-логики: `ui`, `lib`, `api`, `config` |

Поправки к классическому FSD:

- **Слоя `pages` нет, вместо него `views`**: имя `pages` конфликтует с Pages Router Next.js.
- **Слоя `features` нет.** Сценарии (вход, редактирование профиля, выход) собираются в `widgets`,
  а мутации и хуки для них живут в `entities`.
- `src/app` одновременно App Router и слой app. Служебные папки внутри него приватные,
  с префиксом `_` (`_providers`, `api/_lib`), чтобы Next.js не сделал из них роуты.

Правила импортов (их проверяет Biome: `noRestrictedImports` в `overrides` файла `biome.json`):

- Между слоями и слайсами импортируем только через алиас `@/`, внутри слайса — относительными путями.
- Слайс импортируется только через public API: `@/views/<slice>`, `@/widgets/<slice>`,
  `@/entities/<slice>`. Серверный public API: `@/entities/<slice>/index.server`.
- Слайсы одного слоя не импортируют друг друга. Исключение — `entities` через `@x`:
  `@/entities/<slice>/@x/<consumer>`.
- `shared/ui` и `shared/lib` импортируются по файлу (`@/shared/ui/button`,
  `@/shared/lib/utils`), как принято в shadcn. `shared/config` и `shared/api` импортируются
  через index: `@/shared/config`, `@/shared/config/index.server`, `@/shared/api`,
  `@/shared/api/index.server`.
- Клиентский код (`views`, `widgets`, `src/app` вне `api`) не импортирует `index.server`.
- `src/app/api` не импортирует UI (`views`, `widgets`, `shared/ui`) и клиентский public API
  сущностей.

Структура слайса (создавай только нужные сегменты):

```
src/entities/profile/
├─ index.ts          # клиентский public API
├─ index.server.ts   # серверный public API (import "server-only")
├─ @x/               # public API для других сущностей
├─ ui/               # компоненты
├─ model/            # типы, zod-схемы, Zustand-сторы
├─ api/              # query keys, хуки TanStack Query, серверные функции *.server.ts
├─ lib/              # вспомогательные функции слайса
└─ config/           # константы слайса
```

Страница собирается так:

```ts
// src/app/login/page.tsx — только реэкспорт
export { LoginView as default, metadata } from "@/views/login";
```

- `src/views/login/ui/login-view.tsx`: компонент страницы с `"use client"`;
- `src/views/login/config/metadata.ts`: статический `metadata` (обычный модуль без `"use client"`,
  иначе Next.js его не примет);
- `src/views/login/index.ts`: public API, реэкспортирует оба.

Текущие слайсы (переиспользуй, прежде чем создавать новые):

| Слой | Слайс или модуль | Что внутри |
|------|------------------|------------|
| `entities` | `viewer` | провайдеры входа и подключённые из них (`enabledAuthProviders`), коды и тексты ошибок входа, `getSignInHref`, `getLoginHref`, тип `Viewer` (со способом входа `user.provider`), `useViewerQuery`, `useSignOutMutation`, `useDeleteAccountMutation`, `useCreateProfileMutation` (профиль и фото одной мутацией), `useUpdateProfileMutation`, `useSetAvatarMutation`, `useDeleteAvatarMutation` (все обновляют кеш `/api/me` и публичной страницы), `ViewerGuard`, `useViewerRedirect`, `getViewerHomePath`; на сервере `authProviderSchema`, `getOAuthSignInUrl`, `exchangeAuthCode`, `signOut`, `getAuthProvider`, `deleteUser` |
| `entities` | `profile` | правила username, zod-схемы профиля (`profileInputSchema`, `profileUpdateSchema`), лимиты, `PublicProfile`, `UsernameAvailability`, `AvatarSource`, лимиты фото (`AVATAR_MAX_BYTES`, `AVATAR_SIZE`, `AVATAR_MAX_DIMENSION`), `profileQueries`, `usernameQueries`, `toProfileInput`, `getProfileChanges`, `ProfileAvatar` (`sm`, `lg`), `DEMO_USERNAME`; на сервере `getProfileByUserId`, `getProfileByUsername` (с демо-профилем), `isUsernameAvailable`, `createProfile`, `updateProfile`, `setProfileAvatar`, `removeProfileAvatar`, `removeUserAvatarFiles` (сначала обнуляет `avatar_path`), `fetchProviderAvatar`, `detectAvatarImage` (формат и размеры по заголовку файла), `isAvatarSizeAllowed` (не больше `AVATAR_MAX_DIMENSION`), `getProfileSuggestions`; для `viewer` — типы и фабрики запросов через `@x` |
| `entities` | `social-link` | справочник платформ, `normalizeSocialLinkUrl`, `socialLinkSchema`, `SocialLinkButton` (подпись с ником или доменом: `Telegram · @anna`, `example.com`); для `profile` — через `@x` |
| `widgets` | `header`, `footer` | шапка и подвал сайта |
| `widgets` | `sign-in-panel` | кнопки входа с логотипами провайдеров |
| `widgets` | `profile-card` | карточка личной страницы, скелетон, Share, Edit для владельца (`isOwner`) |
| `widgets` | `profile-form` | форма профиля для онбординга и настроек: фото с кропом, имя, адрес с проверкой (`— available` по ответу сервера), описание, соцсети; `mode="edit"` — кнопка активна только при изменениях и предупреждение об уходе с несохранёнными изменениями; `AvatarValue`, `getAvatarSource` |
| `widgets` | `account-settings` | способ входа, Sign out, Delete account с подтверждением |
| `widgets` | `legal-document` | обёртка юридической страницы `LegalDocument` (заголовок, дата редакции, типографика), `OperatorDetails` (реквизиты из `legalConfig`), `CodeList` |
| `views` | `onboarding` | онбординг; черновик формы — Zustand-стор `useOnboardingDraftStore` в `model` |
| `views` | `settings` | настройки: `profile-form` в режиме редактирования и `account-settings` |
| `shared/ui` | свои компоненты | `Container`, `Logo`, `ThemeToggle`, `NotFoundState`, `SupportEmailLink` (`mailto:` на почту поддержки) |
| `shared/lib` | `utils`, `safe-redirect`, `crop-image`, `clipboard`, `use-unsaved-changes-warning` | `cn`, `getSafeRedirectPath`, `cropImage` (кроп и сжатие через canvas), `copyToClipboard`, `useUnsavedChangesWarning` |
| `shared/config` | `routes`, `site`, `legal`, `reserved-usernames`, `env.server` | пути, настройки сайта (в том числе `supportEmail`), реквизиты оператора `legalConfig`, зарезервированные адреса, серверный env |
| `shared/api` | `index.ts`, `index.server.ts` | клиент: `apiClient`, `ApiError`, QueryClient; сервер: `createSupabaseServerClient`, `createSupabasePublicClient`, `createSupabaseAdminClient`, тип `SupabaseClient`, типы БД (`Database`, `Tables`) |

## Роуты

Пути в коде строим только через `routes` (страницы) и `apiRoutes` (API) из `@/shared/config`.

### Страницы

| Путь | Файл роутинга | View | Доступ | Статус |
|------|---------------|------|--------|--------|
| `/` | `src/app/page.tsx` | `home` | все | готово (минимальная) |
| `/login` | `src/app/login/page.tsx` | `login` | гости; авторизованных редиректим | готово: Google; Facebook и Telegram — шаги 9–10 |
| `/onboarding` | `src/app/onboarding/page.tsx` | `onboarding` | авторизованные без профиля; с профилем уводим на `/<username>` | готово |
| `/settings` | `src/app/settings/page.tsx` | `settings` | авторизованные с профилем | готово: профиль и аккаунт |
| `/privacy` | `src/app/privacy/page.tsx` | `privacy` | все | готово: Privacy Policy на английском, у разделов якоря (`#account-and-data-deletion`) |
| `/terms` | `src/app/terms/page.tsx` | `terms` | все | готово: Terms of Service на английском |
| `/<username>` | `src/app/[username]/page.tsx` | `profile` | все | готово: данные из БД, `/demo` — демо-профиль; регистр не важен, адрес приводится к нижнему |
| 404 | `src/app/not-found.tsx` | `not-found` | все | готово |

Служебные файлы:

| Путь | Файл | Что это |
|------|------|---------|
| `/robots.txt` | `src/app/robots.ts` | правила для поисковиков и ссылка на sitemap |
| `/sitemap.xml` | `src/app/sitemap.ts` | публичные страницы |
| `/opengraph-image.jpg` | `src/app/opengraph-image.jpg` | картинка превью ссылок по умолчанию (1200×630) |

`/<username>` — динамический роут верхнего уровня. Статические роуты имеют приоритет, поэтому
занятые ими адреса нельзя отдавать пользователям. Список лежит в
`src/shared/config/reserved-usernames.ts`: первые сегменты путей из `routes` попадают туда
автоматически, поэтому **каждую новую страницу добавляй в `routes`**. Прочие служебные слова
дописывай в `reservedWords` вручную.

### API

Когда роут появляется, меняй его статус.

| Метод | Путь | Назначение | Сессия | Статус |
|-------|------|------------|:------:|--------|
| GET | `/api/health` | проверка связки клиент → API | — | готово |
| GET | `/api/auth/sign-in?provider=&next=` | старт OAuth и редирект к провайдеру | — | готово: Google; Facebook и Telegram → `/login?error=auth_unavailable` до шагов 9–10 |
| GET | `/api/auth/callback?code=&next=` | обмен кода на сессию и редирект | — | готово |
| POST | `/api/auth/sign-out` | выход; без сессии тоже 204 | ✓ | готово |
| GET | `/api/me` | текущий пользователь, его профиль (или `null`) и подсказки для онбординга | ✓ | готово |
| DELETE | `/api/me` | удаление аккаунта: фото (из профиля, затем из Storage), пользователь через admin API (профиль — каскадом), cookies сессии; 204 | ✓ | готово |
| POST | `/api/profile` | создание профиля (онбординг): 201; занятый username — 409 с `fields.username`, профиль уже есть — 409 | ✓ | готово |
| PATCH | `/api/profile` | обновление переданных полей профиля; нет профиля — 404, занятый username — 409 | ✓ | готово |
| POST | `/api/profile/avatar` | новое фото: `multipart/form-data` с полем `file` (JPEG, PNG, WebP до 2 МБ и не больше 1024×1024, иначе 400 или 413) или JSON `{ "source": "provider" }` — копия фото провайдера входа | ✓ | готово |
| DELETE | `/api/profile/avatar` | удаление фото | ✓ | готово |
| GET | `/api/profiles/[username]` | публичный профиль (регистр не важен), `demo` — демо-профиль из кода | — | готово |
| GET | `/api/usernames/[username]` | `{ username, available }`; неверный формат или зарезервированный адрес — 400. Свой текущий адрес тоже «занят» | — | готово |

## Состояние и данные

- Всё, что пришло из `/api`, — серверное состояние, и живёт оно только в TanStack Query.
  Фабрики ключей запросов лежат в сегменте `api` сущности. Мутации инвалидируют или обновляют
  связанные запросы.
- Zustand хранит только клиентское состояние: UI и черновики форм. Серверные данные в стор
  не копируем. Стор лежит в сегменте `model` слайса.
- Локальное состояние компонента — `useState`.
- Текущий пользователь — `useViewerQuery()` из `@/entities/viewer`: гость — `null`, а не ошибка.
  Приватная страница оборачивает содержимое в `ViewerGuard` с нужным `access`: он показывает
  скелетон, пока проверяется сессия, и перенаправляет, если страница пользователю недоступна.
  Защита на клиенте — это UX, а доступ к данным проверяют API-роуты.
- После выхода страница полностью перезагружается на главную: так сбрасываются кеш запросов
  и состояние пользователя.
- Из браузера ходим только через `apiClient` из `@/shared/api` (`get`, `post`, `patch`, `delete`),
  без прямого `fetch` в компонентах.
- Запросы описываем фабриками `queryOptions(...)` в сегменте `api` слайса и передаём `signal`
  из `queryFn` в `apiClient`. Настройки QueryClient: `staleTime` 60 с, ошибки 4xx не ретраятся.
- Провайдеры подключены в `src/app/_providers`: next-themes, QueryClientProvider (devtools только
  в dev), TooltipProvider и Toaster (sonner).

## База данных (Supabase)

- Один облачный проект `freudin_data` (eu-central-1), он же прод. Локального Supabase нет.
- Схема меняется только миграциями в `supabase/migrations`. Новую создаём командой
  `npx supabase migration new <name>`, уже применённые миграции не правим.
- Миграции применяет пользователь (`npm run db:push`): это изменение боевой базы. Перед этим SQL
  можно проверить в транзакции с откатом (`begin; … rollback;`) через `psql`. Перед `db:push`
  напоминай пользователю сделать резервную копию.
- Тариф Free: автоматических бэкапов нет. Копию делает пользователь командой `npm run db:dump`
  (нужен запущенный Docker). Файлы лежат в `backups/`, их нет в git: там персональные данные.
- После применения генерируем типы: `npm run db:types` пишет
  `src/shared/api/supabase/database.types.ts`. Руками этот файл не правим.
- CHECK-ограничения повторяют zod-схемы сущностей: меняя лимит, меняй и схему, и миграцию.
  Зарезервированные username проверяет только сервер.
- На каждой таблице включён RLS. Права ролям выдаём явно (`revoke all`, затем нужные `grant`):
  по умолчанию Supabase открывает `anon` и `authenticated` всё.
- `anon` читает из `profiles` только колонки публичной страницы (`PUBLIC_PROFILE_COLUMNS`):
  `select *` и `select("id")` от гостя дают `permission denied`. Новую публичную колонку
  добавляй и в `PUBLIC_PROFILE_COLUMNS`, и миграцией в `grant select (…) … to anon`.
- Supabase CLI читает переменные из `.env` в корне. Прямой адрес БД доступен только по IPv6,
  поэтому CLI и `psql` подключаются через пулер `aws-0-eu-central-1.pooler.supabase.com:5432`
  (пользователь `postgres.<ref>`).

## Формы

- TanStack Form + zod + компоненты shadcn `Field`. react-hook-form не используем: он конфликтует
  с React Compiler.
- Схему сущности подключаем валидатором формы (`validators: { onChange: schema }`), асинхронные
  проверки (свободен ли адрес) — валидатором поля с `onChangeAsyncDebounceMs`. Ошибку поля
  показываем, когда `meta.isTouched && !meta.isValid`, через `FieldError` и `toFieldErrors`.
- `ApiError.fields` с сервера кладём в `errorMap.onSubmit` полей (путь `a.0.b` → `a[0].b`):
  TanStack Form сам снимает такую ошибку, когда поле исправят.
- Одна zod-схема обслуживает и форму, и API-роут. Она лежит в `model` сущности.

## Стили и UI

- **Дизайн пока минималистичный (решение пользователя):** стандартные компоненты shadcn без
  кастомизации и минимум контента — только то, что нужно для навигации и полей ввода.
  Декоративные элементы, иллюстрации, поясняющие тексты и акцентные цвета без запроса
  не добавляем.
- Tailwind CSS 4. Токены темы — CSS-переменные в `src/app/globals.css`: светлая тема в `:root`,
  тёмная в `.dark`. Меняя цвета, проверяй контраст по WCAG AA (обычный текст — не меньше 4.5:1).
- shadcn/ui на базе **Radix** (композиция через `asChild`): стиль по умолчанию (nova),
  нейтральная палитра, Geist, lucide — пресет `b2fA`. Компоненты живут в `src/shared/ui` и
  добавляются командой `npx shadcn add <component>` (алиасы в `components.json`). Файлы shadcn
  правим только при необходимости.
- После `npx shadcn add` или `npx shadcn apply` проверь три вещи. Первое — пересобери lock-файл
  через npm 11 (см. «Процесс работы»). Второе — CLI перезаписывает компоненты: если `npm run lint:fix`
  находит в них ошибки, исправь точечно (так уже сделано в `field.tsx`). Третье — `apply` умеет
  переписать шрифты в `src/app/layout.tsx`: у Geist должны остаться `subsets: ["latin", "cyrillic"]`.
- Классы объединяем через `cn` из `@/shared/lib/utils`.
- Тему переключает next-themes (класс `.dark` на `<html>`), переключатель — `ThemeToggle`
  из `@/shared/ui/theme-toggle`.
- Корневой layout уже рендерит skip-link, шапку (`@/widgets/header`), единственный
  `<main id="content">` и подвал (`@/widgets/footer`). View не создаёт свой `<main>`, а контент
  выравнивает по `Container` из `@/shared/ui/container`.
- Иконки интерфейса — lucide-react, логотипы брендов — отдельные SVG.
- Вёрстка mobile-first, светлая и тёмная темы, доступность (семантика, aria, фокус).

## SEO

При вёрстке любого UI проверяй разметку по чек-листу ниже. Если SEO можно улучшить, **предложи
пользователю правки** отдельным пунктом в ответе. Правки, которые требуют отступить от правил этого
файла (серверный рендер данных, `generateMetadata`), не делай сам — только предлагай.

- У страницы есть осмысленные `title` и `description`: статический `metadata` view или шаблон
  корневого layout.
- На странице ровно один `<h1>`, уровни заголовков идут по порядку, без пропусков.
- Используются семантические теги: `header`, `nav`, `main` (он один и уже есть в корневом layout),
  `article`, `section`, `aside`, `footer`; перечисления оформлены списками.
- Ссылки сделаны через `next/link` и имеют понятный текст; у кнопок без текста есть `aria-label`.
- У изображений есть осмысленный `alt` (у декоративных — пустой) и заданы размеры (`next/image`).
- Домен и базовые настройки лежат в `siteConfig` (`url: "https://www.freud.in"`, а `freud.in`
  редиректит на `www`). Корневой layout задаёт `metadataBase`, Open Graph по умолчанию и карточку
  Twitter.
- Страница, которая задаёт свой `openGraph`, заменяет объект из layout целиком (слияние
  поверхностное), поэтому повторяй в нём нужные поля по умолчанию.
- Картинка превью по умолчанию — `src/app/opengraph-image.jpg` (1200×630). Alt лежит
  в `opengraph-image.alt.txt` без перевода строки в конце: Next.js его не обрезает.
- У публичной страницы есть `alternates: { canonical: routes.<страница> }`, и сама она добавлена
  в `publicPages` в `src/app/sitemap.ts`.
- Служебные и приватные страницы не индексируются: в их `metadata` стоит
  `robots: { index: false, follow: true }` (сейчас это `/login`, `/onboarding` и `/settings`).
  В `robots.txt` их не закрываем, иначе поисковик не увидит `noindex`.
- Контент, важный для поиска и превью ссылок, должен попадать в серверный HTML. Данные сейчас
  грузятся на клиенте, поэтому для публичных страниц это ограничение нужно учитывать и обсуждать
  с пользователем (этап G в `docs/PLAN.md`).

## Код-стайл

- Biome: `npm run lint` проверяет, `npm run lint:fix` исправляет и форматирует. Ширина строки — 100.
- TypeScript strict, без `any` и `@ts-ignore`.
- Имена файлов и папок — kebab-case, компоненты — PascalCase. Экспорты именованные
  (`export function LoginView`), default-экспорт только там, где его требует Next.js.
- Комментарии пишем, только когда код неочевиден.

## Команды

| Команда | Что делает |
|---------|------------|
| `npm run dev` | dev-сервер на http://localhost:3000 |
| `npm run build` | прод-сборка |
| `npm run start` | запуск прод-сборки |
| `npm run lint` | Biome: линт, формат, порядок импортов, границы слоёв |
| `npm run lint:fix` | то же с автоисправлением |
| `npm run typecheck` | генерация типов роутов (`next typegen`) и `tsc --noEmit` |
| `npm run db:push` | применить миграции из `supabase/migrations` к базе проекта (запускает пользователь) |
| `npm run db:types` | сгенерировать типы БД в `src/shared/api/supabase/database.types.ts` |
| `npm run db:dump` | резервная копия базы в `backups/<дата-время>/` (запускает пользователь, нужен Docker) |

## Next.js 16: на что обратить внимание

- Документация установленной версии лежит в `node_modules/next/dist/docs/` (см. блок в начале файла).
- `middleware.ts` переименован в `proxy.ts`; мы его не используем.
- Глобальные типы `PageProps`, `LayoutProps` и `RouteContext` генерирует `next typegen`.
- `metadata` можно экспортировать только из серверных модулей.
- В клиентских компонентах параметры роута читаем через `useParams()`, query — через
  `useSearchParams()`. Компонент с `useSearchParams()` на статической странице оборачиваем
  в `<Suspense>`, иначе сборка упадёт.
- Строку адреса без навигации меняем через `window.history.replaceState(window.history.state, "", url)`.
  С `null` вместо состояния Next теряет своё дерево роутов, и «Назад» показывает не ту страницу.
  `router.replace` для этого не подходит: он заново выставляет заголовок вкладки из `metadata`.
- `notFound()` работает только в серверном коде. В клиентских view состояние 404 рисуем сами
  (`NotFoundState` из `@/shared/ui/not-found-state`).
- `next lint` удалён, линтим через Biome.
