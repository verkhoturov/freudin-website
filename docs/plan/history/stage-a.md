# История: этап A. Подготовка (начинаем сразу, внешние сервисы не нужны)

[Индекс истории](README.md) · [Индекс плана](../../PLAN.md)

**Параллельно с шагами 1–4 ты можешь** завести аккаунты и приложения, которые понадобятся позже.
Верификация у Google и Meta может занять несколько дней, поэтому лучше начать заранее:
проект Supabase (шаг 5), проект в Google Cloud, приложение в Meta for Developers, бота
в Telegram, проект в Vercel, подключённый к репозиторию. ✅ Vercel подключён: `main` выкладывается
на `www.freud.in` (решение 12).

## Шаг 1. Правила проекта: AGENTS.md и README.md
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

## Шаг 2. Каркас FSD и очистка шаблона
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

## Шаг 3. Клиентская инфраструктура и каркас API
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

## Шаг 4. Дизайн-система и каркас вёрстки
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
