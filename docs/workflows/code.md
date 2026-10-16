# Код: FSD, роуты и Next.js

Читай перед изменением любого кода, включая конфигурацию и тесты.
Это обязательные правила из [`AGENTS.md`](../../AGENTS.md); процесс — в [`process.md`](process.md).

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

Перед созданием нового модуля найди сценарий в [карте поиска](../code-map.md#где-искать-изменение)
и открой карточку [каталога](../code-map.md#каталог-слайсов).
Состав экспортов проверяй в её `index.ts`, `index.server.ts` или `@x`; ссылки на внутренние
файлы даны для чтения реализации и не разрешают обход public API при импорте.

## Роуты

Таблицы страниц, служебных файлов и API — в `README.md`, раздел
[«Роуты»](../../README.md#роуты).

- Пути в коде строим только через `routes` (страницы) и `apiRoutes` (API) из `@/shared/config`.
- `/<username>` — динамический роут верхнего уровня. Статические роуты имеют приоритет, поэтому
  занятые ими адреса нельзя отдавать пользователям. Список лежит в
  `src/shared/config/reserved-usernames.ts`: первые сегменты путей из `routes` попадают туда
  автоматически, поэтому **каждую новую страницу добавляй в `routes`**. Прочие служебные слова
  дописывай в `reservedWords` вручную.

## Код-стайл

- Biome: `npm run lint` проверяет, `npm run lint:fix` исправляет и форматирует. Ширина строки — 100.
- TypeScript strict, без `any` и `@ts-ignore`.
- Имена файлов и папок — kebab-case, компоненты — PascalCase. Экспорты именованные
  (`export function LoginView`), default-экспорт только там, где его требует Next.js.
- Комментарии пишем, только когда код неочевиден.
- Тесты лежат рядом с модулем: `<модуль>.test.ts`, импорт из `vitest` явный (`describe`, `it`,
  `expect`), названия тестов — по-русски. Конфиг — `vitest.config.mts`: окружение `node`, алиас `@/`
  из `tsconfig`, `server-only` подменён пустым модулем, поэтому серверные функции без обращений
  к Supabase и `cookies()` тестируются напрямую.
- **Вес JS.** zod импортируем как `import * as z from "zod"`: `import { z }` тянет
  на каждую страницу все локали (около 60 КБ gzip). В `package.json` стоит
  `"sideEffects": ["*.css"]`: сборщик выбрасывает неиспользуемые реэкспорты из `index.ts`
  слайсов, поэтому модули при импорте ничего не делают, а импорт ради побочного эффекта
  (кроме CSS) не пишем. Тяжёлое и редкое (кроп фото, QR-код) грузим через `next/dynamic`
  по действию пользователя, с заглушкой того же размера. На каждой странице есть `apiClient`,
  поэтому в нём нет zod.

## Next.js 16: на что обратить внимание

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
