# История: этап P. lighthouse 12 октября

[Индекс истории](README.md) · [Индекс плана](../../PLAN.md) · [Карточки этапа](../stage-p.md)

<a id="step-79"></a>

## Шаг 79. Доступные имена оформления и последовательные заголовки
В отчёте Lighthouse от 12.10.2026 Accessibility настроек — 94: провалены имена шести
переключателей Theme и трёх Cover, после `h1` идёт `h3` Appearance. В проверке Codex Astra
имена не дали повторного сбоя, поэтому сначала сверяем сборку, браузер и метод проверки.
Пропуск заголовка остаётся; Accessibility личной страницы из исходного отчёта — 100.

- [x] **79.2. 🤖 ИИ:** привести заголовки Appearance и блоков `SortableBlocks`
      к последовательности `h1 → h2`, сохранив внешний вид, идентификаторы и связи
      `aria-labelledby`. Проверить Public profile, Account, Search details и превью.
      Выполнено 15.10.2026: Appearance, SortableBlocks и Sign-in methods используют h2,
      идентификаторы и классы сохранены. Проверено в Chromium/Storybook: разделы формы
      Public profile, Account, Search details; ProfileCard в превью не добавляет h1.
**Готово, когда:** `button-name` и `heading-order` проходят в настройках,
Accessibility обеих страниц — 100; названия и выбранное состояние доступны скринридеру.
