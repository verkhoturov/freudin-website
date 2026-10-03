<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Freudin: правила проекта

Freudin — сайт для психологов и их будущих клиентов. Психолог входит через Google, Meta
(Facebook Login) или Telegram и делает личную страницу-визитку `/<username>`, а клиент без
регистрации находит психолога (каталог, лента постов и AI-ассистент — в плане). Сайт — минимальный
посредник: не проверяет психологов, не участвует в их общении с клиентами и не берёт оплату.

- `docs/PRODUCT.md` — описание продукта: аудитории, пять опор, чего Freudin не делает. Читай его
  перед задачами про тексты страниц, маркетинг, дизайн и планы развития.
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
12. **Отчёт по плану** (пользователь просит положение дел по `docs/PLAN.md`) — таблицы в чате.
    Перед ними сверь неотмеченные пункты плана с кодом.
    - Статусы: ✅ готово, 🟡 в процессе, ⬜ впереди, 💤 после MVP (по согласованию). В начале
      отчёта — строка с их расшифровкой.
    - Этап выделяется визуально (просьба пользователя 29.09.2026): заголовок `###` со статусом,
      буквой и названием (`### 🟡 D. Профиль`), под ним строка — что и от кого ждём, затем таблица
      шагов этапа. В таблице Markdown размер текста не меняется, поэтому этап — не строка таблицы.
      Этап, где сделаны все шаги, — заголовок и строка о том, что сделано, без таблицы.
    - Столбцы таблицы: «Шаг», «Что», «Статус», «Кто что делает». Порядок этапов и шагов — как
      в плане.
    - Подшаги — отдельными строками, но номера не глубже второго уровня (`18`, `18.1`). Несколько
      действий внутри подшага перечисляй в «Кто что делает». Выполненные подшаги незаконченного
      шага сворачивай в одну строку (`9.1–9.14, 9.16 ✅`).
    - Исполнители — 🤖 ИИ и 🧑‍💻 Разработчик, вместе — «🤖 и 🧑‍💻». Те же метки стоят в начале
      пунктов плана (описаны в начале раздела 5 `docs/PLAN.md`).
    - В строке со статусом 🟡, включая родительские шаги, напиши, что именно и от кого ожидается,
      с номерами подшагов.
    - Шагов вроде «исправить найденное» не заводим: исправления станут отдельными шагами
      с конкретными сценариями.

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
| UI kit | Storybook 10 (`@storybook/nextjs-vite`), только dev; опубликован отдельным проектом Vercel |
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
  только реэкспорт view и статического `metadata`. Границы ошибок клиентские: `error.tsx`
  (`"use client"` и реэкспорт view `error`) и `global-error.tsx` — он заменяет упавший корневой
  layout, поэтому сам рисует html и body, подключает `globals.css`, шрифты и тему (без шапки
  и данных). Кроме них в `src/app` лежат статические metadata-файлы без загрузки данных:
  `robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.jpg` (с `opengraph-image.alt.txt`),
  иконки `icon.svg`, `apple-icon.png` и `favicon.ico`, а также тема `globals.css` и модуль
  шрифтов `fonts.ts`.
- **Исключения — серверный рендер (решение пользователя 30.09.2026).** Личная страница
  `/<username>` загружает профиль на сервере: `ProfilePage` и `generateMetadata` из
  `@/views/profile/index.server` (`ui/profile-page.server.tsx`). Он читает профиль серверной
  функцией сущности через `createSupabasePublicClient()`, на несуществующий адрес отвечает
  `notFound()` (настоящий 404), адрес с заглавными буквами — редиректом 308 на нижний регистр,
  а данные передаёт клиентской `ProfileView`. Юридические страницы `/privacy` и `/terms`
  (view и виджет `legal-document`) — серверные компоненты без `"use client"`: в них только
  статический текст, и клиентский JS им не нужен. Новые исключения — только по согласованию.
- В остальном интерфейс состоит из клиентских компонентов. `"use client"` обязателен в UI-файлах
  слайсов `views` (это граница клиентского дерева) и в модулях, которые импортирует `src/app`
  (например, провайдеры).
- **Вся серверная логика живёт только в Route Handlers `src/app/api/**/route.ts`** (кроме
  серверного рендера выше). Клиент получает данные только из них: через `apiClient`
  и TanStack Query.
- Не используем Server Actions, загрузку данных в серверных компонентах, `proxy.ts`
  (бывший `middleware.ts`) и `generateMetadata`, кроме исключений выше. Новые — только
  по согласованию с пользователем (см. этап G в `docs/PLAN.md`).
- Клиент никогда не обращается к Supabase напрямую. `@supabase/*` импортируется только
  в `src/shared/api/supabase/`, остальной серверный код берёт клиенты и типы из
  `@/shared/api/index.server`. Ключи Supabase лежат только в серверных env, без `NEXT_PUBLIC_`.
- Серверные модули начинаются с `import "server-only";` и выходят наружу только через
  `index.server.ts` слайса или сегмента.
- Route handler занимается только HTTP: сессия, валидация zod, коды ответов. Работа с данными
  идёт в серверных функциях сущностей (`@/entities/<slice>/index.server`).
- Хелперы route handlers лежат в `@/app/api/_lib`: обработчик оборачиваем в `withErrorHandling`,
  успешный ответ отдаём через `jsonOk<T>(data)`, ожидаемую ошибку — `throw new HttpError(status,
  code, message)`, тело запроса читаем через `parseJsonBody(request, schema)`, query — через
  `parseSearchParams(request, schema)` (ошибка валидации превращается в 400 с `fields`).
  Картинку из `multipart/form-data` (поле `file`) читает `readImageUpload(request, { maxBytes,
  maxDimension, noun })`: формат по сигнатуре, 413 за размер, 400 за формат и стороны.
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
  `/api/auth/callback`, `/api/auth/callback/[provider]`), отвечают редиректом, а не JSON. Редирект
  строим через `redirectTo`, после входа — через `redirectAfterSignIn`, ошибку отправляем
  на страницу входа через `redirectToLogin(origin, code, next)`, итог привязки способа входа —
  в раздел Account настроек через `redirectToSettings`. Коды ошибок и их тексты лежат
  в `entities/viewer/config/auth-errors.ts`.
