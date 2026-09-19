# Landing site design

Date: 2026-09-20. App: `apps/landing`. Approved in chat by the user.

## Goal

A public marketing site for the social media agent, built on `@repo/ui` so it is the same product seen from outside. `apps/web/DESIGN.md` is binding, section 12 in particular. "Attractive" is achieved with live product components and one bold moment (the brand re-tint), not with gradients, scroll effects or a separate marketing look.

## Decisions

- Statically rendered Next 16 App Router site. No auth, no data fetching.
- Accent is the default iris. No new colour, font, radius, shadow or animation style.
- Blog is MDX files in the repo (`src/content/blog/*.mdx`), set up per the Next docs bundled in `node_modules/next/dist/docs/`. Three starter posts. No RSS, no CMS.
- Copy the user has not supplied (prices, services, company details, legal text, blog posts) is written as realistic drafts and kept in `src/lib/content/*.ts` and the MDX files. Invented prices and legal text are flagged to the user at hand-off.
- `APP_NAME` and `APP_URL` live in `src/lib/site.ts`. `APP_URL` reads `NEXT_PUBLIC_APP_URL`, default `http://localhost:3000`. The name is never hardcoded elsewhere.
- The URL form and "Get started" go to `${APP_URL}/sign-up?url=<encoded>`; "Sign in" goes to `${APP_URL}/sign-in`.
- The contact form is `react-hook-form` + `zod`. No backend exists, so submit validates, shows a "Sent" toast and calls a single `sendContactMessage` function that is the seam for a real endpoint.
- The app becomes a pnpm workspace member: remove `package-lock.json`, add `@repo/ui: workspace:*`, and pin shared dependencies (`motion`, `react-hook-form`, `zod`, `lucide-react`, `sonner`, React, Next) to the versions `apps/web` uses so pnpm links one copy.

## Pages

| Route | Content |
|---|---|
| `/` | `type-display` headline, one muted sentence, URL form; brand re-tint demo; the loop; swipeable approval stack; results strip with `TrendChart`; closing URL form |
| `/how-it-works` | The six loop steps (read, plan, draft, you approve, publish, learn), each with the real component beside it; FAQ |
| `/services` | What the agency does, managed versus self-serve, as left-aligned sections. No icon-card grid |
| `/pricing` | Plain comparison table, card list below `md`; pricing FAQs |
| `/blog`, `/blog/[slug]` | Post list and article pages, statically generated from MDX |
| `/about` | Who is behind the product |
| `/contact` | Contact form |
| `/privacy`, `/terms` | Draft legal text |
| other | `not-found`, `sitemap.ts`, `robots.ts`, per-page metadata, an OG image |

## Structure

- `src/app/layout.tsx`: fonts as `--font-display-face` and `--font-body`, `THEME_SCRIPT` in `<head>`, `suppressHydrationWarning`, providers (`MotionConfig reducedMotion="user"`, sonner `Toaster`).
- `src/app/globals.css`: imports `packages/ui/src/styles/globals.css` and adds `@source` for `packages/ui/src`.
- `src/app/(site)/layout.tsx`: site header and footer around every page.
- `src/components/`: `site-header` (floating `material` bar: logo, nav links, `ThemeMenu`, "Sign in" ghost, "Get started" default; links move into a `Sheet` on phones), `site-footer` (`type-label` links), `url-form`, `retint-demo`, `approval-demo`, `loop-section`, `results-strip`, `pricing-table`, `faq`, `contact-form`, `prose` (MDX element styles using the type classes).
- `src/lib/content/`: `brands.ts` (four example brands, one light yellow and one dark navy included), `posts.ts` (example posts for demos), `pricing.ts`, `services.ts`, `faq.ts`, `company.ts`, `legal.ts`.
- `src/lib/blog.ts`: lists MDX posts and their metadata.

## The re-tint demo

Three `PostArt` cards inside a `brand-scope` wrapper with `brandStyle(hex)`. The active brand advances on a timer through the four example brands; a row of brand chips lets the visitor pick one, which stops the timer. Transitions use `spring.smooth`, only `transform` and `opacity`. With reduced motion the change is a cross-fade and the timer does not run. It is the only thing on the site that moves on its own.

## States and errors

Static pages have no loading or error states. The URL form and contact form validate inline with a message that says how to fix the input. Unknown routes and unknown blog slugs render `not-found`.

## Verification

`tsc --noEmit`, `eslint` and `next build` run directly from `node_modules/.bin` (`pnpm run` hangs in this environment). Then a real browser at 1440px and 390px, light and dark, reduced motion on, no horizontal scroll at 390px, keyboard reachability with visible focus.

## Out of scope

Real contact backend, CMS, RSS, analytics, i18n, final product name and logo, real prices and legal text.
