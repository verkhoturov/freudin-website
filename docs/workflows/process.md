# Working process

Rules for every task in the project, whether it comes from `docs/PLAN.md` or directly from the
user. Read them before starting ([`AGENTS.md`](../../AGENTS.md) sends you here).

Rules 1–3 apply only to plan tasks and live in [`plan-step.md`](plan-step.md). Numbering is
shared: the plan and [`docs/DECISIONS.md`](../DECISIONS.md) refer to rules by number.

## Checks by task type

- **Analysis without changes:** read only; do not run auto-fixes, file generation or commands
  that write. Run code checks only if the answer needs them, and report their result.
- **Documentation only:** check local links, section anchors, consistency of the rules and the
  diff. When moving instructions, confirm nothing was lost and check the size of `AGENTS.md`.
  `npm run check`, type generation and the build are not needed for Markdown alone.
- **Code, configuration or dependencies:** the checks of rule 5. A plan step that changes the
  UI stays open until it is checked (rule 14).
- **Preparing a commit on request:** also `npm run build` (rule 5); Git permissions — rule 10.

## Documents and when to update them

For any task, including ones outside the plan, pick the rows matching the facts you actually
changed. Update the matching section in the same change; if the facts are unchanged, the
document needs no edit. Read the relevant section, not every project document.

| What changed | Where to update |
|---|---|
| Features, dependencies, commands, env, routes or deploy | The matching section of [`README.md`](../../README.md). Current state and operations only: no plans, step numbers, dates or change log |
| Connecting, configuring or maintaining an external service | The matching guide in [`operations/`](../operations/): [Supabase and backups](../operations/supabase.md), [sign-in and domain](../operations/authentication.md), [support email](../operations/support-email.md). README gets a short status and a link; never write secrets into a guide |
| System boundaries, containers, component responsibilities or interfaces | The matching level of [`architecture/`](../architecture/); runtime flows — [dynamic.md](../architecture/dynamic.md), internals of a selected component — [4.code.md](../architecture/4.code.md) |
| Where a scenario lives, a slice, a public API or a key file path | The matching row or card in [`code-map.md`](../code-map.md). Do not copy full export lists or ordinary internal helpers: the code is the source |
| A general constraint or working rule | A short constraint and navigation — [`AGENTS.md`](../../AGENTS.md), details — the matching workflow. Do not copy rules into the plan |
| The user made or revised a decision | [`DECISIONS.md`](../DECISIONS.md): reason, date and author; when revising, the previous meaning and a link to the replacement. Keep the numbers. An agent's proposal is not a decision by itself |
| Agreed product direction or feature readiness | The matching part of [`PRODUCT.md`](../PRODUCT.md): sections 1–5 only by the owner's decision, readiness — section 6 with the date and basis of the review; mark ideas and open questions separately |
| A plan task, its conditions or a check result | The stage card and the [`PLAN.md`](../PLAN.md) row; completed items and check results go to [`plan/history/`](../plan/history/), raw materials stay in `tmp/`, per [plan-step.md](plan-step.md). Do not rewrite history as current instructions |
| Personal data processing | The sources of the live `/privacy` and `/terms`, per rule 11. A legal draft is not the published text |

When moving a section, fix its relative links and the incoming links from other documents.
Do not create a second maintained copy of an instruction.

What each document is for:

- `AGENTS.md` and `docs/workflows/` — the current rules: general constraints and navigation
  in `AGENTS.md`, detailed requirements and procedures in the workflows.
- `docs/architecture/` — static C4 levels and separate dynamic views; `docs/code-map.md` —
  lookup by scenario, slice, public API and files outside the C4 levels.
- `README.md` — current state and operations, without plans, dates, change log or decisions.
  `docs/operations/` — detailed service setup and maintenance guides.
- `docs/PLAN.md` — index and queue of open tasks; `docs/plan/stage-*.md` — stage cards;
  `docs/plan/history/` — completed items and past check results, one file per stage.
- `docs/DECISIONS.md` — reasons and history of decisions; `docs/PRODUCT.md` — product
  boundaries and agreed direction, with a separate readiness snapshot, proposals and questions.
  `docs/legal/*.draft.md` — archived sources; the live legal texts are in the view code.

## Rules 4–14

4. **Write new tests only when the user asks directly** (decision 21). Do not add tests
   (unit, integration, e2e), test frameworks or their configs on your own initiative.
   Exception — logic that is already covered (step 24, listed under «Тесты» in `README.md`):
   when you change it, update its tests in the same change and cover the new scenario of that
   function.
5. **After a change to code, configuration or dependencies, run `npm run check`** once the
   change is complete and before the report — not after every edit. It runs `lint:fix`,
   `typecheck` and the tests with a compact reporter, and it must pass. Investigate failures:
   fix errors your change caused, and name pre-existing or external failures in the report.
   After fixing, run it again. If behaviour changed on purpose, update existing tests per
   rule 4. Do not disable or skip tests to get a green run. Before a commit, also run
   `npm run build`. Report results per rule 13.