- Cookies сессии Supabase — `httpOnly`: браузер их не читает, сессию видят только API-роуты.
  Подключённые провайдеры входа перечислены в `enabledAuthProviders`
  (`entities/viewer/config/auth-providers.ts`): только их кнопки видны на `/login`, остальные
  `/api/auth/sign-in` отправляет на `auth_unavailable`. Подключая провайдер в Supabase,
  добавь его туда.
- Google и Telegram входят без OAuth Supabase (`GOOGLE_*` и `TELEGRAM_*` обязательны): провайдер
  возвращает на наш `/api/auth/callback/<provider>`, сессия создаётся по ID-токену
  (`signInWithIdToken`), код общий — `oidc-sign-in.server.ts`. Так на экране провайдера виден
  наш сайт, а не `<ref>.supabase.co`. Telegram не принимает адреса возврата с `http://`, поэтому
  на localhost он входит через OAuth Supabase (решает `getOidcProvider`). Facebook идёт через
  OAuth Supabase (`getOAuthSignInUrl`) и `/api/auth/callback`.
- К одному аккаунту можно привязать несколько способов входа (в Supabase включён Allow manual
  linking). Привязка начинается `POST /api/auth/identities` и идёт теми же путями, что вход:
  Google и Telegram на https — `linkIdentity` по ID-токену (`linkUserId` в cookie попытки входа,
  привязка только к тому, кто её начал), остальные — `linkIdentity` через OAuth Supabase
  и `/api/auth/callback?mode=link`. Итог колбэки отдают в `/settings?section=account&linked=` или `&link_error=`
  (`identityLinkParams`). Привязанные способы и их фото читает `getLinkedIdentities`
  (`auth.getUser()`: идентичностей нет в JWT).
- Формат ошибки API: `{ "error": { "code": string, "message": string, "fields"?: Record<string, string> } }`
  плюс корректный HTTP-статус. Коды: `bad_request` и `validation_error` (400), `unauthorized` (401),
  `forbidden` (403), `not_found` (404), `conflict` (409), `payload_too_large` (413),
  `internal_error` (500). На клиенте у `ApiError` бывают ещё `network_error` (status 0: нет
  сети или ответа нет дольше 30 с, загрузки файлов — 120 с) и `unexpected_response`. Поле
  `message` пишем для пользователя, на английском.
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
  Исключения для серверного рендера: `page.tsx` берёт `@/views/<slice>/index.server`, а серверные
  модули view (`*.server.ts(x)`) — `@/entities/<slice>/index.server` и `@/shared/api/index.server`.
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

Страница с серверным рендером (сейчас только `/<username>`) реэкспортирует серверный public API
view: `export { generateMetadata, ProfilePage as default } from "@/views/profile/index.server";`.

Текущие слайсы (переиспользуй, прежде чем создавать новые):

