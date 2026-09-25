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
5. Перед коммитом должны проходить `npm run lint`, `npm run typecheck` и `npm run build`.
6. Зависимости ставь через **npm 11+** (`npx npm@11 install …`, если локально npm 10):
   `package-lock.json` создан npm 11, а npm 10 переписывает его лишними изменениями.
7. Документация, комментарии в коде и тексты интерфейса пишем на русском.

## Стек

| Задача | Выбор |
|--------|-------|
| Фреймворк | Next.js 16 (App Router, React Compiler включён), React 19, TypeScript 5 (strict) |
| Стили и UI | Tailwind CSS 4, shadcn/ui, lucide-react |
| Запросы к API, серверное состояние | TanStack Query 5 |
| Клиентское состояние | Zustand 5 |
| Формы и валидация | TanStack Form + zod 4 |
| Backend | Route Handlers в `src/app/api` |
| БД, авторизация, файлы | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Линтер и форматтер | Biome |
| Хостинг | Vercel |

Библиотеки ставим на тех шагах `docs/PLAN.md`, где они нужны: что уже установлено, видно
в `package.json`. Не заменяй элементы стека аналогами (react-hook-form, Redux, SWR, axios,
ESLint, Prettier и т. п.). Новую зависимость добавляй, только если задачу нельзя решить стеком,
и упомяни её в `README.md`.

## Клиент и сервер

- **Server Components избегаем.** Серверными остаются только файлы, без которых Next.js не
  работает: корневой `src/app/layout.tsx` (html/body, шрифты, metadata, провайдеры) и тонкие
  файлы роутинга `page.tsx` и `not-found.tsx`. В них нет хуков, загрузки данных и логики:
  только реэкспорт view и статического `metadata`.
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
- Формат ошибки API: `{ "error": { "code": string, "message": string, "fields"?: Record<string, string> } }`
  плюс корректный HTTP-статус.

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
  через index: `@/shared/config`, `@/shared/api`, `@/shared/api/index.server`.
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

## Роуты

Пути в коде строим только через `routes` из `@/shared/config`.

### Страницы

| Путь | Файл роутинга | View | Доступ | Статус |
|------|---------------|------|--------|--------|
| `/` | `src/app/page.tsx` | `home` | все | заглушка |
| `/login` | `src/app/login/page.tsx` | `login` | гости; авторизованных редиректим | заглушка |
| `/onboarding` | `src/app/onboarding/page.tsx` | `onboarding` | авторизованные без профиля | заглушка |
| `/settings` | `src/app/settings/page.tsx` | `settings` | авторизованные с профилем | заглушка |
| `/privacy` | `src/app/privacy/page.tsx` | `privacy` | все | заглушка |
| `/terms` | `src/app/terms/page.tsx` | `terms` | все | заглушка |
| `/<username>` | `src/app/[username]/page.tsx` | `profile` | все | заглушка |
| 404 | `src/app/not-found.tsx` | `not-found` | все | заглушка |

`/<username>` — динамический роут верхнего уровня. Статические роуты имеют приоритет,
поэтому сегмент каждого нового верхнеуровневого роута добавляй в список зарезервированных
username (появится в `shared/config` на шаге 11 плана). Иначе пользователь займёт такое имя,
а его страница окажется недоступна.

### API

Все API-роуты пока в плане. Когда роут появляется, меняй его статус.

| Метод | Путь | Назначение | Сессия | Статус |
|-------|------|------------|:------:|--------|
| GET | `/api/health` | проверка связки клиент → API | — | план |
| GET | `/api/auth/sign-in?provider=&next=` | старт OAuth и редирект к провайдеру | — | план |
| GET | `/api/auth/callback?code=&next=` | обмен кода на сессию и редирект | — | план |
| POST | `/api/auth/sign-out` | выход | ✓ | план |
| GET | `/api/me` | текущий пользователь, его профиль (или `null`) и подсказки для онбординга | ✓ | план |
| DELETE | `/api/me` | удаление аккаунта и всех данных | ✓ | план |
| POST | `/api/profile` | создание профиля (онбординг) | ✓ | план |
| PATCH | `/api/profile` | обновление профиля | ✓ | план |
| POST | `/api/profile/avatar` | загрузка фото или копирование фото провайдера | ✓ | план |
| DELETE | `/api/profile/avatar` | удаление фото | ✓ | план |
| GET | `/api/profiles/[username]` | публичный профиль | — | план |
| GET | `/api/usernames/[username]` | проверка, свободен ли username | — | план |

## Состояние и данные

- Всё, что пришло из `/api`, — серверное состояние, и живёт оно только в TanStack Query.
  Фабрики ключей запросов лежат в сегменте `api` сущности. Мутации инвалидируют или обновляют
  связанные запросы.
- Zustand хранит только клиентское состояние: UI и черновики форм. Серверные данные в стор
  не копируем. Стор лежит в сегменте `model` слайса.
- Локальное состояние компонента — `useState`.
- Из браузера ходим только через `apiClient` из `@/shared/api` (появится на шаге 3), без прямого
  `fetch` в компонентах.

## Формы

- TanStack Form + zod + компоненты shadcn `Field`. react-hook-form не используем: он конфликтует
  с React Compiler.
- Одна zod-схема обслуживает и форму, и API-роут. Она лежит в `model` сущности.

## Стили и UI

- Tailwind CSS 4. Токены темы — CSS-переменные в `src/app/globals.css`.
- Компоненты shadcn/ui живут в `src/shared/ui`, добавляются командой `npx shadcn add <component>`
  (алиасы в `components.json` появятся на шаге 4). Файлы shadcn правим только при необходимости.
- Иконки интерфейса — lucide-react, логотипы брендов — отдельные SVG.
- Вёрстка mobile-first, светлая и тёмная темы, доступность (семантика, aria, фокус).
- `PagePlaceholder` из `@/shared/ui/page-placeholder` — временная заглушка страниц. Удаляем её,
  когда все страницы будут реализованы.

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

## Next.js 16: на что обратить внимание

- Документация установленной версии лежит в `node_modules/next/dist/docs/` (см. блок в начале файла).
- `middleware.ts` переименован в `proxy.ts`; мы его не используем.
- Глобальные типы `PageProps`, `LayoutProps` и `RouteContext` генерирует `next typegen`.
- `metadata` можно экспортировать только из серверных модулей.
- В клиентских компонентах параметры роута читаем через `useParams()`, query — через
  `useSearchParams()`.
- `next lint` удалён, линтим через Biome.
