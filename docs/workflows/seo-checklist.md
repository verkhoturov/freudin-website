# SEO checklist

Check markup against it when building any UI (rule 8 of [`process.md`](process.md)). If SEO
can be improved, suggest the changes to the user as a separate item in your answer. Changes
that would depart from the [`AGENTS.md`](../../AGENTS.md) rules (server rendering of data,
`generateMetadata`) are only suggested, not made.

- The page has meaningful `title` and `description`: the view's static `metadata` or the root
  layout template.
- There is exactly one `<h1>`, and heading levels go in order without gaps.
- Semantic tags are used: `header`, `nav`, `main` (there is one, already in the root layout),
  `article`, `section`, `aside`, `footer`; enumerations are lists.
- Links use `next/link` with clear text; buttons without text have an `aria-label`.
- Images have a meaningful `alt` (empty for decorative ones) and set dimensions (`next/image`).
- The domain and base settings live in `siteConfig` (`url: "https://www.freud.in"`, while
  `freud.in` redirects to `www`). The root layout sets `metadataBase`, default Open Graph and
  the Twitter card.
- A page that sets its own `openGraph` replaces the layout's object entirely (the merge is
  shallow), so repeat the needed default fields in it. The `opengraph-image.jpg` image is lost
  with it too: in `generateMetadata` take it from `(await parent).openGraph?.images`.
- `opengraph-image.jpg` is drawn in brand colours: the `freud.in` logo and subtitle in the
  centre. The centre matters: messengers crop the small preview to a square, X to 2:1. When
  changing the palette, the logo or `siteConfig.description`, redraw the image and update its alt.
- The default preview image is `src/app/opengraph-image.jpg` (1200×630). Its alt is in
  `opengraph-image.alt.txt` without a trailing newline: Next.js does not trim it.
- A public page has `alternates: { canonical: routes.<page> }` and is listed in `publicPages`
  in `src/app/sitemap.ts`.
- Service and private pages are not indexed: their `metadata` has
  `robots: { index: false, follow: true }` (currently `/login`, `/onboarding` and `/settings`).
  Do not block them in `robots.txt`, otherwise search engines will not see `noindex`.
- Content important for search and link previews must reach the server HTML. Profile pages
  and legal texts are server-rendered, other data loads on the client: discuss a new public
  page with data with the user (stage G in `docs/PLAN.md`).
