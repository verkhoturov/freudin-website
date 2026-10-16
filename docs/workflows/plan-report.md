# Plan report

The answer format when the user asks for the status of `docs/PLAN.md` (rule 12 of
[`process.md`](process.md)). The report is tables in chat, in Russian.

## Sources and verification depth

- By default, take statuses from the `docs/PLAN.md` index and the open items of the stage
  cards `docs/plan/stage-*.md`. Check against the code only the 🟡 steps (partly done): their
  open items are the likeliest to be done already or out of date. Read a card block, not the
  whole stage file.
- Check every open item against the code only when the user asks for a full check.
- For the status of completed steps and sub-steps, use the
  [history](../plan/history/README.md), reading only the needed entries.
- Under the tables, state in one line what was checked against the code and what was taken
  from the plan without checking.

## Format

- Statuses: ✅ done, 🟡 in progress, ⬜ ahead, 💤 after MVP (by agreement). Start the report
  with a line explaining them.
- A stage stands out visually (decision 22 in [`docs/DECISIONS.md`](../DECISIONS.md)): a `###`
  heading with the status, letter and name (`### 🟡 D. Профиль`), a line below it — what is
  expected and from whom, then the table of the stage's steps. Text size cannot change inside a
  Markdown table, so a stage is not a table row. A stage with all steps done is a heading and a
  line saying what was done, without a table.
- Table columns: «Шаг», «Что», «Статус», «Кто что делает». Stages and steps go in plan order.
- Sub-steps are separate rows, numbered no deeper than two levels (`18`, `18.1`). List several
  actions within a sub-step in «Кто что делает». Collapse the completed sub-steps of an
  unfinished step into one row (`9.1–9.14, 9.16 ✅`).
- Owners — 🤖 ИИ and 🧑‍💻 Разработчик, together «🤖 и 🧑‍💻». The same labels start plan items
  (described at the start of section 5 of `docs/PLAN.md`).
- In a 🟡 row, parent steps included, write what exactly is expected and from whom, with
  sub-step numbers.
- Do not create steps like «fix what was found»: fixes become separate steps with concrete
  scenarios.

<example>
Статусы: ✅ готово · 🟡 в процессе · ⬜ впереди · 💤 после MVP

### 🟡 M. Ревью 12 октября UX

Ждём от 🧑‍💻 приёмку 59.3; от 🤖 — шаг 56.

| Шаг | Что | Статус | Кто что делает |
|---|---|---|---|
| 56 | Черновики настроек | ⬜ | 🤖 56.1–56.2 |
| 59 | Оформление раньше содержания | 🟡 | 59.1–59.2 ✅; 🧑‍💻 59.3 — проверить на телефоне |

С кодом сверены 🟡-шаги 59; остальные статусы взяты из индекса плана.
</example>
