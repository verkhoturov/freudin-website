# История: этап F. Запуск

[Индекс истории](README.md) · [Индекс плана](../../PLAN.md) · [Карточки этапа](../stage-f.md)

<a id="step-18"></a>

## Шаг 18. Прод
- [x] **18.1.** Vercel: домен `www.freud.in` подключён, `freud.in` редиректит на него. Переменные
      окружения Production задаются раньше, на шаге 5.
- [x] **18.2.** ~~Прод-URL во всех провайдерах и в Supabase~~ — закрыт 28.09.2026 как дубль: Google
      в In production и Telegram с прод-доменом готовы (шаги 8.1 и 10), перевод Facebook в Live —
      шаг 9.21.
- [x] **18.4.** (аудит) **🧑‍💻 Разработчик:** Vercel → Settings → Functions → регион `fra1`. Сейчас
      функции работают в `iad1` (Вашингтон), а база во Франкфурте: каждый запрос к базе пересекает
      Атлантику (порядка 90 мс). Переключено на `fra1` 26.09.2026.
- [x] **18.8.** ~~Защита ветки `main`~~ — перенесено в шаг 18.9 (28.09.2026): обязательный CI
      рассчитан на мерж из другой ветки, поэтому защита нужна вместе с работой в `dev`.
- (аудит) Отдельный проект Supabase для разработки и превью-деплои Vercel на нём — вынесено
  в шаг 18.9.

<a id="step-24"></a>

## Шаг 24. Юнит-тесты критичной логики
Запрос пользователя 28.09.2026 (правило 4 `docs/workflows/process.md`: тесты пишем только по прямому запросу). E2e и
тесты интерфейса — по-прежнему только по отдельному запросу.

- [x] **24.1. 🤖 ИИ:** предложить фреймворк и список логики. Фреймворк — Vitest: для него есть
      руководство в документации Next.js 16
      (`node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`). Кандидаты:
      `getSafeRedirectPath` (open redirect), проверка same-origin в `withErrorHandling` (CSRF),
      проверка `state` входа Google и Telegram, правила username и зарезервированные адреса,
      `normalizeSocialLinkUrl`, zod-схемы профиля (с полями шага 20), `getProfileChanges`,
      `isAccountDeletionConfirmed`, `detectAvatarImage` и лимиты размеров, `transliterate` и
      `getProfileSuggestions`, `getOAuthErrorCode`.

      Сделано 04.10.2026: Vitest в окружении node, только чистая логика (без jsdom и React Testing
      Library). К списку добавлены `normalizeSectionOrder`, `toPreviewProfile` (нет закрытых данных),
      `profileUpdateSchema`, `toFieldErrors` и `toFormFieldName`; `detectAvatarImage` теперь
      `detectImage`. Проверку `state` входа не покрываем: это сравнение в роуте, тесту пришлось бы
      подменять `cookies()` из Next.
- [x] **24.2. 🧑‍💻 Разработчик решает:** утвердить фреймворк и список. Утверждено пользователем
      04.10.2026 без правок.
- [x] **24.3. 🤖 ИИ:** установить через npm 11, конфиг, скрипт `npm test`, тесты. README: стек,
      команды, покрытая логика. AGENTS.md: `npm test` в проверках, правило 4 — тесты этой логики
      поддерживаем при её изменении.

      Сделано 04.10.2026: `vitest` 4.1 (Vitest 5 требует `@types/node` 22+, а в проекте 20),
      `vitest.config.mts` (алиас `@/` штатной опцией Vite 8, `server-only` — пустой модуль),
      `npm test` = `vitest run`, 14 файлов `*.test.ts` рядом с модулями, 134 теста. Тесты ловят
      поломки: временно сломанные `getSafeRedirectPath`, `assertSameOrigin` и группы полей
      в `getProfileChanges` дали 5 упавших тестов. README — раздел «Тесты», AGENTS.md — правила 4
      и 5, стек, команды, код-стайл.
**Готово, когда:** `npm test` проходит локально и в CI, а список покрытой логики записан в README.