| Слой | Слайс или модуль | Что внутри |
|------|------------------|------------|
| `entities` | `viewer` | провайдеры входа и подключённые из них (`enabledAuthProviders`), коды и тексты ошибок входа, `getSignInHref`, `getLoginHref`, тип `Viewer` (привязанные способы входа `user.signInMethods`: провайдер, email или `@username`, фото), `SignInMethod`, `getAccountPhotos`, `AuthProviderIcon` (логотипы провайдеров), `useViewerQuery`, `useSignOutMutation`, `useDeleteAccountMutation` (с подтверждением username, без профиля — без него), `isAccountDeletionConfirmed`, `useLinkIdentityMutation`, `useUnlinkIdentityMutation`, `identityLinkParams`, `useCreateProfileMutation` (профиль и фото одной мутацией), `useUpdateProfileMutation`, `useSetAvatarMutation`, `useDeleteAvatarMutation`, `useUploadDocumentMutation` (изображение, превью и подпись), `useDeleteDocumentMutation` (все обновляют кеш `/api/me` и публичной страницы), `ViewerGuard` (скелетон, ошибка через `ErrorState`), `useViewerRedirect`; на сервере `authProviderSchema`, `identityLinkInputSchema`, `deleteAccountInputSchema`, `isAccountDeletionConfirmed`, `getOAuthSignInUrl`, `getOAuthErrorCode`, `exchangeAuthCode`, `signOut`, `deleteUser`, способы входа: `getLinkedIdentities`, `toSignInMethod`, `getOAuthLinkUrl`, `getOAuthLinkError`, `unlinkIdentity`; вход и привязка Google и Telegram без OAuth Supabase: `getOidcProvider`, `oidcProviderSchema`, `startOidcSignIn`, `takeOidcSignInState`, `completeOidcSignIn`, `completeOidcLink` |
| `entities` | `profile` | правила username, zod-схема профиля `profileInputSchema` (контактная почта необязательна, пустая строка — нет почты; `profileUpdateSchema` — на сервере), лимиты, `PublicProfile`, `UsernameAvailability`, `AvatarSource`, лимиты фото (`AVATAR_SIZE`, `AVATAR_MAX_DIMENSION`; `AVATAR_MAX_BYTES` — на сервере), `profileQueries`, `usernameQueries`, `toProfileInput(profile, contactEmail)`, `getProfileChanges(saved, input)` (связанные поля — группой), `toPreviewProfile(input, { avatarUrl, city })` (превью страницы из значений формы: неверные поля и закрытые данные не попадают, документы — пустой список), `ProfileAvatar` (`sm`, `lg`), `DEMO_USERNAME`; данные психолога: справочники `approachIds`/`approachLabels`, `clientTypeIds`/`clientTypeLabels`, `workFormatIds`/`workFormatLabels`, `languageCodes`, `currencyCodes`, `getLanguageName`, `getCurrencyName`, `formatPrice` (`$60`, без копеек), `getEmptySettingsInput` (поля, которые есть только в настройках), стаж `formatExperience`, образование `ProfileEducation` (`EDUCATION_MAX`), контакты для связи `contactTypeIds`/`contactTypeLabels`, `contactsSchema`, `getContactHref`, `getContactCaption`, предпочтительный способ связи `preferredContact` (тип контакта или адрес ссылки; пропавший сбрасывается схемой); закрытые данные (`PrivateProfileDetails`, на странице их нет): дата рождения (`MIN_AGE`), пол `genderIds`/`genderLabels`, запросы клиентов `concernGroups`/`concernIds` (группы пар — при «Couples», детские — при «Children» или «Teens» в `clientTypes`, `isConcernGroupAvailable`; недоступные схема отбрасывает); группы полей, которые `PATCH` принимает только вместе, — `linkedFieldGroups`; порядок блоков страницы: `profileSectionIds` (порядок по умолчанию; блоки `services` и `faq` — только в настройках), `profileSectionLabels`, `normalizeSectionOrder`, тип `ProfileSection`, лимиты (`APPROACHES_MAX`, `LANGUAGES_MAX`, `PRICE_AMOUNT_MAX`, `DOCUMENTS_MAX`, `DOCUMENT_MAX_BYTES`, `DOCUMENT_MAX_DIMENSION`), `documentTitleSchema`, типы `ProfilePrice`, `ProfileDocument`; на сервере `getProfileByUserId`, `getProfileByUsername` (с демо-профилем), `isUsernameAvailable`, `createProfile` и `updateProfile` (контактную почту сохраняют первой; город не из справочника — `city_invalid`), `getContactEmail`, `getPrivateDetails` (из `profile_private`), `setProfileAvatar`, `removeProfileAvatar`, `removeUserAvatarFiles` (сначала обнуляет `avatar_path`), `fetchProviderAvatar`, `detectImage` (формат и размеры по заголовку файла), документы: `addProfileDocument`, `removeProfileDocument` (список пишется целиком с проверкой `updated_at`), `removeUserDocumentFiles`, `getProfileSuggestions` (адрес: username провайдера → имя латиницей → часть email до «@»); для `viewer` — типы и фабрики запросов через `@x`; содержимое страницы: FAQ `ProfileFaqItem` (`FAQ_MAX`, длины вопроса и ответа), карточки услуг `ProfileService` (категория из выбранных `clientTypes` — иначе ошибка у карточки, а не удаление; `toProfileService`, `SERVICES_MAX`), выделенные блоки `highlightedSections`, вариант обложки `coverIds`/`coverLabels` (пока только сохраняется, вид страницы не меняет); скрытая страница: режим `visibility` (`ProfileVisibility`: `public`, `private` — видит только владелец, `password` — по паролю; `hiddenVisibilityLabels`, `PAGE_PASSWORD_MIN_LENGTH`/`MAX` — 4–8 символов), поле формы `pagePassword` (пароль открытым текстом, виден только владельцу; пустое — не задан, режиму `password` обязателен; группа с `visibility`), `pagePassword` в `PrivateProfileDetails`, `pageAccessInputSchema`, `useUnlockPageMutation`; на сервере `getVisitorProfile` (страница глазами гостя: открытая, открытая по cookie доступа или `hidden` с режимом), `unlockProfilePage`, `setPageAccessCookie` (cookie `freudin-page-access-<username>`, httpOnly, 30 дней), режим и пароль пишет `updateProfile` через функцию базы `set_profile_visibility` |
| `entities` | `location` | коды стран `countryCodes` (ISO 3166-1 и `XK`), `getCountryName`, тип `City`, `cityQueries.search(country, query)`; на сервере `searchCities` (по `cities.search_name`, до 10 городов по населению), `citySearchParamsSchema`; для `profile` — `City`, `toCity`, `CITY_COLUMNS` через `@x` |
| `entities` | `social-link` | справочник платформ, `socialLinkSchema` (нормализует адрес; необязательный свой заголовок `title` до `SOCIAL_LINK_TITLE_MAX_LENGTH` символов, пустая строка — нет; ссылки без поля из БД читаются как раньше), `getSocialLinkCaption` и `SocialLinkButton` (свой заголовок, без него — ник или домен: `Telegram · @anna`, `example.com`); для `profile` — через `@x` |
| `widgets` | `header`, `footer` | шапка сайта; подвал: ссылки на Privacy и Terms, почта поддержки, строка © с годами (`useCopyrightYears`: `2026`, затем `2026–<текущий год>`) и реквизиты ИП из `legalConfig` (по ним Meta сверяет компанию с сайтом) |
| `widgets` | `sign-in-panel` | кнопки входа с логотипами провайдеров (`AuthProviderIcon` из `viewer`) |
| `widgets` | `profile-card` | карточка личной страницы: главная кнопка связи под именем (`PreferredContactButton`: предпочтительный способ связи; у ссылки — её заголовок, без него `Open <платформа>` или `Visit website`, «Message on …» только у WhatsApp и Telegram из контактов), блоки после фото и имени в порядке `profile.sectionOrder` (незаполненные скрыты, пункты практики подряд — один `dl`, `PracticeDetails`), документы (`DocumentGallery`: превью, полное изображение в диалоге), подсказки владельцу `OwnerChecklist` («Finish your page»: фото, контакт, главная кнопка, формат и цена — ссылки `routes.settingsBlock`; скрытие — Zustand-стор `useChecklistStore` в localStorage по username), `isPreview` — превью в редакторе (без Share, Edit и подсказок, имя не `h1`), Share (диалог: QR-код прод-адреса страницы из `siteConfig.url` на `qrcode.react`, скачивание PNG, копирование ссылки, системное меню, где есть `navigator.share`), Edit для владельца (`isOwner`); FAQ (`FaqList`: `details`, ответ в серверном HTML), карточки услуг (`ServiceList`: категория, длительность, цена, кнопка связи — то же действие, что главная кнопка, `getPreferredContactAction`), выделение: блок и отдельный пункт практики — на фоне `accent`, ссылка — `variant="secondary"`, карточка — фон `accent` |
| `widgets` | `profile-form` | форма профиля для онбординга и настроек: фото с кропом и фото из аккаунтов (`accountPhotos`; если их несколько — меню выбора), имя, адрес с проверкой (`— available` по ответу сервера), описание, соцсети, необязательная почта (`showContactEmail`: у аккаунта нет email от провайдера или контакт уже сохранён), блоки с данными психолога (`showPractice`, `currentCity` — только в настройках): с кем работает, подходы, формат, страна и город из справочника, языки, цена, стаж, образование, контакты для связи и выбор предпочтительного способа связи (`getPreferredContactOptions`: заполненные контакты и ссылки); поля Search details (дата рождения, пол, запросы клиентов, только в настройках); конструктор страницы (`showSectionOrder`, только в настройках): блоки после фото, имени и адреса в рамках и в порядке `sectionOrder`, их переставляют перетаскиванием за ручку (`@dnd-kit`) и стрелками ↑↓ (`SortableBlocks`); блок документов приходит слотом `documentsBlock` (сводка — `documentsSummary`); в конструкторе у каждого блока галочка выделения (`HighlightCheckbox`), у ссылок и карточек услуг — своя; редакторы FAQ (примеры вопросов, перестановка ↑↓) и карточек услуг (при двух и больше категориях Works with; карточка снятой категории помечается ошибкой); выбор обложки Page cover; в Account (только `mode="edit"`) — Hide my page: галочка, режим `RadioGroup` (Only me, Anyone with the password) и поле Password с сохранённым паролем и кнопкой-глазом (`InputGroup`); при Save неверные поля помечаются тронутыми — иначе ошибка связанного поля, появившаяся без касания, молча блокирует отправку; контактная почта — на странице её нет; разделы настроек (`section`: `account` — адрес, почта и слот `accountBlock` вне `<form>`, `profile` — фото, имя, обложка, конструктор и превью, `search` — Search details; тип `ProfileFormSection`): остальные разделы скрыты `hidden`; правки живут только в открытом разделе (страница пересоздаёт форму при смене раздела); в Account кнопка Save стоит под полями, в остальных — в липкой панели; без `section` видна вся форма (онбординг); сворачивание блоков (`collapsedBlocks`, `onCollapsedChange`: состояние хранит страница; свёрнутое прячется `hidden` и остаётся в DOM, у свёрнутого — сводка `getBlockSummary` без закрытых данных; ошибка при сохранении разворачивает блок по `fieldBlocks` и ставит фокус на первое неверное поле; `#block-<id>` в адресе разворачивает блок и ведёт к нему); липкая панель Save (`data-sticky-actions`, кнопка вне `<form>` через `form=`); раскладка `layout`: `inline` (онбординг) — превью колонкой рядом с формой, только в разделе `profile`; `workspace` (настройки) — колонка формы 22rem и рамка превью на всю остальную ширину и высоту экрана, превью во всех разделах, над формой слот `header`; превью `renderPreview(profile)` встаёт рядом, когда ширины корня формы хватает (container query `@3xl`, 48rem), иначе — кнопка Preview / Edit в липкой панели (в Account её нет); при узкой форме строка ссылки перестраивается: платформа и × сверху, поля под ними (`@md/field-group`), форма при этом скрыта, но не размонтирована; `mode="edit"` — кнопка активна только при изменениях, статус Unsaved changes и предупреждение об уходе с несохранёнными изменениями; `AvatarValue`, `getAvatarSource`, `getAvatarUrl` |
| `widgets` | `account-settings` | без своего заголовка (раздел Account рисует страница): способы входа (Connect, Disconnect, тост итога привязки), Sign out, Delete account с подтверждением вводом username; `DeleteAccountDialog` (с `username={null}` — для аккаунта без страницы) |
| `widgets` | `legal-document` | обёртка юридической страницы `LegalDocument` (заголовок, дата редакции, типографика), `OperatorDetails` (реквизиты из `legalConfig`), `CodeList` |
| `views` | `error` | страница ошибки рендера: `ErrorState` с `retry` из Next (для `error.tsx` и `global-error.tsx`) |
| `views` | `profile` | личная страница с серверным рендером: `ProfilePage` и `generateMetadata` (имя в `title`, начало «О себе» в `description`, в превью ссылки — фото, без фото — картинка сайта) в `index.server`; клиентская `ProfileView` берёт профиль из кеша запроса с `initialData` с сервера, чтобы правки владельца из мутаций были видны и после «Назад»; скрытая страница — `HiddenProfileView`: гостю `HiddenPageNotice` («Hidden page» или «Protected page» с формой пароля `PagePasswordForm`, после верного — `router.refresh()`; история `Views/Hidden page`), владельцу — его страница из `/api/me` с пометкой; в метаданных скрытой страницы нет имени и фото, `noindex` |
| `views` | `onboarding` | онбординг с превью страницы (`ProfileCard` с `isPreview`) и удаление аккаунта без страницы; черновик формы — Zustand-стор `useOnboardingDraftStore` в `model` |
| `widgets` | `profile-documents` | документы психолога в настройках (без своего заголовка: стоит блоком в конструкторе `profile-form`): список с превью, загрузка в диалоге (картинка уменьшается в браузере до 2048 px, превью — до 480 px, подпись обязательна) и удаление с подтверждением; сохраняются сразу, без формы профиля |
| `views` | `settings` | настройки — редактор на весь экран без шапки и подвала сайта: слева сайдбар на всю высоту (логотип, `ThemeToggle`, `SectionNav` с разделами Account, Public profile, Search details; уже `lg` — панель сверху), справа `profile-form` с `layout="workspace"`: колонка формы 22rem (поля — 19rem) и рамка превью `ProfileCard` на всю остальную ширину и высоту экрана (как окно браузера: карточка внутри держит ширину личной страницы, прокручивается рамка; вокруг — фон `muted`), превью видно во всех разделах; заголовок `h1` — название раздела (слот `header`), в `title` вкладки — Settings; раздел — в адресе `?section=` (`routes.settingsSection`, по умолчанию Public profile; смена раздела пересоздаёт форму — `key` с разделом, несохранённые правки сбрасываются после `confirm` из `useUnsavedChangesWarning`); `account-settings` — слотом `accountBlock`; свёрнутые блоки — Zustand-стор `useCollapsedBlocksStore` в `model` (localStorage, по id пользователя, только id блоков) |
| `shared/ui` | свои компоненты | `Container`, `Logo` (адрес `freud.in` с розовой точкой `text-cta`, ссылка на главную), `ThemeToggle`, `NotFoundState`, `ErrorState` (ошибка вместо страницы: Try again и почта поддержки), `Spinner` (в кнопках ожидания, скрыт от скринридеров), `toast` в `sonner` (обёртка sonner), `SupportEmailLink` (`mailto:` на почту поддержки), `SectionNav` (навигация по разделам страницы: ссылки с `aria-current`, выбранная — фон `accent`; уже `lg` — ряд кнопок, от `lg` — колонка сайдбара), `DisclosureButton` (кнопка-заголовок сворачиваемого блока: `aria-expanded`, `aria-controls`; содержимое прячет сам блок атрибутом `hidden`, Collapsible из Radix не берём — он размонтирует поля формы), `Combobox` (выбор из длинного списка с поиском на `popover` и `command`: одиночный и мультивыбор, поиск на сервере через `search`, кнопка очистки `onClear`) |
| `shared/lib` | `utils`, `cva`, `safe-redirect`, `canvas-image`, `crop-image`, `clipboard`, `use-unsaved-changes-warning`, `use-debounced-value`, `field-errors`, `transliterate` | `cn`, `cva` и `VariantProps` (варианты классов компонента, замена `class-variance-authority`), `getSafeRedirectPath`, `loadImage`, `resizeImage` и `encodeCanvas` (уменьшение и перекодирование через canvas в WebP или JPEG, EXIF пропадают, качество снижается, пока файл не влезет в лимит), `cropImage` (кроп и сжатие через canvas), `useDebouncedValue`, `toFieldErrors` и `toFormFieldName` (ошибки TanStack Form для `FieldError` и пути полей из ответа API), `copyToClipboard`, `useUnsavedChangesWarning`, `transliterate` (кириллица и диакритика → латиница), `toSearchKey` (ключ поиска по началу строки, им собран `cities.search_name`) |
| `shared/config` | `routes`, `site`, `legal`, `theme`, `reserved-usernames`, `env.server` | пути, настройки сайта (в том числе `supportEmail`), реквизиты оператора `legalConfig`, цвета темы для `themeColor` (`themeColors`, повторяют токены `globals.css`), зарезервированные адреса, серверный env |
| `shared/api` | `index.ts`, `index.server.ts` | клиент: `apiClient`, `ApiError`, QueryClient; сервер: `createSupabaseServerClient`, `createSupabasePublicClient`, `createSupabaseAdminClient`, тип `SupabaseClient`, типы БД (`Database`, `Tables`) |

