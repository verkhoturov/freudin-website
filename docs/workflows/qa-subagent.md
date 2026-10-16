# QA agent: checking the interface

How to close a plan step that changes the UI (rule 14 in [`process.md`](process.md), decision
26 in [`docs/DECISIONS.md`](../DECISIONS.md)).

The opencode QA agent checks the running interface against criteria. Its config is
`~/.config/opencode/agents/qa.md`: the agent works through `agent-browser`, does not change code
and does not start servers.

## Plan step cycle with QA

After finishing a 🤖 step or sub-step from a stage card (linked from `docs/PLAN.md`) that
changes the behaviour or look of the UI, do not mark it right away. Go through the cycle:

1. The checks of rule 5 in [`process.md`](process.md) (`npm run check`) passed.
2. **Brief.** Criteria come from the step card: scenario, «Готово, когда», screen sizes. Each
   criterion is a verifiable action and an expected result, with a selector and a number where
   they exist («width of `textarea[name=bio]` ≥ 360 px», not «column ~448 px»).
3. **Run** the QA agent (commands below) and review the report. Look at the screenshots
   yourself. Check each FAIL against the code: a false FAIL (an imprecise brief, the agent
   measured the wrong element) is fixed in the brief, not in the code.
4. **FAIL or PARTIAL caused by the code** — fix it, rerun the checks of item 1 and run QA
   again with a new session name. After three runs with FAIL, stop and describe to the user
   what does not add up.
5. **PASS** — mark the step `[x]` and add a summary line under it: «QA <date>: PASS — what was
   checked and at which sizes (Storybook or `/settings`)». The report lives in `tmp/`, which is
   not in git, so the plan gets the gist.
6. **Needs a human check** — what QA cannot check: sign-in through providers, third-party
   services and production, real devices (iOS Safari, Android), judging taste and copy, items
   the agent marked BLOCKED not because of the code. Mark what QA checked as in item 5, and for
   the rest create a sub-step `N.x 🧑‍💻 Разработчик: проверить …` — what exactly and why QA could
   not. If nothing is left, do not create a «check live» 🧑‍💻 sub-step.
7. **QA did not run** (both models at their limit, servers not responding) — do not mark the
   step; add «Ожидает QA: <reason>» under it and tell the user.

The agent marks a step `[x]` when QA finally returned PASS without errors and no live check is
needed (item 6) — including a 🧑‍💻 «проверить …» step fully covered by QA. The developer marks
the other 🧑‍💻 steps (decisions, third-party services, migrations, git). Steps without UI
(documentation, migrations, server logic without UI) skip QA: checks follow the task type in
`process.md`; code requires the commands of rule 5.

## How to run

- **Before running**, check that the servers respond: `curl -s -o /dev/null -w '%{http_code}'
  http://localhost:3000` (and `:6006` for Storybook). If not, ask the user to start them.
- **The brief** goes to `tmp/qa-<step>/brief.md` (`tmp/` is in `.gitignore`). It contains the
  URL, criteria labelled A, B, …, screen sizes, the browser session name `qa-<step>-<n>` (new on
  every run), the artifacts folder `tmp/qa-<step>/` and the restrictions. Save on
  `localhost:3000` is allowed, but the local site works with the **production** database: the
  agent changes the user's real profile. **Always forbid account deletion in the brief.**
- **Sign-in.** The agent uses the user's session from `tmp/qa-auth.json` (cookies and storage,
  `tmp/` is in `.gitignore`). The file is created once from the user's Chrome, already signed in
  on `localhost:3000`: `agent-browser --auto-connect state save tmp/qa-auth.json`. Write in the
  brief: «Первой командой открой страницу с `--state tmp/qa-auth.json`». The agent works in its
  own browser but under the user's account. If `/settings` shows Sign in with this file, the
  session expired: ask the user to sign in in Chrome and save the file again. The file grants
  access to the account: do not copy it out of `tmp/` or show its contents. Supabase rotates the
  refresh token on refresh, so after a long agent run the user's Chrome session may end — then
  they need to sign in again.
- **Scenario with Save** (the check needs saved data, such as the checklist on the profile
  page). Before the run, save a snapshot `curl -s localhost:3000/api/profiles/<username>` to
  `tmp/qa-<step>/profile-before.json`; after it, compare with the current profile. If they
  differ (the agent hit its step limit and did not restore the state), restore the profile
  yourself through `agent-browser` and compare again. Keep saves in the brief to a minimum and
  restoration a separate step. `openai/gpt-6-luna` twice refused to press Save on the
  production database even with explicit permission (16.10.2026); run such scenarios on
  `opencode/gpt-6-luna` from the start.
- **Run** in the background, a run takes several minutes:

  ```sh
  opencode run --agent qa --model openai/gpt-6-luna --format json --title "QA <step>" \
    --file tmp/qa-<step>/brief.md "Проверь по приложенному brief.md и верни QA-отчёт." \
    > tmp/qa-<step>/events.jsonl 2> tmp/qa-<step>/stderr.log
  ```

- **Result.** `opencode run` exits with 0 even on a provider error, so do not trust it.
  Errors: `jq -c 'select(.type=="error") | .error' tmp/qa-<step>/events.jsonl`, the report:
  `jq -r 'select(.type=="text") | .part.text' tmp/qa-<step>/events.jsonl`. A report without a
  final `QA_RESULT: …` line is a crashed run, not a check result. Look at the report's
  screenshots yourself before passing conclusions to the user.
- **If the agent crashed or hung:** stop the process (the background task or `kill <pid>`;
  find it with `pgrep -fl "opencode run --agent qa"`), then close its browser session:
  `agent-browser session list` and `agent-browser --session <name> close`. Do not use
  `close --all`: it closes other people's sessions.
- **Model limit.** If `openai/gpt-6-luna` hit its limit (`usage_limit` in the error), rerun with
  `--model opencode/gpt-6-luna` and a new session name. If that fails too, do not retry in a
  loop; tell the user.

## Brief example

The brief is written in Russian, like the step cards:

<example>
```markdown
# QA 59: оформление после содержания

URL: http://localhost:3000/anna
Первой командой открой страницу с `--state tmp/qa-auth.json`.
Сессия браузера: qa-59-1. Артефакты: tmp/qa-59/.
Размеры: 390×844, 1280×800.

Ограничения: код не меняй, серверы не запускай. Удалять аккаунт запрещено. Save не нажимай.

A. Загрузи страницу с замедлением сети Slow 3G. До появления имени в `h1` фон `[data-page-theme]`
   не меняет цвет: скриншоты через 0,5 с и после загрузки.
B. Ширина `main article` на 390 px — не меньше 358 px, горизонтальной прокрутки нет.
C. В тёмной теме контраст текста `h1` к фону карточки — не ниже 4.5:1.

Для каждого критерия — PASS, FAIL или BLOCKED с доказательством (скриншот, измерение).
```
</example>
