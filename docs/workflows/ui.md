# UI: forms, styles and theme

Read when changing the interface, forms, visual states, the theme or tokens.
These are required rules from [`AGENTS.md`](../../AGENTS.md); the process is in [`process.md`](process.md).

## Forms

- TanStack Form + zod + shadcn `Field` components. react-hook-form conflicts with the React
  Compiler (decision 4).
- Attach the entity schema as the form validator (`validators: { onChange: schema }`); async
  checks (is the address free) — as a field validator with `onChangeAsyncDebounceMs`. Show a
  field error when `meta.isTouched && !meta.isValid`, through `FieldError` and `toFieldErrors`.
- Put `ApiError.fields` from the server into the fields' `errorMap.onSubmit` (path `a.0.b` →
  `a[0].b`): TanStack Form clears such an error itself when the field is fixed.
- One zod schema serves both the form and the API route. It lives in the entity's `model`.

## Styles and UI

- **The design is minimal for now (decision 11):** standard shadcn components without
  customisation and minimal content — only what navigation and input fields need. Add
  decorative elements, illustrations, explanatory text and accent colours only on request.
- Tailwind CSS 4. Theme tokens are CSS variables in `src/app/globals.css`: the light theme in
  `:root`, the dark one in `.dark`. When changing colours, check WCAG AA contrast (normal text
  at least 4.5:1).
- The palette (decision 19) lives in tokens; do not write your own colours in classes. The
  primary button (`Button` without `variant`) is `bg-cta text-cta-foreground` (pink), the
  secondary one `variant="secondary"` (violet). Active controls (checkboxes, slider, focus
  ring) use `primary` and `ring`: pink does not work for them, it gives 2.4:1 on the page
  background. A selected item is `accent`. A link inside text is `text-link`; navigation and
  footer links are not. The toast type shows by colour: `toast.success` — `success`,
  `toast.error` — `error` (the `Toaster` wires them through `richColors`), `toast.info` —
  like a plain toast.
- **Toasts** come from `@/shared/ui/sonner`, not from `sonner` (Biome enforces this): there a
  plain toast stays 4 s, an error or warning 8 s (decision 20), and a toast with the same text
  replaces the previous one instead of stacking. Error text — «Couldn’t … Please try again.»
  or advice on what to do; success has no full stop («Changes saved»).
- **Waiting:** a button with a request is disabled and shows a `Spinner` and text with an
  ellipsis («Saving…», «Deleting…»). Going to a provider shows «Redirecting…» and resets on
  `pageshow` with `persisted` (otherwise Back restores a spinning button from bfcache). A menu
  action that closes immediately (sign-out) shows `toast.loading`. Page data loading is covered
  by skeletons, errors by `ErrorState`.
- **Theme only through tokens** (decision 18). `globals.css` is split into sections: palette
  (primitives, light and dark theme), fonts, typography, sizes and spacing, radii. Page title —
  `font-heading text-page-title`, section title — `font-heading text-section-title`, legal
  document — `text-document-*`. Page content padding — `py-page`, width — the `width` prop of
  `Container` (`site` by default, `form`, `document`, `sign-in`), the profile card —
  `max-w-profile`. Add a new token to `@theme` and to the tokens page of the kit. Do not reuse
  `--spacing-*` names in `--container-*`: `max-w-*` would take the `--spacing-*` value. Raw
  colours (`bg-white`, `text-red-500`, hex) are allowed only in `globals.css`, in brand logos
  (`auth-provider-icon.tsx`) and in image content (background when compressing a photo, QR
  code). Biome does not check Tailwind classes, so search the code for them during review.
- Fonts are loaded only in `src/app/fonts.ts` (Storybook uses it too). Values that cannot use
  CSS variables (`themeColor` in metadata and `manifest.ts` colours) live in
  `shared/config/theme.ts`, noting which token each comes from.
- `globals.css` has two colour layers. Primitives — the `--violet-*`, `--pink-*`,
  `--neutral-*`, `--red-*` scales (50–950): neither components nor `@theme` use them directly.
  Semantic tokens (`--primary: var(--violet-700)`) refer to primitives, and `.dark` overrides
  only the semantics. Take a new colour from a scale. When changing a pair, check contrast in
  both themes: text at least 4.5:1 (including `muted-foreground` on `muted` and `accent`,
  `destructive` on its `/20` tint), `input`, `primary` and `ring` at least 3:1. `border` is
  decorative.
- Combine classes with `cn` from the `cn` package, as the shadcn CLI writes. `cn` removes
  conflicting Tailwind classes but does not know our tokens. So column width comes from the `width` prop of `Container`, not a `max-w-*`
  class in `className`. Do not mix a heading token (`text-page-title`) with a text colour
  (`text-muted-foreground`) in one `cn`: `cn` takes the token for a colour and drops it. Do not
  build class names from parts (`max-w-${x}`): Tailwind will not see them.
- Describe component variants (`variant`, `size`) with `cva` from `@/shared/lib/cva`: our own
  replacement for `class-variance-authority` with the same API.
- The root layout already renders the skip link, the header (`@/widgets/header`), the only
  `<main id="content">` and the footer (`@/widgets/footer`). On `/settings` the header and
  footer are not drawn (they check `usePathname()` themselves): it is a full-screen editor with
  its own sidebar. A view does not create its own `<main>` and aligns content with `Container`
  from `@/shared/ui/container` with `py-page`.
- UI icons are lucide-react, brand logos are SVG in code. Site icons share one design: when
  changing brand colours, update `src/app/icon.svg` and rebuild the PNG and ICO from it
  (including the manifest icons in `public`).
- Mobile-first layout, light and dark themes, accessibility (semantics, aria, focus).

## Related checks

For any UI work, follow the [SEO checklist](seo-checklist.md) (rule 8 of `process.md`).
When adding a shadcn component, a story, a new visual element or a token, also read
[`ui-kit.md`](ui-kit.md): component installation and required stories are described there.