## Роуты

Пути в коде строим только через `routes` (страницы) и `apiRoutes` (API) из `@/shared/config`.

### Страницы

| Путь | Файл роутинга | View | Доступ | Статус |
|------|---------------|------|--------|--------|
| `/` | `src/app/page.tsx` | `home` | все | готово (минимальная) |
| `/login` | `src/app/login/page.tsx` | `login` | гости; авторизованных редиректим | готово: Google, Facebook и Telegram |
| `/onboarding` | `src/app/onboarding/page.tsx` | `onboarding` | авторизованные без профиля; с профилем уводим на `/<username>` | готово: превью страницы |
| `/settings` | `src/app/settings/page.tsx` | `settings` | авторизованные с профилем | готово: редактор на весь экран без шапки и подвала, разделы Account, Public profile и Search details в сайдбаре (`?section=`, `routes.settingsSection`), сворачивание блоков, панель Save, превью во всех разделах; `routes.settingsBlock(id)` (`#block-<id>`) ведёт к блоку |
| `/privacy` | `src/app/privacy/page.tsx` | `privacy` | все | готово: Privacy Policy на английском, у разделов якоря (`#account-and-data-deletion`) |
| `/terms` | `src/app/terms/page.tsx` | `terms` | все | готово: Terms of Service на английском |
| `/<username>` | `src/app/[username]/page.tsx` | `profile` | все | готово: серверный рендер (данные из БД, `/demo` — демо-профиль), нет профиля — 404, адрес с заглавными — редирект 308 на нижний регистр |
| 404 | `src/app/not-found.tsx` | `not-found` | все | готово |
| Ошибка | `src/app/error.tsx`, `src/app/global-error.tsx` | `error` | все | готово: Try again (`retry`) и почта поддержки |

