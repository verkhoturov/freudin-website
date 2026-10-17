# Code: FSD, routes and Next.js

Read before changing any code, including configuration and tests.
These are required rules from [`AGENTS.md`](../../AGENTS.md); the process is in [`process.md`](process.md).

## Architecture: Feature-Sliced Design with amendments

A module may import only layers below its own:

| Layer | Where | Contents |
|------|-----|-----------|
| `app` | `src/app` | Next.js routing and the FSD app layer at once: layout, global styles, providers (`_providers/`), API (`api/`) |
| `views` | `src/views` | Pages (instead of the FSD `pages` layer): one slice per screen |
| `widgets` | `src/widgets` | Large self-contained blocks and user scenarios: header, profile form, sign-in panel |
| `entities` | `src/entities` | Business entities: types, zod schemas, API hooks, server functions, simple UI |
| `shared` | `src/shared` | Reusable code without business logic: `ui`, `lib`, `api`, `config` |

Amendments to classic FSD:

- **`views` instead of `pages`:** the name `pages` clashes with the Next.js Pages Router.
- **No `features` layer.** Scenarios (sign-in, profile editing, sign-out) are assembled in
  `widgets`, and their mutations and hooks live in `entities`.
- `src/app` is both the App Router and the app layer. Its service folders are private, with
  a `_` prefix (`_providers`, `api/_lib`), so Next.js does not turn them into routes.

Import rules. Biome enforces those marked (B) through `noRestrictedImports` in the `overrides`
of `biome.json`: `npm run lint` reports a violation with a message explaining the fix.

- Across layers and slices import through the `@/` alias, inside a slice use relative paths.
- (B) A slice is imported only through its public API: `@/views/<slice>`, `@/widgets/<slice>`,
  `@/entities/<slice>`. The server public API is `@/entities/<slice>/index.server`.
- (B) Slices of one layer do not import each other. Exception — `entities` through `@x`:
  `@/entities/<slice>/@x/<consumer>`.
- `shared/ui` and `shared/lib` are imported by file (`@/shared/ui/button`,
  `@/shared/lib/cva`), as shadcn does. `shared/config` and `shared/api` are imported through
  their index: `@/shared/config`, `@/shared/config/index.server`, `@/shared/api`,
  `@/shared/api/index.server`.
- (B) Client code (`views`, `widgets`, `src/app` outside `api`) does not import `index.server`.
  Exceptions for server rendering: `page.tsx` takes `@/views/<slice>/index.server`, and server
  view modules (`*.server.ts(x)`) take `@/entities/<slice>/index.server` and
  `@/shared/api/index.server`.
- (B) `src/app/api` does not import UI (`views`, `widgets`, `shared/ui`) or the client public
  API of entities.

Slice structure (create only the segments you need):

```
src/entities/profile/
├─ index.ts          # client public API
├─ index.server.ts   # server public API (import "server-only")
├─ @x/               # public API for other entities
├─ ui/               # components
├─ model/            # types, zod schemas, Zustand stores
├─ api/              # query keys, TanStack Query hooks, server functions *.server.ts
├─ lib/              # slice helpers
└─ config/           # slice constants
```

A page is assembled like this:

```ts
// src/app/login/page.tsx — re-export only
export { LoginView as default, metadata } from "@/views/login";
```

- `src/views/login/ui/login-view.tsx`: the page component with `"use client"`;
- `src/views/login/config/metadata.ts`: static `metadata` (a plain module without
  `"use client"`, otherwise Next.js rejects it);
- `src/views/login/index.ts`: the public API, re-exports both.

A server-rendered page (currently only `/<username>`) re-exports the view's server public API:
`export { generateMetadata, ProfilePage as default } from "@/views/profile/index.server";`.