6. Install dependencies with npm 11+ (`npx npm@11 install …` if the local npm is 10):
   `package-lock.json` was created by npm 11, and npm 10 rewrites it with noise. Before
   installing, check the npm version and save the current contents of the `package.json`,
   lock file and components you will change outside the repository. The shadcn CLI installs
   packages with the system npm: afterwards run `npx npm@11 install` and check the dependency
   and lock file diff. If there is noise, restore only your command's result from the snapshot
   and repeat the install with npm 11; do not reset the whole file to HEAD and do not lose
   changes that existed before the task. shadcn installation — also [`ui-kit.md`](ui-kit.md).
7. Languages (decisions 16 and 36):
   - UI text is English: labels, toasts, `aria-label`, `alt`, `metadata`, zod messages, API
     error `message`, legal texts. Apostrophes are typographic: `Couldn’t`, `can’t`. Server
     logs are English too.
   - Agent instructions are English: `AGENTS.md`, `docs/workflows/`, `docs/architecture/`,
     `docs/code-map.md`. The other documents (README, plan, history, DECISIONS, PRODUCT,
     operations) and code comments are Russian; test names are Russian.
   - Keep Cyrillic in the Geist font: user names and descriptions can be in any language.
8. When building UI, check the markup against the [SEO checklist](seo-checklist.md) and
   suggest improvements to the user if SEO can be better.
9. Every commit to `main` deploys to production at `www.freud.in`; there are no preview
   deploys. If code needs new environment variables or external service settings, remind the
   user to set them for production before merging.
10. **Git.** Reading is allowed: `git status`, `git diff`, `git log`, `git show`,
    `git ls-files`. Before editing, check the working tree and keep other people's staged and
    unstaged changes. **In a local session, branches, commits, pushes and branch switches
    happen only on the user's direct instruction** (decision 30). In a cloud session, commits
    and pushes to the working branch are allowed. Do not reset or restore files or the index
    through Git without the user's direct instruction. To fix the result of your own command,
    use the snapshot taken right before it or a targeted edit: a HEAD snapshot lacks the
    user's uncommitted changes.
11. If personal data processing changes (a new sign-in provider or service, cookies, browser
    storage, analytics), update the `/privacy` and `/terms` texts and their «Last updated»
    date. Live texts — [`privacy-view.tsx`](../../src/views/privacy/ui/privacy-view.tsx) and
    [`terms-view.tsx`](../../src/views/terms/ui/terms-view.tsx), operator details —
    [`legal.ts`](../../src/shared/config/legal.ts), email — `siteConfig.supportEmail`.
    The [Privacy source](../legal/privacy-with-analytics.draft.md) and
    [Terms source](../legal/terms-with-analytics.draft.md) are archived drafts with analytics,
    not the site's current terms. When analytics is connected, carry over only the applicable
    clauses after checking the actual data processing; do not bring back the old domain,
    contacts and dates.
12. **Plan report** (the user asks for the status of `docs/PLAN.md`) — tables in chat in the
    format of [`plan-report.md`](plan-report.md).
13. **Check report** (decision 25): what changed, what was checked and what remains unchecked.
    - For the tests, give the number that passed; on failure, which failed and why. Mention
      existing tests updated per rule 4.
    - If changed business logic is not covered, or only partly, suggest concrete scenarios
      and a test file. The suggestion does not authorise writing new tests (rule 4).
    - Keep static checks separate from Storybook, browser, signed-in flows, external services
      and real devices. For skipped checks, give the reason; never call them passed.

    <example>
    Changed: `profile-changes.ts` — FAQ is now sent in one group with services.
    Checked: `npm run check` — lint and typecheck clean, 112 tests passed;
    `profile-changes.test.ts` updated for the new group (rule 4).
    Not checked: browser and Storybook — no UI change; Save against the database was not run.
    Uncovered: removing the whole FAQ list — a case for `profile-changes.test.ts`, not
    written without your request.
    </example>
14. **The QA agent runs only when the user asks for it directly** in the current task
    (decisions 26 and 39): «запусти QA», «проверь через QA-агента». A plain «проверь» means
    your own checks (rule 5, a look in the browser) without a second agent. A request in one
    task does not carry over to the next.
    - A 🤖 step or sub-step that changes the behaviour or look of the UI is not marked `[x]`
      after implementation. Add «Ожидает проверки: <что проверить>» under it, and say in the
      report that the developer can check it or ask for the QA agent.
    - Mark the step `[x]` when the developer writes that it is done or checked (the summary
      line: «Проверено разработчиком <дата>», plus what was checked if they said so), or after
      QA returned PASS — the cycle in [`qa-subagent.md`](qa-subagent.md).
    - Steps without UI need no such check: pick checks by task type at the top of this document.