Служебные файлы:

| Путь | Файл | Что это |
|------|------|---------|
| `/robots.txt` | `src/app/robots.ts` | правила для поисковиков и ссылка на sitemap |
| `/sitemap.xml` | `src/app/sitemap.ts` | публичные страницы |
| `/opengraph-image.jpg` | `src/app/opengraph-image.jpg` | картинка превью ссылок по умолчанию (1200×630) |
| `/icon.svg` | `src/app/icon.svg` | фавиконка: розовая точка из логотипа на фиолетовой плитке, цвета `violet-700` и `pink-400` |
| `/apple-icon.png` | `src/app/apple-icon.png` | та же иконка для iOS, 180×180, квадрат без скругления (углы срезает iOS) |
| `/favicon.ico` | `src/app/favicon.ico` | та же иконка 32×32 (PNG внутри ICO) для тех, кто запрашивает `/favicon.ico` напрямую |
| `/manifest.webmanifest` | `src/app/manifest.ts` | название, цвета (`themeColors`) и иконки для «На экран Домой»: `public/icon-192.png`, `icon-512.png` и `icon-maskable-512.png` (квадрат без скругления, точка в безопасной зоне) |

Иконки рисуются одинаково: меняя цвета бренда, обнови `icon.svg` и пересобери PNG и ICO из него
(в том числе иконки манифеста в `public`).

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
| GET | `/api/auth/sign-in?provider=&next=` | старт OAuth и редирект к провайдеру | — | готово: Google, Facebook и Telegram |
| GET | `/api/auth/callback?code=&provider=&next=&mode=` | обмен кода на сессию и редирект (вход через OAuth Supabase: Facebook, Telegram на localhost); ошибку провайдера переводит в код через `getOAuthErrorCode`; после Facebook берёт фото 512×512 из Graph API. `mode=link` — привязка способа входа, итог в `/settings` | — | готово: Facebook и Telegram |
| GET | `/api/auth/callback/[provider]?code=&state=` | возврат от Google и Telegram без OAuth Supabase (`provider`: `google`, `telegram`): проверка `state` по cookie `freudin-<provider>-sign-in`, код → ID-токен → сессия Supabase, редирект. С `linkUserId` в cookie — привязка способа входа, итог в `/settings` | — | готово |
| POST | `/api/auth/identities` | старт привязки способа входа: `{ provider }` → `{ url }` провайдера; не подключён — 400, уже привязан — 409 | ✓ | готово |
| DELETE | `/api/auth/identities/[provider]` | отвязка способа входа, ответ — оставшиеся способы; не привязан — 404, последний — 409 | ✓ | готово |
| POST | `/api/auth/sign-out` | выход; без сессии тоже 204 | ✓ | готово |
| GET | `/api/me` | текущий пользователь (`email` от провайдера, `contactEmail` — своя почта, если провайдер её не дал, `signInMethods` — привязанные способы входа), его профиль (или `null`), `privateDetails` (дата рождения, пол, запросы — из `profile_private`) и подсказки для онбординга | ✓ | готово |
| DELETE | `/api/me` | удаление аккаунта: тело `{ "username": "…" }` — подтверждение, без совпадения с профилем (пробелы по краям и регистр не важны) 400 с `fields.username`; без профиля подтверждение не нужно (`{}`); фото и документы (из профиля, затем из Storage), пользователь через admin API (профиль — каскадом), cookies сессии; 204 | ✓ | готово |
| POST | `/api/profile` | создание профиля (онбординг) и контактной почты, если она указана: 201; занятый username — 409 с `fields.username`, профиль уже есть — 409, город не из справочника или не из `country` — 400 с `fields.cityId` | ✓ | готово |
| PATCH | `/api/profile` | обновление переданных полей профиля; `contactEmail: ""` удаляет контактную почту; `sectionOrder` — порядок блоков страницы; `birthDate`, `gender`, `concerns` пишутся в `profile_private`; связанные поля передаются группой (`linkedFieldGroups`: `country`, `cityId`, `workFormats`; `priceAmount`, `priceCurrency`; `socialLinks`, `contacts`, `preferredContact`; `clientTypes`, `concerns`, `services`); `faq`, `services`, `highlightedSections`, `cover` — содержимое и оформление страницы, иначе 400; `visibility` и `pagePassword` (4–8 символов, пустой — не менять) — режим скрытой страницы, `password` без заданного пароля — 400 с `fields.pagePassword`; нет профиля — 404, занятый username — 409 | ✓ | готово |
| POST | `/api/profile/avatar` | новое фото: `multipart/form-data` с полем `file` (JPEG, PNG, WebP до 2 МБ и не больше 1024×1024, иначе 400 или 413) или JSON `{ "source": "provider", "provider"?: "telegram" }` — копия фото привязанного способа входа (без `provider` — первого с фото) | ✓ | готово |
| DELETE | `/api/profile/avatar` | удаление фото | ✓ | готово |
| POST | `/api/profile/documents` | документ психолога: `multipart/form-data` с полями `file` (JPEG, PNG, WebP до 2 МБ и 2048×2048), `thumbnail` (превью до 256 КБ и 480×480) и `title` (подпись до 100 символов); 201 с профилем, шестой документ — 409 | ✓ | готово |
| DELETE | `/api/profile/documents/[id]` | удаление документа, ответ — профиль; нет документа — 404 | ✓ | готово |
| GET | `/api/cities?country=&q=` | поиск города в стране по началу названия (регистр, диакритика и апострофы не важны, кириллица транслитерируется): до 10 `City`, крупные первыми; ответ кешируется (`s-maxage` сутки) | — | готово |
| GET | `/api/profiles/[username]` | публичный профиль (регистр не важен), в том числе данные психолога (город — объект `City` из справочника, документы со ссылками), `demo` — демо-профиль из кода; скрытая страница — 403, страница с паролем открывается cookie доступа (ответ `no-store`) | — | готово |
| POST | `/api/profiles/[username]/access` | пароль скрытой страницы `{ password }`: верный — cookie доступа на 30 дней и 204, неверный — 400 с `fields.password`; защиты от перебора нет (мягкий замок) | — | готово |
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
- Скрытые страницы (`visibility` не `public`) RLS не отдаёт ни гостю, ни другим пользователям,
  только владельцу. Режим по адресу (и занятость адреса) — функция `get_profile_visibility`,
  пароль проверяет `unlock_profile_page`, страницу по токену доступа отдаёт
  `get_unlocked_profile`, режим и пароль пишет `set_profile_visibility` (все `security definer`).
  Пароль (открытым текстом, решение пользователя 03.10.2026) и токен лежат
  в `profile_page_access`: пароль читает только владелец, гость его не видит. Тот же пароль при
  сохранении токен не меняет, новый — меняет. Новый код, который
  читает чужие профили (поиск, sitemap), не должен открывать скрытые.
