# Клиент, сервер и API

Читай при изменении загрузки данных, серверных модулей, API, авторизации или состояния.
Это обязательные правила из [`AGENTS.md`](../../AGENTS.md); процесс — в [`process.md`](process.md).

## Клиент и сервер

Как это устроено — [контейнеры](../architecture/2.containers.md) и
[потоки данных](../architecture/dynamic.md).

- **Server Components избегаем.** Серверными остаются только файлы, без которых Next.js не
  работает: корневой `src/app/layout.tsx` (html/body, шрифты, metadata, провайдеры) и тонкие
  файлы роутинга `page.tsx` и `not-found.tsx`. В них нет хуков, загрузки данных и логики:
  только реэкспорт view и статического `metadata`. Границы ошибок клиентские: `error.tsx`
  (`"use client"` и реэкспорт view `error`) и `global-error.tsx` — он заменяет упавший корневой
  layout, поэтому сам рисует html и body, подключает `globals.css`, шрифты и тему (без шапки
  и данных). Кроме них в `src/app` лежат статические metadata-файлы без загрузки данных
  (`robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.jpg`, иконки), тема `globals.css`
  и модуль шрифтов `fonts.ts`.
- **Исключения — серверный рендер (решение 23).** Личная страница `/<username>` загружает
  профиль на сервере: `ProfilePage` и `generateMetadata` из `@/views/profile/index.server`
  (`ui/profile-page.server.tsx`) читают его серверной функцией сущности через
  `createSupabasePublicClient()` и передают клиентской `ProfileView`. Юридические страницы
  `/privacy` и `/terms` (view и виджет `legal-document`) — серверные компоненты без
  `"use client"`. Новые исключения — только по согласованию.
- В остальном интерфейс состоит из клиентских компонентов. `"use client"` обязателен в UI-файлах
  слайсов `views` (это граница клиентского дерева) и в модулях, которые импортирует `src/app`
  (например, провайдеры).
- **HTTP-входные точки серверной логики — Route Handlers `src/app/api/**/route.ts`**
  (кроме серверного рендера выше). Работа с данными — в серверных функциях сущностей.
  Клиент получает данные только через эти роуты: `apiClient` и TanStack Query.
- Не используем Server Actions, загрузку данных в серверных компонентах, `proxy.ts`
  (в Next.js 16 так называется бывший `middleware.ts`) и `generateMetadata`, кроме исключений выше. Новые — только
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
- Каждый роут оборачиваем в `withErrorHandling`: он же отклоняет изменяющий запрос с чужого
  сайта (защита от CSRF). Роуты без обёртки не пишем.
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
- Подключённые провайдеры входа перечислены в `enabledAuthProviders`
  (`entities/viewer/config/auth-providers.ts`): только их кнопки видны на `/login`, остальные
  `/api/auth/sign-in` отправляет на `auth_unavailable`. Включая провайдер в интерфейсе,
  добавь его туда после настройки входа.
- Google и Telegram входят и привязываются без OAuth Supabase (решение 27): `GOOGLE_*`
  и `TELEGRAM_*` обязательны, общий код — `oidc-sign-in.server.ts`, поток —
  в [динамическом представлении](../architecture/dynamic.md#вход-через-google-и-telegram).
  Привязанные способы входа читает `getLinkedIdentities` через `auth.getUser()`: идентичностей
  нет в JWT.
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
