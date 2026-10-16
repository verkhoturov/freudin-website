# Working on a plan step

Extra rules for a task given within `docs/PLAN.md` («take step 22 from `docs/PLAN.md`»). The
other rules — 4–14 in [`process.md`](process.md) — apply to every task, plan steps included.
[`docs/PLAN.md`](../PLAN.md) is an index; detailed cards and checkboxes live in
`docs/plan/stage-*.md`, linked from the index.

1. Find the step in the `docs/PLAN.md` index, open its card in the stage file and read the
   stage context, the conditions and the related tasks. Read the block up to the next step
   heading, not the whole stage file. Sub-steps and «Готово, когда» in the card define the
   scope. Entry points are search hints, not a closed list of files you may change.
2. **After each iteration, check the affected document facts against the code** and update
   them per the [table in process.md](process.md#documents-and-when-to-update-them). It also
   applies to tasks outside the plan. If README facts did not change, it needs no edit; keep
   detailed service setup in `docs/operations/`.
3. Update the card and the short status in the index. Mark completed items `[x]` in the card
   and move them with their check results to the stage's history file
   `docs/plan/history/stage-<stage>.md` ([index](../plan/history/README.md)), keeping the
   numbers. Move a fully completed step entirely and remove its row from the active index. In a
   partly completed step, keep the open items and a link to the history; the index row stays
   with the current status.

## History

- History is split by stage: `docs/plan/history/stage-<stage>.md`, plus `planning-context.md`
  for the original planning context. Read only the needed step, never a whole file by default:
  `grep -n 'id="step-49"\|^## Шаг 49\.' docs/plan/history/*.md`, then read from that line to the
  next `## ` heading.
- A completed item goes to its own stage's file under a `## Шаг N. …` heading; keep the
  step's `<a id="step-N"></a>` anchor. The first completed item of a stage without a history
  file creates the file (title, navigation line as in the other files) and a row in the
  history index.
- Links to history: `history/stage-<stage>.md#step-<number>` from a stage card.

## Keeping the index and cards

- A new step takes the next free number after the maximum in the index, the cards and the
  history; never reuse numbers. Keep the stage order and the agreed queue.
- `PLAN.md` has one row per step: number, title, card link and a short status or condition.
  Do not copy checkboxes, scenarios or criteria into the index. The unnumbered tasks of stages
  G and H keep their names and labels; do not introduce numbers retroactively.
- A card holds the problem or scenario, the required result, links to other tasks, existing
  code entry points, actions with their owner and a verifiable «Готово, когда». If a link or a
  technical solution is not yet known, record a research question; do not invent a dependency.
  Keep existing wording and criteria when moving items. Plan files are written in Russian.
- Sub-steps go no deeper than two levels (`18.3`, `H.2`). The number reflects the order of
  addition, the place in the plan reflects the topic. Add new tasks to the matching stage file.
- Links to active cards — `stage-<stage>.md#step-<number>`; dots become hyphens (`18.9` →
  `step-18-9`, `H.2` → `step-h-2`). A sub-step gets its anchor in its item. Keep the anchor
  and the number when renaming; when moving, update incoming links.
- The old heading anchors in `PLAN.md` lead to the index rows. When closing a step, keep a
  history link for its anchors so old links keep working.
- Record a check result together with the completed item in the history: date, what was
  checked, environment and limitations. Do not close failed checks. UI steps go through the
  QA cycle.
- General working rules stay in the workflows. Read the summaries in `plan/context.md` and the
  sources in `plan/review-sources.md` when needed, and update them when related facts change.

A new card, in the format of the stage files:

<example>
<a id="step-101"></a>

#### Шаг 101. Подсказка формата ссылки на Telegram

**Точки входа:** [`src/entities/social-link/model/normalize.ts`](../../src/entities/social-link/model/normalize.ts).

**Связи:** нормализация ссылок из шага 11 (история этапа D).

Психолог вводит `t.me/name` с пробелом и получает ошибку без объяснения. Источник: ревью 16 октября.
- [ ] <a id="step-101-1"></a>**101.1. 🤖 ИИ:** убрать пробелы по краям до проверки и показать пример
      допустимого формата в тексте ошибки.
- [ ] <a id="step-101-2"></a>**101.2. 🧑‍💻 Разработчик:** проверить текст ошибки на телефоне.

**Готово, когда:** `t.me/name ` с пробелом сохраняется, а неверный адрес показывает пример формата.
</example>