- `anon` читает из `profiles` только колонки публичной страницы (`PUBLIC_PROFILE_COLUMNS`):
  `select *` и `select("id")` от гостя дают `permission denied`. Новую публичную колонку
  добавляй и в `PUBLIC_PROFILE_COLUMNS`, и миграцией в `grant select (…) … to anon`.
  Поэтому данные публичной страницы не выносим в таблицы, связанные с профилем по `id`: гость
  не сможет их присоединить. Списки вроде соцсетей и документов — jsonb-колонки `profiles`.
- Справочник городов `cities` (GeoNames, CC BY 4.0) заполняют миграции, собранные скриптом
  `scripts/generate-cities-migration.mjs`: руками их не правим, обновление — новой миграцией
  (команды в README). Ключ поиска `search_name` строит `toSearchKey` из
  `@/shared/lib/transliterate`: меняя её, пересобери справочник.
  Лицензия требует указать источник: атрибуция стоит в `/terms`, раздел Intellectual property.
- Приватные данные пользователя не кладём в `profiles`: её читают все. Контактная почта лежит
  в `account_contacts`, а данные психолога, которых нет на странице (дата рождения, пол, запросы
  клиентов), — в `profile_private`. В обеих RLS пускает только владельца, а у `anon` прав нет. Это не email
  аккаунта в Supabase Auth: неподтверждённый адрес там связал бы аккаунты по email, и чужая
  почта дала бы доступ к чужому аккаунту.
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
- Палитра (решение пользователя 28.09.2026) лежит в токенах, свои цвета в классах не пишем.
  Главная кнопка (`Button` без `variant`) — `bg-cta text-cta-foreground` (розовый), второстепенная —
  `variant="secondary"` (фиолетовый). Активные элементы (чекбоксы, ползунок, обводка фокуса) —
  `primary` и `ring`: розовый для них не годится, на фоне страницы он даёт 2.4:1. Выбранный
  элемент — `accent`. Ссылку внутри текста красим `text-link`, ссылки навигации и подвала — нет.
  Тип тоста виден по цвету: `toast.success` — `success`, `toast.error` — `error` (их подключает
  `Toaster` через `richColors`), `toast.info` — как обычный тост.
