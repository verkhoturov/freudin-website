# UI kit: shadcn components and Storybook

Read when adding a shadcn component, a Storybook story or a new visual element.
Form, style and theme rules are in [`ui.md`](ui.md).

## shadcn components

- shadcn/ui on **Radix** (composition through `asChild`): `radix-nova` style, Geist font,
  lucide icons; our tokens replaced the neutral shadcn palette. Components live in
  `src/shared/ui` and are added with `npx shadcn add <component>` (aliases in
  `components.json`). Edit shadcn files only when needed.
- After `npx shadcn add` or `npx shadcn apply`, check three things. First, rebuild the lock
  file with npm 11 (rule 6 of [`process.md`](process.md)). Second, the CLI overwrites
  components: if `npm run lint:fix` finds errors in them, fix them in place (as in `field.tsx`
  and `input-group.tsx`). The CLI writes class variants with `class-variance-authority`: switch
  the `cva` and `VariantProps` import to `@/shared/lib/cva` (same API) and remove that
  dependency from `package.json`. Third, `apply` may add fonts to `src/app/layout.tsx`: move
  them to `src/app/fonts.ts`; Geist must keep `subsets: ["latin", "cyrillic"]`.
- Before running it, save the original versions of the affected components, `package.json`
  and the lock file outside the repository, including existing uncommitted changes (rules 6
  and 10 of `process.md`). If the CLI offers to overwrite the installed `button`, `input`,
  `dialog`, decline: they contain project fixes. If a non-interactive install requires
  `--overwrite`, generate the component in a temporary copy of the project with the same
  shadcn settings, then move over only the needed new files and dependencies. Do not restore
  components from HEAD. After installing, compare the result with the snapshot: the original
  changes must survive.

## Storybook

- The kit runs with `npm run storybook` and is published at `freudin-storybook.vercel.app`: a
  separate Vercel project, rebuilt on every commit to `main`, opened only under the owner's
  Vercel account.
- Stories sit next to the component: `src/shared/ui/<component>.stories.tsx`. Titles —
  `Components/…` for shadcn, `Freudin/…` for our own, `Foundations/Tokens` — palette,
  typography, widths and spacing, radii (`tokens.stories.tsx`).
- Widget stories go in the widget's `ui` segment
  (`src/widgets/profile-card/ui/profile-card.stories.tsx`), titled `Widgets/…`; screens the same
  way in the view's `ui`, `Views/…`. Data comes from fixtures in the story itself. A widget
  with TanStack Query gets its own `QueryClientProvider` from the story: API requests do not
  work in the kit.
- **A new component in `shared/ui` comes with a story**, a new colour token — with an entry
  in `tokens.stories.tsx`.
- **A new visual element outside `shared/ui`** (in `widgets`, `entities`, `views`: a new kind
  of block, variant or state) — offer the user to show it in the kit. If not now, add a «show
  in Storybook» item naming the element to the matching stage card and update the
  `docs/PLAN.md` index per [`plan-step.md`](plan-step.md).
- Story texts are in English, like the site.
- Settings are in `.storybook/`: `preview.tsx` loads `globals.css`, the fonts from
  `src/app/fonts.ts` and the theme through next-themes (the Storybook toolbar).
