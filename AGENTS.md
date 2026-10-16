<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Freudin: project rules

Freudin is a website for psychologists and their future clients. A psychologist signs in with
Google or Telegram and builds a profile page `/<username>`; clients open it without an account.
Freudin does not vet psychologists, take part in client communication or accept payments.

## How to use these instructions

1. Before any task, read [`process.md`](docs/workflows/process.md): checks, tests, Git,
   languages and personal data. Start with `git status --short` and keep other people's changes.
2. Before changing code, read [`code.md`](docs/workflows/code.md), then every workflow that
   matches the table below. A linked document is required reading when its condition applies,
   even if your environment does not load it automatically. For analysis, read only the
   relevant sections.
3. Stay within the agreed scope. Analysis or a plan without a request for edits changes no
   files; an implementation ends with the checks and report from `process.md`.

## What to read for a task

| Task | Required reading |
|---|---|
| Any task | [`workflows/process.md`](docs/workflows/process.md) |
| Any change to code, configuration or tests | [`workflows/code.md`](docs/workflows/code.md): FSD, imports, routes, code style, Next.js specifics |
| API, data loading, server modules, auth, state | [`workflows/api.md`](docs/workflows/api.md) |
| Schema, DB queries, RLS, data privacy, files, migrations | [`workflows/database.md`](docs/workflows/database.md) |
| UI, forms, theme, tokens | [`workflows/ui.md`](docs/workflows/ui.md) and the [SEO checklist](docs/workflows/seo-checklist.md) |
| shadcn component, Storybook story, new visual element or token | Also [`workflows/ui-kit.md`](docs/workflows/ui-kit.md) |
| Plan step | The step's card in `docs/plan/stage-*.md` (found via [`PLAN.md`](docs/PLAN.md)) and [`workflows/plan-step.md`](docs/workflows/plan-step.md) |
| Closing a plan step that changes UI | Also [`workflows/qa-subagent.md`](docs/workflows/qa-subagent.md) |
| Plan status report | [`workflows/plan-report.md`](docs/workflows/plan-report.md) |
| Finding an existing module or the place to change | The [scenario map](docs/code-map.md#where-to-look-for-a-change) and the matching [catalog card](docs/code-map.md#slice-catalog) |
| Changing how parts of the system connect | The matching [architecture](docs/architecture/) level: [context](docs/architecture/1.context.md), [containers](docs/architecture/2.containers.md), [components](docs/architecture/3.components.md); internals — [Code](docs/architecture/4.code.md), scenarios — [dynamic views](docs/architecture/dynamic.md) |
| Page copy, marketing, design, product direction | [`PRODUCT.md`](docs/PRODUCT.md) |
| Why a rule exists, or revisiting a decision | The matching entry in [`DECISIONS.md`](docs/DECISIONS.md) |
| Running, scripts, env, routes, external services, deploy | The matching section of [`README.md`](README.md) |
| Setting up or maintaining a service | [`operations/`](docs/operations/): [Supabase](docs/operations/supabase.md), [sign-in and domain](docs/operations/authentication.md), [support email](docs/operations/support-email.md) |
| Context of a completed step | Its stage file in [`plan/history/`](docs/plan/history/); not read in full by default |

A task can match several rows: a photo upload needs the code, API, database and UI rules.
For Next.js changes, also read the installed version's docs from the managed block at the top
of this file; [`code.md`](docs/workflows/code.md#nextjs-docs-index) lists the relevant files.

## Key constraints

- The local site uses the **production** Supabase database, and every commit to `main` deploys
  to production; there are no preview deploys. The user applies migrations. Backup, migration
  and type generation order — [`database.md`](docs/workflows/database.md); Git — `process.md`.
- The browser calls only our own API through `apiClient` and TanStack Query. Supabase and
  secrets stay on the server; user data is protected by the API and RLS. Hidden profiles never
  appear in search, the sitemap or new queries. Details — `api.md` and `database.md`.
- The UI is client-rendered. Agreed exceptions: server-rendered `/<username>` with
  `generateMetadata`, server `/privacy` and `/terms`, files Next.js requires. New exceptions,
  Server Actions and `proxy.ts` need the user's approval; details — `api.md`.
- Server data lives in TanStack Query; Zustand holds only UI state and drafts. Entity server
  functions work with data, Route Handlers with HTTP. Imports and boundaries — `code.md`, `api.md`.
- The design is minimal: standard shadcn components, styling through theme tokens. Add
  decoration, illustrations or extra explanatory text only on request. Details — `ui.md`.

## Stack

Next.js 16 (App Router, React Compiler), React 19, TypeScript strict, Tailwind CSS 4,
shadcn/ui (Radix), TanStack Query and Form, Zustand, zod 4, Supabase, Biome, Vitest,
Storybook, Vercel. Versions are in `package.json`, the full list and commands in
[`README.md`](README.md#стек). Keep this stack instead of alternatives (react-hook-form, Redux,
SWR, axios, ESLint, Prettier). Add a dependency only when the existing stack cannot solve the
task, and list it in the README.

## Documents

Which document holds what and when to update it — the
[table in process.md](docs/workflows/process.md#documents-and-when-to-update-them).
A plan entry does not mean a feature is ready, and an AI proposal is not the owner's decision.
If a description contradicts the code, check the related modules and report the mismatch.
History does not override current rules; leave new product decisions to the owner.