- **Тосты** берём из `@/shared/ui/sonner`, а не из `sonner` (правило Biome): там обычный тост
  держится 4 с, ошибка и предупреждение — 8 с (решение 28.09.2026), а тост с тем же текстом
  заменяет прежний, а не встаёт в стопку. Текст ошибки — «Couldn’t … Please try again.» или
  совет, что сделать; у успеха точки нет («Changes saved»).
- **Ожидание** (шаг 17.9): кнопка с запросом неактивна, в ней `Spinner` и текст с многоточием
  («Saving…», «Deleting…»). Переход к провайдеру показывает «Redirecting…» и сбрасывается на
  `pageshow` с `persisted` (иначе «Назад» достанет из bfcache крутящийся спиннер). Действие из
  меню, которое закрывается сразу (выход), показывает `toast.loading`. Загрузку данных страницы
  закрывают скелетоны, ошибку — `ErrorState`.
- **Тема — только токенами** (решение 18, шаг 17.8). `globals.css` разбит на разделы: палитра
  (примитивы, светлая и тёмная тема), шрифты, типографика, размеры и отступы, радиусы.
  Заголовок страницы — `font-heading text-page-title`, раздела — `font-heading
  text-section-title`, юридического документа — `text-document-*`. Отступ контента страницы —
  `py-page`, ширина — проп `width` у `Container` (`site` по умолчанию, `form`, `document`,
  `sign-in`), карточка личной страницы — `max-w-profile`. Новый токен добавляй в `@theme`
  и на страницу токенов в ките. Имена `--spacing-*` не повторяй в `--container-*`: `max-w-*`
  возьмёт значение из `--spacing-*`. Сырые цвета (`bg-white`, `text-red-500`, hex) допустимы
  только в `globals.css`, в логотипах брендов (`auth-provider-icon.tsx`) и в содержимом картинок
  (фон при сжатии фото, QR-код). Biome классы Tailwind не проверяет, поэтому при ревью ищи их
  поиском по коду.
- Шрифты подключаются только в `src/app/fonts.ts` (его же берёт Storybook). Значения, которым
  CSS-переменные недоступны (`themeColor`, в будущем `manifest.ts`), лежат
  в `shared/config/theme.ts` с пометкой, от какого токена они взяты.
- В `globals.css` два слоя цвета. Примитивы — шкалы `--violet-*`, `--pink-*`, `--neutral-*`,
  `--red-*` (50–950): их не используют ни компоненты, ни `@theme`. Семантические токены
  (`--primary: var(--violet-700)`) ссылаются на примитивы, а `.dark` переопределяет только
  семантику. Новый цвет берём из шкалы. Меняя пару, проверь контраст в обеих темах: текст не
  ниже 4.5:1 (в том числе `muted-foreground` на `muted` и `accent`, `destructive` на своей
  подсветке `/20`), `input`, `primary` и `ring` — не ниже 3:1. Рамки `border` декоративные.
- shadcn/ui на базе **Radix** (композиция через `asChild`): стиль по умолчанию (nova),
  Geist, lucide — пресет `b2fA` (его нейтральную палитру заменили наши токены). Компоненты живут в `src/shared/ui` и
  добавляются командой `npx shadcn add <component>` (алиасы в `components.json`). Файлы shadcn
  правим только при необходимости.
- После `npx shadcn add` или `npx shadcn apply` проверь три вещи. Первое — пересобери lock-файл
  через npm 11 (см. «Процесс работы»). Второе — CLI перезаписывает компоненты: если `npm run lint:fix`
  находит в них ошибки, исправь точечно (так уже сделано в `field.tsx` и `input-group.tsx`).
  Варианты классов CLI пишет на `class-variance-authority`: меняй импорт `cva`
  и `VariantProps` на `@/shared/lib/cva` (тот же API) и удаляй эту зависимость из `package.json`.
  Третье — `apply` умеет дописать шрифты в `src/app/layout.tsx`: переноси их в
  `src/app/fonts.ts`, у Geist должны остаться `subsets: ["latin", "cyrillic"]`.
- Если новый компонент тянет уже установленные (`button`, `input`, `dialog`), CLI спрашивает, перезаписать
  ли их, а без терминала ответить некому. Тогда ставь с `--overwrite` и верни задетые файлы:
  `git checkout -- src/shared/ui/<файл>.tsx` (в них правки форматирования и наши исправления).
- Классы объединяем через `cn` из `@/shared/lib/utils` (файлы shadcn берут его прямо из пакета
  `cn`, как пишет CLI). `cn` убирает конфликтующие классы Tailwind, но наших токенов не знает.
  Поэтому ширину колонки задаёт проп `width` у `Container`, а не класс `max-w-*` в `className`.
  Токен заголовка (`text-page-title`) не смешиваем в одном `cn` с цветом текста
  (`text-muted-foreground`): `cn` примет токен за цвет и выбросит его. Собирать имя класса
  из частей (`max-w-${x}`) нельзя: Tailwind его не увидит.
- Варианты оформления компонента (`variant`, `size`) описываем `cva` из `@/shared/lib/cva`:
  своя замена `class-variance-authority` с тем же API.
