# Client, server and API

Read when changing data loading, server modules, the API, auth or state.
These are required rules from [`AGENTS.md`](../../AGENTS.md); the process is in [`process.md`](process.md).

## Client and server

How it works — [containers](../architecture/2.containers.md) and
[data flows](../architecture/dynamic.md).

- **Avoid Server Components.** Only files Next.js cannot work without stay on the server: the
  root `src/app/layout.tsx` (html/body, fonts, metadata, providers) and the thin routing files
  `page.tsx` and `not-found.tsx`. They contain no hooks, data loading or logic: only a view
  re-export and static `metadata`. Error boundaries are client-side: `error.tsx`
  (`"use client"` and a re-export of the `error` view) and `global-error.tsx` — it replaces a
  crashed root layout, so it renders html and body itself and loads `globals.css`, fonts and
  the theme (no header or data). Besides them, `src/app` holds static metadata files without
  data loading (`robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.jpg`, icons), the
  `globals.css` theme and the `fonts.ts` font module.
- **Exceptions — server rendering (decision 23).** The profile page `/<username>` loads the
  profile on the server: `ProfilePage` and `generateMetadata` from
  `@/views/profile/index.server` (`ui/profile-page.server.tsx`) read it with an entity server
  function through `createSupabasePublicClient()` and pass it to the client `ProfileView`. The
  legal pages `/privacy` and `/terms` (their views and the `legal-document` widget) are server
  components without `"use client"`. New exceptions need the user's approval.
- Everything else is client components. `"use client"` is required in UI files of `views`
  slices (the client tree boundary) and in modules imported by `src/app` (providers, for example).
- **HTTP entry points of server logic are Route Handlers `src/app/api/**/route.ts`** (apart
  from the server rendering above). Data work lives in entity server functions. The client
  gets data only through these routes: `apiClient` and TanStack Query.
- Do not use Server Actions, data loading in server components, `proxy.ts` (the former
  `middleware.ts` in Next.js 16) or `generateMetadata` beyond the exceptions above. New ones
  need the user's approval (see stage G in `docs/PLAN.md`).
- The client never calls Supabase directly. `@supabase/*` is imported only in
  `src/shared/api/supabase/` (Biome enforces this); other server code takes clients and types
  from `@/shared/api/index.server`. Supabase keys live only in server env, without `NEXT_PUBLIC_`.
- Server modules start with `import "server-only";` and are exposed only through the
  `index.server.ts` of their slice or segment.
- A route handler does HTTP only: session, zod validation, status codes. Data work goes to
  entity server functions (`@/entities/<slice>/index.server`).
- Route handler helpers live in `@/app/api/_lib`: wrap the handler in `withErrorHandling`,
  return success through `jsonOk<T>(data)`, an expected error through
  `throw new HttpError(status, code, message)`, read the body with
  `parseJsonBody(request, schema)` and the query with `parseSearchParams(request, schema)`
  (a validation error becomes a 400 with `fields`). An image from `multipart/form-data` (field
  `file`) is read by `readImageUpload(request, { maxBytes, maxDimension, noun })`: format by
  signature, 413 for size, 400 for format and dimensions.
- Wrap every route in `withErrorHandling`: it also rejects a mutating request from another
  site (CSRF protection). Do not write routes without it.
- A route with a session starts with `const { supabase, claims } = await requireUser()` from
  `@/app/api/_lib`: without a session it is a 401, and a refreshed session is written to
  cookies. Then work through this `supabase` (RLS applies). Public routes without a session read
  data through `createSupabasePublicClient()` (the `anon` role, no cookies).
  `createSupabaseAdminClient()` bypasses RLS, so it is only for service operations such as
  account deletion and rate limit counters.
- Limit guessing-prone public routes with `enforceRateLimits(rules, field?)` from
  `@/app/api/_lib`: counters live in the database (`consume_rate_limit`), shared by all server
  instances, keyed by a scope and an HMAC of the subject (`getClientIp(request)`, a page
  address); a cookie is never the only protection. Over the limit it throws 429
  `too_many_requests` with `Retry-After`, and with `field` the message also goes to that form
  field.
