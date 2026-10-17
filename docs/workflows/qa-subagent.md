# QA agent: checking the interface

How to check the UI with the QA agent (rule 14 in [`process.md`](process.md), decisions 26, 38,
39 and 43 in [`docs/DECISIONS.md`](../DECISIONS.md)).

## When to run

Only when the user asks for it directly in the current task: «запусти QA», «проверь через
QA-агента». A plain «проверь» means your own checks without a second agent, and a request in
one task does not carry over to the next. Without a request, a UI step stays open with
«Ожидает проверки: …» under it (rule 14).

The opencode QA agent checks the running interface against criteria. Its config is
`~/.config/opencode/agents/qa.md`: the agent works through `agent-browser`, does not change code
and does not start servers.

## Plan step cycle with QA

When the user asks for a QA check of a step or sub-step from a stage card (linked from
`docs/PLAN.md`), go through the cycle:

1. The checks of rule 5 in [`process.md`](process.md) (`npm run check`) passed.
2. **Brief.** Complete the [preflight](#before-writing-the-brief) before choosing criteria.
   Criteria come from the step card: scenario, «Готово, когда», screen sizes. Each criterion
   covers one observable behaviour: explicit setup, user action, expected result and the
   condition to wait for before measuring. Give a selector and a number where they exist
   («width of `textarea[name=bio]` ≥ 360 px», not «column ~448 px»). Group cases that share
   setup, but split a cover × viewport × theme matrix into independently reported criteria;
   do not hide a long list of scenarios under one letter.
3. **Run** the QA agent (commands below) and read the result as described in «Result». A FAIL
   requires completed prerequisites and user action, plus two failing observations after
   waiting for the expected state. If a required action was never completed (for example,
   the agent missed a toast or tried to click a hidden control), its downstream result is
   BLOCKED. A missing control itself can be a FAIL when its preceding trigger completed and
   two observations confirm its absence. Check each valid FAIL against the code: a false FAIL
   (an imprecise brief, the agent measured the wrong element) is fixed in the brief, not in the code. Do not reproduce a FAIL in the browser
   yourself: every call of the main agent goes over its long context, and a rerun of one
   criterion costs about the same in tokens on a cheaper model. If the FAIL looks false
   (timing, selector, data not loaded yet), clarify that criterion in the brief and rerun only
   it; reproduce it yourself only when the QA agent cannot reach the state.
4. **FAIL or PARTIAL caused by the code** — fix it, rerun the checks of item 1 and run QA
   again with a new session name. The new brief keeps only the FAIL and BLOCKED criteria under
   their old letters: passed criteria are not rechecked. After three runs with FAIL, stop and
   describe to the user what does not add up. For a brief, selector, timing or tool issue,
   allow only one clarified rerun per criterion, whether the overall report says FAIL,
   PARTIAL or BLOCKED. Include the previous attempt and what changed in the new brief;
   renaming a session or splitting a brief does not reset this count. If the clarified rerun
   is still inconclusive, keep the criterion BLOCKED and continue independent checks. Do
   not queue it again until the environment or measurement method has materially changed;
   name that change before another run. The three-FAIL limit above remains for confirmed
   product defects after code fixes.
5. **PASS** — mark the step `[x]` and replace «Ожидает проверки» with a summary line: «QA
   <date>: PASS — what was checked and at which sizes (Storybook or `/settings`)». The report
   lives in `tmp/`, which is not in git, so the plan gets the gist; do not copy reports into
   the repository ([plan-step.md](plan-step.md#keeping-the-index-and-cards)).
6. **Needs a human check** — what QA cannot check: sign-in through providers, third-party
   services and production, real devices (iOS Safari, Android), judging taste and copy, items
   the agent marked BLOCKED not because of the code. Mark what QA checked as in item 5, and for
   the rest create a sub-step `N.x 🧑‍💻 Разработчик: проверить …` — what exactly and why QA could
   not. If nothing is left, do not create a «check live» 🧑‍💻 sub-step.
7. **QA did not run** (both models at their limit, servers not responding) — do not mark the
   step; keep «Ожидает проверки», add why QA did not run and tell the user.

The agent marks a step `[x]` when QA finally returned PASS without errors and no live check is
needed (item 6) — including a 🧑‍💻 «проверить …» step fully covered by QA — or when the
developer writes that the step is done or checked. The developer marks the other 🧑‍💻 steps
(decisions, third-party services, migrations, git). Steps without UI
(documentation, migrations, server logic without UI) skip QA: checks follow the task type in
`process.md`; code requires the commands of rule 5.

## Where to check

Pick the cheapest environment that reaches the states the criteria need:

| Environment | Use for | Limits |
|---|---|---|
| `localhost:3000`: `npm run dev`, the **production** database, the user's session | Layout and behaviour on the real profile; Save only when a criterion needs saved data | Changes the user's real data; no guest, owner switching or server errors |
| `:3000` + `network route` in the agent's browser | A request that fails as a network error (`--abort`), e.g. a Save error without a write to the database; substituted data in a successful response (`--body`, always status 200) | No 401/500 statuses or delays; server rendering still reads the production database |
| QA stand `localhost:3100`: `npm run qa:stand` | Guest and owner, private and password pages, `/api/me` delay and 500, Save and document errors, Save without the production database, server HTML of the production build | Our API, RLS and Storage are replaced: only the UI and server rendering are checked |
| Storybook `localhost:6006` | The look of separate components and their states | No routes, tab title or data |

- **`network route`.** The brief names the pattern, the mode and when to remove it: «перед Save
  выполни `network route '**/api/profile' --abort`, после проверки — `network unroute`». A
  route lives in the agent's browser only: aborted requests never reach the server.
- **QA stand** — `scripts/qa-stand/stand.mts`. Run `npm run build`, then `npm run qa:stand` in
  the background: the stand refuses a build older than `src/`. It starts `next start` on
  `:3002` with fictional keys (every other variable from `.env` is empty), proxies pages to it,
  answers `/api/*` and the Supabase requests of server rendering itself and blocks any other
  API call with 403. Stopping the background task stops both processes.
  - Data: Anna Example, page `qa-anna`, owner `anna@example.com`; all fictional.
  - Control from the agent's browser: `fetch('/__qa/control?…')` with `reset=true`,
    `owner=true|false`, `visibility=public|private|password`, `delay=<ms>` for `/api/me`, and
    `meError`, `saveError`, `documentError` `=true|false`, and `bumpVersion=true` — a save in
    another tab (Save then gets a 409 `version_conflict`). `password=<text>` sets the page
    password: with `visibility=password` the guest form unlocks the page and sets the access
    cookie, as the real API does. `photo=true|false` gives the profile a fictional photo;
    an upload through the UI replaces it with the uploaded file. `/__qa/state` returns the
    state and the request log; the log is also in `tmp/qa-stand/requests.jsonl`.
  - The photo exists only in API responses: `/settings`, the preview and the owner's view.
    Server-rendered pages show no photo, and no photo goes through the `next/image`
    optimizer: Next.js 16 does not optimize images from local addresses, and the production
    config must not allow it. Photo optimization (`srcset`, `/_next/image`) is checked on
    `:3000`.
  - The brief: URL `http://localhost:3100`, no `--state tmp/qa-auth.json`, Save allowed,
    «боевой БД здесь нет», `fetch` only to `/__qa/control` and `/__qa/state`; user actions
    are still checked with clicks and input. After changing a condition — a full `open`.
  - If a criterion needs a response the stand does not give, extend `stand.mts`. Its data
    and responses are typed with the types from `src`, so `npm run check` reports drift
    from the API and the database schema.
  - **Before rerunning a BLOCKED or FAIL criterion on the stand**, inspect `blocked: true`
    entries from that run in `tmp/qa-stand/requests.jsonl`. Record the log's starting line
    before each run: the file is appended to, so older entries must not block a new run.
    A marked request got 403 because the stand has no response for it. Check that its path
    and method match the app's API contract before adding a missing response; the marker
    alone does not rule out an incorrect request from the app. Resolve the relevant gap
    before rerunning. The stand also prints these requests to its output.

## Before writing the brief

- Check that the chosen servers respond: `curl -s -o /dev/null -w '%{http_code}'
  http://localhost:3000` (`:3100` for the stand, `:6006` for Storybook). If `:3000` or
  Storybook does not respond, ask the user to start them; start the stand yourself.
- Map each planned criterion to a supported environment and prerequisite: actor/session,
  fixture state, API responses, upload file and required measurement tool. Use the current
  stand handlers, API contracts and relevant existing evidence; verify uncertain prerequisites
  with a minimal read-only check. Do not replay the whole scenario during preparation.
- Put the supported capabilities and known limits in the brief. If a required response is
  missing, extend the stand and run the required checks/build before QA, or list the criterion
  as unavailable in this environment. Do not spend a QA run rediscovering a known limitation.
- Lighthouse scores, TBT, Speed Index and controlled cache/network/CPU comparisons need a
  separate reproducible Lighthouse run with the step's measurement procedure. Assign that
  work to the caller or developer; do not send it to this agent as a `vitals` substitute.
  Native vitals are useful only when those measurements themselves are requested.

## How to run

- **The brief** goes to `tmp/qa-<step>/brief.md` (`tmp/` is in `.gitignore`). It contains the
  URL, criteria labelled A, B, …, screen sizes, the browser session name `qa-<step>-<n>` (new on
  every run), the artifacts folder `tmp/qa-<step>/` and the restrictions. Save on
  `localhost:3000` is allowed, but the local site works with the **production** database: the
  agent changes the user's real profile. **Always forbid account deletion in the brief.**
  One brief covers one step and at most five criteria; split a larger step into several
  briefs. Mark a criterion judged by eye rather than by a number with «(визуальный)».
  For transient notifications or controls, include a ready batch with stable role/CSS
  locators: trigger → wait → act → verify. Obtain any needed snapshot before the trigger,
  not between the appearance of a short-lived control and the click. See the
  [batch example](#batch-example).
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
- **Run** in the background, a run takes several minutes. Several steps go into one
  background command that runs them one after another and writes a one-line result per step
  to `tmp/qa-summary.txt`. If a run on `openai/gpt-6-luna` fails before its first step (its
  limit, a provider error), the command switches to `opencode/gpt-6-luna` for the step and
  every step after it:

  ```sh
  model=openai/gpt-6-luna; : > tmp/qa-summary.txt
  for s in <step> <step>; do
    d=tmp/qa-$s
    opencode run --standalone --agent qa --model $model --format json --title "QA $s" \
      --file $d/brief.md "Проверь по приложенному brief.md и верни QA-отчёт." \
      > $d/events.jsonl 2> $d/stderr.log
    if [ $model = openai/gpt-6-luna ] && ! grep -q step_finish $d/events.jsonl; then
      model=opencode/gpt-6-luna
      opencode run --standalone --agent qa --model $model --format json --title "QA $s" \
        --file $d/brief.md "Проверь по приложенному brief.md и верни QA-отчёт." \
        > $d/events.jsonl 2> $d/stderr.log
    fi
    jq -r 'select(.type=="text") | .part.text' $d/events.jsonl > $d/report.md
    echo "$s ($model): $(grep -o 'QA_RESULT: [A-Z]*' $d/report.md | tail -1)" >> tmp/qa-summary.txt
  done
  ```

  `--standalone` starts a private opencode server for the run: the long-lived background
  service can break (on 17.10.2026 it answered `UnexpectedStatus: 500` before the first step
  with `FileSystem.realPath` errors in `~/.local/share/opencode/log/opencode.log`).
  Wait for the command itself to exit. Do not follow the files with `Monitor` or `tail -f`:
  every event wakes the main agent and costs a whole turn over its long context.
- **Result.** `opencode run` exits with 0 even on a provider error, so do not trust it. Read
  in this order and stop as soon as the answer is clear:
  1. `tmp/qa-summary.txt`: one line per step. A step without `QA_RESULT` is a crashed run,
     not a check result: errors are in `jq -c 'select(.type=="error") | .error'
     tmp/qa-<step>/events.jsonl`.
  2. On PASS — only the final block of the report: `sed -n '/Итог по критериям:/,$p'
     tmp/qa-<step>/report.md`.
  3. On FAIL, BLOCKED or PARTIAL — the sections of those criteria in `report.md`, not the
     whole log.

  Do not parse the agent's steps in `events.jsonl` (its commands and their output) when the
  report has `QA_RESULT`: the report is enough to judge the criteria, and parsing the log
  costs many calls of the main agent. Open the steps only for a run that ended without
  `QA_RESULT`, and only its last steps.

  Look at the screenshots yourself only for FAIL criteria and criteria marked «(визуальный)»;
  a PASS backed by a measurement needs no screenshot.
- **If the agent crashed or hung:** stop the process (the background task or `kill <pid>`;
  find it with `pgrep -fl "agent qa"`), then close its browser session:
  `agent-browser session list` and `agent-browser --session <name> close`. Do not use
  `close --all`: it closes other people's sessions.
- **Model limit.** After `openai/gpt-6-luna` hits its limit (`usage_limit` in the error) or
  fails before its first step, use
  `opencode/gpt-6-luna` until the end of the task; do not try the first model again for each
  step. If the second model fails too, do not retry in a loop; tell the user.

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

A. (визуальный) Загрузи страницу с замедлением сети Slow 3G. До появления имени в `h1` фон
   `[data-page-theme]` не меняет цвет: скриншоты через 0,5 с и после загрузки.
B. Ширина `main article` на 390 px — не меньше 358 px, горизонтальной прокрутки нет.
C. В тёмной теме контраст текста `h1` к фону карточки — не ниже 4.5:1.

Для каждого критерия — PASS, FAIL или BLOCKED с доказательством (скриншот, измерение).
```
</example>

## Batch example

On the fictional stand, first prepare an invalid Username in Account and a changed Bio in
Public profile. Once those prerequisites are confirmed, the error action is time-sensitive:

```sh
agent-browser --session qa-78-1 batch --bail \
  "find role button click --name 'Save'" \
  "wait --text 'Go to field'" \
  "find role button click --name 'Go to field'" \
  "wait '#username[aria-invalid=true]:focus'" \
  "eval 'document.activeElement.id'"
```

The expected result is `username`. If the batch stops before the action was clicked, report
BLOCKED with the failed command; do not claim a focus defect. Use a fresh snapshot when later
ref-based actions need new refs. Keep this sequence inside one tool call so model latency
does not consume the notification's lifetime.