- **UI kit в Storybook** (`npm run storybook`, опубликован на `freudin-storybook.vercel.app`:
  отдельный проект Vercel, пересобирается с каждым коммитом в `main`, открывается только под
  аккаунтом Vercel владельца). Истории лежат рядом с компонентом:
  `src/shared/ui/<компонент>.stories.tsx`, заголовки — `Components/…` для shadcn, `Freudin/…` для
  своих, `Foundations/Tokens` — палитра, типографика, ширины и отступы, радиусы
  (`tokens.stories.tsx`). Истории виджетов — в сегменте `ui` виджета (`src/widgets/profile-card/ui/profile-card.stories.tsx`), заголовки
  `Widgets/…` (экраны — так же в `ui` view, `Views/…`), данные — фикстуры в самой истории; виджету с TanStack Query история даёт свой
  `QueryClientProvider`, запросы к API в ките не проходят. **Новый компонент
  в `shared/ui` добавляем вместе с историей**; новый токен цвета — в `tokens.stories.tsx`.
  **Новый визуальный элемент вне `shared/ui`** (в `widgets`, `entities`, `views`: новый вид блока,
  вариант, состояние) предлагаем пользователю показать в ките. Если сейчас не делаем, заносим
  в `docs/PLAN.md` пункт «показать в Storybook» с названием элемента. Тексты
  историй — как на сайте, на английском. Настройки — в `.storybook/`: `preview.tsx` подключает
  `globals.css`, шрифты из `src/app/fonts.ts` и тему через next-themes (тулбар Storybook).
- Тему переключает next-themes (класс `.dark` на `<html>`), переключатель — `ThemeToggle`
  из `@/shared/ui/theme-toggle`.
- Корневой layout уже рендерит skip-link, шапку (`@/widgets/header`), единственный
  `<main id="content">` и подвал (`@/widgets/footer`). На `/settings` шапка и подвал не
  рисуются (проверяют `usePathname()` сами): там редактор на весь экран со своим сайдбаром. View не создаёт свой `<main>`, а контент
  выравнивает по `Container` из `@/shared/ui/container` с отступом `py-page`.
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
  поверхностное), поэтому повторяй в нём нужные поля по умолчанию. Вместе с ним пропадает
  и картинка `opengraph-image.jpg`: в `generateMetadata` бери её из `(await parent).openGraph?.images`.
- `opengraph-image.jpg` нарисована в цветах бренда: логотип `freud.in` и подзаголовок по центру.
  Центр важен: мессенджеры в маленьком превью обрезают картинку до квадрата, X — до 2:1. Меняя
  палитру, логотип или `siteConfig.description`, перерисуй картинку и обнови alt.
- Картинка превью по умолчанию — `src/app/opengraph-image.jpg` (1200×630). Alt лежит
  в `opengraph-image.alt.txt` без перевода строки в конце: Next.js его не обрезает.
- У публичной страницы есть `alternates: { canonical: routes.<страница> }`, и сама она добавлена
  в `publicPages` в `src/app/sitemap.ts`.
- Служебные и приватные страницы не индексируются: в их `metadata` стоит
  `robots: { index: false, follow: true }` (сейчас это `/login`, `/onboarding` и `/settings`).
  В `robots.txt` их не закрываем, иначе поисковик не увидит `noindex`.
- Контент, важный для поиска и превью ссылок, должен попадать в серверный HTML. Личные страницы
  и юридические тексты рендерятся на сервере, остальные данные грузятся на клиенте: новую
  публичную страницу с данными обсуждай с пользователем (этап G в `docs/PLAN.md`).

## Код-стайл

- Biome: `npm run lint` проверяет, `npm run lint:fix` исправляет и форматирует. Ширина строки — 100.
- TypeScript strict, без `any` и `@ts-ignore`.
- Имена файлов и папок — kebab-case, компоненты — PascalCase. Экспорты именованные
  (`export function LoginView`), default-экспорт только там, где его требует Next.js.
- Комментарии пишем, только когда код неочевиден.
- **Вес JS** (шаг 17.6). zod импортируем как `import * as z from "zod"`: `import { z }` тянет
  на каждую страницу все локали (около 60 КБ gzip). В `package.json` стоит
  `"sideEffects": ["*.css"]`: сборщик выбрасывает неиспользуемые реэкспорты из `index.ts`
  слайсов, поэтому модули при импорте ничего не делают, а импорт ради побочного эффекта
  (кроме CSS) не пишем. Тяжёлое и редкое (кроп фото, QR-код) грузим через `next/dynamic`
  по действию пользователя, с заглушкой того же размера. На каждой странице есть `apiClient`,
  поэтому в нём нет zod.

## Команды

| Команда | Что делает |
|---------|------------|
| `npm run dev` | dev-сервер на http://localhost:3000 |
| `npm run build` | прод-сборка |
| `npm run start` | запуск прод-сборки |
| `npm run lint` | Biome: линт, формат, порядок импортов, границы слоёв |
| `npm run lint:fix` | то же с автоисправлением |
| `npm run typecheck` | генерация типов роутов (`next typegen`) и `tsc --noEmit` |
| `npm run storybook` | UI kit на http://localhost:6006 |
| `npm run build-storybook` | статическая сборка кита в `storybook-static/` |
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
  Но `useSearchParams` такой `replaceState` не видит: query, от которого зависит рендер
  (раздел настроек), меняем ссылкой или `router.replace`.
- `notFound()` работает только в серверном коде (сейчас — в `ProfilePage`). Вызывай его до
  первого `Suspense` и без `loading.tsx` в сегменте: после начала стриминга статус останется 200.
  В клиентских view состояние 404 рисуем сами (`NotFoundState` из `@/shared/ui/not-found-state`). Ошибку загрузки данных — `ErrorState`
  из `@/shared/ui/error-state`, ошибку рендера ловит `error.tsx`.
- `error.tsx` и `global-error.tsx` получают `retry()` (перезапросить и перерисовать сегмент),
  а не только `reset()`: повтор делаем через `retry`.
- `next lint` удалён, линтим через Biome.