Before creating a new module, find the scenario in the
[lookup map](../code-map.md#where-to-look-for-a-change) and open the
[catalog](../code-map.md#slice-catalog) card. Check the exports in its `index.ts`,
`index.server.ts` or `@x`; links to internal files are for reading the implementation and do
not permit bypassing the public API in imports.

## Routes

Page, service file and API tables are in `README.md`, section [«Роуты»](../../README.md#роуты).

- Build paths in code only through `routes` (pages) and `apiRoutes` (API) from `@/shared/config`.
- `/<username>` is a top-level dynamic route. Static routes take priority, so their addresses
  must not be given to users. The list lives in `src/shared/config/reserved-usernames.ts`: the
  first path segments from `routes` are added automatically, so **add every new page to
  `routes`**. Add other reserved words to `reservedWords` by hand.

## Code style

- Biome: `npm run lint` checks, `npm run lint:fix` fixes and formats. Line width is 100.
- TypeScript strict, no `any` or `@ts-ignore`.
- File and folder names are kebab-case, components PascalCase. Use named exports
  (`export function LoginView`); default exports only where Next.js requires them.
- Comment only where the code is not self-evident.
- Tests sit next to the module: `<module>.test.ts`, with explicit imports from `vitest`
  (`describe`, `it`, `expect`) and test names in Russian. Config — `vitest.config.mts`: `node`
  environment, the `@/` alias from `tsconfig`, `server-only` replaced with an empty module, so
  server functions that do not touch Supabase or `cookies()` are tested directly.
- **JS weight.** Import zod as `import * as z from "zod"`: `import { z }` pulls every locale
  into each page (about 60 KB gzip). `package.json` has `"sideEffects": ["*.css"]`: the bundler
  drops unused re-exports from slice `index.ts` files, so modules must do nothing on import;
  do not write imports for side effects (except CSS). Load heavy, rarely used code (photo crop,
  QR code) with `next/dynamic` on user action, with a placeholder of the same size. `apiClient`
  is on every page, so it contains no zod.

## Next.js 16: things to watch

- `next typegen` generates the global `PageProps`, `LayoutProps` and `RouteContext` types.
- `metadata` can be exported only from server modules.
- In client components read route params with `useParams()` and the query with
  `useSearchParams()`. Wrap a component using `useSearchParams()` on a static page in
  `<Suspense>`, otherwise the build fails.
- Change the URL without navigation with `window.history.replaceState(window.history.state, "", url)`.
  With `null` instead of the state, Next loses its route tree and Back shows the wrong page.
  `router.replace` does not fit: it resets the tab title from `metadata`. But `useSearchParams`
  does not see such a `replaceState`: a query that drives rendering (the settings section)
  changes through a link or `router.replace`.
- `notFound()` works only in server code (currently `ProfilePage`). Call it before the first
  `Suspense` and without `loading.tsx` in the segment: once streaming starts, the status stays
  200. Client views draw the 404 state themselves (`NotFoundState` from
  `@/shared/ui/not-found-state`). A data loading error — `ErrorState` from
  `@/shared/ui/error-state`; a render error is caught by `error.tsx`.
- `error.tsx` and `global-error.tsx` receive `retry()` (refetch and re-render the segment), not
  only `reset()`: retry through `retry`.
- `next lint` is removed; linting goes through Biome.

### Next.js docs index

The managed block in `AGENTS.md` asks you to read the installed Next.js docs before writing
code. Open only the file for the topic you touch; paths are relative to
`node_modules/next/dist/docs/01-app/`.

| Topic | File |
|---|---|
| What changed in 16 | `02-guides/upgrading/version-16.md` |
| Server and client components, the boundary | `01-getting-started/05-server-and-client-components.md`, `02-guides/server-and-client-boundary.md` |
| `metadata`, `generateMetadata`, Open Graph images | `01-getting-started/14-metadata-and-og-images.md`, `03-api-reference/04-functions/generate-metadata.md`, `03-api-reference/03-file-conventions/01-metadata/opengraph-image.md` |
| `sitemap.ts` | `03-api-reference/03-file-conventions/01-metadata/sitemap.md` |
| `page.tsx`, `layout.tsx`, `PageProps` | `03-api-reference/03-file-conventions/page.md`, `03-api-reference/03-file-conventions/layout.md` |
| `notFound()` and `not-found.tsx` | `03-api-reference/04-functions/not-found.md`, `03-api-reference/03-file-conventions/not-found.md` |
| `error.tsx`, `global-error.tsx`, `retry` | `03-api-reference/03-file-conventions/error.md` |
| `useSearchParams`, `useParams`, `useRouter` | `03-api-reference/04-functions/use-search-params.md`, `use-params.md`, `use-router.md` in the same folder |
| Route Handlers | `01-getting-started/15-route-handlers.md`, `03-api-reference/03-file-conventions/route.md` |
| `proxy.ts` (needs approval) | `01-getting-started/16-proxy.md`, `03-api-reference/03-file-conventions/proxy.md` |
| `next/dynamic` | `02-guides/lazy-loading.md` |
| Caching | `01-getting-started/08-caching.md` |

For anything else, find the file with `grep -ril '<term>' node_modules/next/dist/docs/01-app`.
