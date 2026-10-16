<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Freudin: правила проекта

Freudin — сайт для психологов и их будущих клиентов. Психолог входит через Google или Telegram
и делает страницу-визитку `/<username>`, клиент открывает её без регистрации. Freudin не
проверяет психологов, не участвует в общении с клиентами и не принимает оплату.

## Как работать с инструкциями

1. Перед любой задачей прочитай [`process.md`](docs/workflows/process.md): проверки, тесты,
   Git, языки и персональные данные. Начни с `git status --short`, сохрани чужие правки.
2. Перед изменением кода прочитай [`code.md`](docs/workflows/code.md), затем все workflows,
   подходящие по таблице ниже. Ссылки — обязательное чтение при указанном условии, даже если
   среда не загружает эти файлы автоматически. Для анализа читай только относящиеся к нему разделы.
3. Выполняй поставленную задачу в согласованных границах. Анализ и план без запроса на правки
   остаются без изменений файлов; реализацию доводи до проверок и отчёта по `process.md`.

## Что читать по задаче

| Задача | Обязательные документы |
|---|---|
| Любая задача | [`workflows/process.md`](docs/workflows/process.md) |
| Любое изменение кода, конфигурации или тестов | [`workflows/code.md`](docs/workflows/code.md): FSD, импорты, роуты, код-стайл, особенности Next.js |
| API, загрузка данных, серверные модули, авторизация, состояние | [`workflows/api.md`](docs/workflows/api.md) |
| Схема, запросы к БД, RLS, приватность данных, файлы, миграции | [`workflows/database.md`](docs/workflows/database.md) |
| Интерфейс, формы, тема, токены | [`workflows/ui.md`](docs/workflows/ui.md) и [`SEO`](docs/workflows/seo-checklist.md) |
| Компонент shadcn, история, новый визуальный элемент или токен | Также [`workflows/ui-kit.md`](docs/workflows/ui-kit.md) |
| Шаг плана | Строка в [`PLAN.md`](docs/PLAN.md), карточка по её ссылке в `docs/plan/stage-*.md` и [`workflows/plan-step.md`](docs/workflows/plan-step.md) |
| Закрытие шага плана с UI | Также [`workflows/qa-subagent.md`](docs/workflows/qa-subagent.md) |
| Отчёт о положении дел по плану | [`workflows/plan-report.md`](docs/workflows/plan-report.md) |
| Поиск существующего модуля или места изменения | [Карта сценариев](docs/code-map.md#где-искать-изменение) и нужная карточка [каталога](docs/code-map.md#каталог-слайсов) |
| Изменение связей системы | Нужный уровень [`архитектуры`](docs/architecture/): [контекст](docs/architecture/1.context.md), [контейнеры](docs/architecture/2.containers.md), [компоненты](docs/architecture/3.components.md); для внутреннего устройства — [Code](docs/architecture/4.code.md), для сценариев — [динамические представления](docs/architecture/dynamic.md) |
| Тексты страниц, маркетинг, дизайн, развитие | [`PRODUCT.md`](docs/PRODUCT.md) |
| Причина правила или пересмотр решения | Нужная запись [`DECISIONS.md`](docs/DECISIONS.md) |
| Запуск, скрипты, env, роуты, внешние сервисы, деплой | Нужный раздел [`README.md`](README.md) |
| Настройка или обслуживание сервиса | Нужная инструкция [`operations/`](docs/operations/): [Supabase](docs/operations/supabase.md), [вход и домен](docs/operations/authentication.md), [почта](docs/operations/support-email.md) |
| Контекст завершённого шага | Нужная запись [`plan/HISTORY.md`](docs/plan/HISTORY.md); целиком по умолчанию не читать |

У задачи может быть несколько условий: например, загрузка фото требует правил кода, API,
БД и UI. Для изменения Next.js дополнительно читай документацию установленной версии
из управляемого блока в начале файла.

## Основные ограничения

- Локальный сайт работает с боевой базой Supabase; `main` сразу выкладывается в прод,
  превью-деплои не используем.
  Миграции применяет пользователь. Порядок бэкапа, миграций и генерации типов — в
  [`database.md`](docs/workflows/database.md), правила Git — в `process.md`.
- Клиент ходит только в собственные API через `apiClient` и TanStack Query. Supabase и секреты —
  только на сервере; данные пользователя защищаются API и RLS. Скрытые профили не раскрываем
  в поиске, sitemap и новых запросах. Детальные правила — `api.md` и `database.md`.
- UI преимущественно клиентский. Согласованные исключения: серверный рендер `/<username>`
  с `generateMetadata`, серверные `/privacy` и `/terms`, обязательные файлы Next.js.
  Новые исключения, Server Actions и `proxy.ts` — только по согласованию; детали — `api.md`.
- Серверные данные — TanStack Query; Zustand — только UI и черновики. Серверные функции сущностей
  работают с данными, Route Handlers — с HTTP. Импорты и границы — `code.md` и `api.md`.
- Дизайн минималистичный, стандартные компоненты shadcn, стили через токены темы.
  Декор, иллюстрации и дополнительные пояснения без запроса не добавляем. Детали — `ui.md`.

## Стек

Next.js 16 (App Router, React Compiler), React 19, TypeScript 5 strict; Tailwind CSS 4,
shadcn/ui на Radix, lucide-react, next-themes, sonner; TanStack Query 5 и Form, Zustand 5,
zod 4; Route Handlers, Supabase; Storybook 10 и Vitest 4 только для разработки; Biome; Vercel.
Версии зависимостей — `package.json`, полный состав и команды — [`README.md`](README.md#стек).

Стек не заменяем аналогами (react-hook-form, Redux, SWR, axios, ESLint, Prettier).
Новую зависимость добавляй, только если задачу нельзя решить существующим стеком,
и упомяни её в README. Установка — npm 11+, см. правило 6 `process.md`.

## Назначение документов

- Этот файл и `docs/workflows/` — действующие правила: здесь общие ограничения и навигация,
  в workflows — подробные требования и процедуры.
- `docs/architecture/` — статические уровни C4 и отдельные динамические представления;
  `docs/code-map.md` — поиск по сценариям, слайсам, public API и файлам вне уровней C4.
- `README.md` — текущее состояние и эксплуатация; без планов, дат, журнала правок и решений.
  `docs/operations/` — подробные инструкции настройки и обслуживания сервисов.
- `docs/PLAN.md` — индекс незавершённых задач и очередь; `docs/plan/stage-*.md` — карточки этапов;
  `docs/plan/HISTORY.md` — завершённые пункты и исторические результаты проверок.
- `docs/DECISIONS.md` — причины и история принятых решений; `docs/PRODUCT.md` — продуктовые
  границы и согласованное направление с отдельным срезом готовности, предложениями и вопросами.
  `docs/legal/*.draft.md` — архивные исходники, действующие юридические тексты — в коде views.
  Запись в плане не означает готовность функции; предложение ИИ не становится решением владельца.

Когда какой документ обновлять — [таблица в process.md](docs/workflows/process.md#когда-обновлять-документацию).

При расхождении описания с кодом проверь связанные модули и сообщи о расхождении.
История не отменяет действующие правила; новое продуктовое решение не принимай вместо владельца.