- Entity server functions take a `SupabaseClient` from `@/shared/api/index.server` and do not
  throw `HttpError` (the `app` layer is out of their reach). An expected outcome such as a taken
  username is returned as `{ ok: false, reason }`, and the route turns it into a status code.
- Responses with user data carry `Cache-Control: private, no-store` (`NO_STORE_HEADERS` from
  `@/app/api/_lib`).
- Routes the browser reaches by navigation rather than through `apiClient`
  (`/api/auth/sign-in`, `/api/auth/callback`, `/api/auth/callback/[provider]`) respond with a
  redirect, not JSON. Build redirects with `redirectTo`, after sign-in with
  `redirectAfterSignIn`; send errors to the sign-in page with `redirectToLogin(origin, code, next)`
  and the result of linking a sign-in method to the Account section of settings with
  `redirectToSettings`. Error codes and texts live in `entities/viewer/config/auth-errors.ts`.
- Supabase session cookies are `httpOnly`: the browser cannot read them; only API routes see
  the session.
- Enabled sign-in providers are listed in `enabledAuthProviders`
  (`entities/viewer/config/auth-providers.ts`): only their buttons show on `/login`, and
  `/api/auth/sign-in` sends the rest to `auth_unavailable`. When enabling a provider in the UI,
  add it there after configuring sign-in.
- Google and Telegram sign in and link without Supabase OAuth (decision 27): `GOOGLE_*` and
  `TELEGRAM_*` are required, the shared code is `oidc-sign-in.server.ts`, the flow is in the
  [dynamic view](../architecture/dynamic.md#sign-in-with-google-and-telegram). Linked sign-in
  methods are read by `getLinkedIdentities` through `auth.getUser()`: identities are not in the JWT.
- API error format: `{ "error": { "code": string, "message": string, "fields"?: Record<string, string> } }`
  plus the right HTTP status. Codes: `bad_request` and `validation_error` (400), `unauthorized`
  (401), `forbidden` (403), `not_found` (404), `conflict` (409), `version_conflict` (409: the
  profile was saved after the form opened), `payload_too_large` (413), `too_many_requests`
  (429), `internal_error` (500). On the client `ApiError` also has `network_error` (status 0: no
  network or no response for over 30 s, file uploads 120 s) and `unexpected_response`. Write
  `message` for the user, in English.
- Server code imports only types from `@/shared/api` (`import type`): the module is
  client-side and pulls in TanStack Query.
- Pass a redirect path from `?next=` only through `getSafeRedirectPath` from
  `@/shared/lib/safe-redirect` — open redirect protection.
- Read server environment variables only through `getServerEnv()` from
  `@/shared/config/index.server`. Add a new variable to its zod schema and to `.env.example`.

## State and data

- Everything that came from `/api` is server state and lives only in TanStack Query. Query key
  factories sit in the entity's `api` segment. Mutations invalidate or update related queries.
- Zustand holds only client state: UI and form drafts. Do not copy server data into a store.
  A store lives in the slice's `model` segment.
- Local component state — `useState`.
- The current user — `useViewerQuery()` from `@/entities/viewer`: a guest is `null`, not an
  error. A private page wraps its content in `ViewerGuard` with the right `access`: it shows a
  skeleton while the session is checked and redirects if the page is not available to the
  user. Client-side protection is UX; API routes check data access.
- After sign-out the page fully reloads to the home page: this resets the query cache and the
  user state.
- From the browser, go only through `apiClient` from `@/shared/api` (`get`, `post`, `patch`,
  `delete`), without direct `fetch` in components.
- Describe queries with `queryOptions(...)` factories in the slice's `api` segment and pass
  `signal` from `queryFn` to `apiClient`. QueryClient settings: `staleTime` 60 s, 4xx errors
  are not retried.
