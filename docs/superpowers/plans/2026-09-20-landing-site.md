# Landing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A public multi-page marketing site in `apps/landing`, built from `@repo/ui`, following `apps/web/DESIGN.md` section 12.

**Architecture:** Statically rendered Next 16 App Router app. Every page sits in a `(site)` route group that supplies the floating header and the footer. All copy lives in `src/lib/content/*.ts`; blog posts are MDX files imported dynamically by slug. Interactive demos are client components that feed example data into the real shared components.

**Tech Stack:** Next 16.3.4, React 19.2.8, Tailwind v4, `@repo/ui` (source package), `motion`, `react-hook-form` + `zod`, `sonner`, `lucide-react`, `@next/mdx`.

**Spec:** `docs/superpowers/specs/2026-09-20-landing-site-design.md`. Design rules: `apps/web/DESIGN.md`.

## Global Constraints

- Semantic tokens only. No hex or palette class in a component. Example brand hexes live in `src/lib/content/brands.ts` as data and reach components through `brandStyle(hex)` and `PostArt`'s `brand` prop.
- Brand colour as text is `text-tint-foreground` or `text-brand-ink`, never `text-primary`.
- Type classes only: `type-display` (once per page at most), `type-title`, `type-heading`, body, `type-label`, `type-number`. Sentence case. No eyebrow labels, no monospace, no emphasised word in a headline.
- Width `max-w-5xl`, gutters `px-4 md:px-6`, sections `mt-24 md:mt-32`. Left-aligned. Body lines `max-w-[52ch]` to `max-w-[62ch]`. Nothing scrolls horizontally at 390px; shrinking flex/grid children get `min-w-0`.
- Cards are `bg-card shadow-raised` with no border, `rounded-xl`. `material` only on the header. Two shadows only.
- Motion: `spring.*` from `@repo/ui/lib/motion`, `transform` and `opacity` only. The re-tint demo is the only thing that moves unprompted. No scroll reveals, no hover lift.
- Copy: plain words, active voice, no exclamation marks, no "supercharge/unleash/revolutionise/10x", no middle dots, no arrows in link text, no emoji.
- Never hardcode the product name; import `APP_NAME` from `@/lib/site`.
- No `prefers-color-scheme` queries; use the `dark:` variant.
- A page file exports only its default component plus Next's own exports (`metadata`, `generateStaticParams`, `generateMetadata`, `dynamicParams`).
- Read the relevant guide in `apps/landing/node_modules/next/dist/docs/` before using any Next API (AGENTS.md).
- `pnpm run <script>` hangs here. Run binaries directly: `./node_modules/.bin/tsc --noEmit`, `./node_modules/.bin/eslint . --max-warnings 0`, `./node_modules/.bin/next build`.
- Write files with the Write/Edit tools, never shell heredocs.
- No test runner exists in the repo and the registry is very slow, so none is added. Verification is types, lint, build and a real browser.
- No git commits unless the user asks.

## File structure

```
apps/landing/
  package.json, next.config.ts, tsconfig.json, eslint.config.mjs   (modified)
  package-lock.json                                                (deleted)
  src/mdx-components.tsx
  src/app/layout.tsx, globals.css, providers.tsx
  src/app/not-found.tsx, sitemap.ts, robots.ts, opengraph-image.tsx
  src/app/(site)/layout.tsx
  src/app/(site)/page.tsx
  src/app/(site)/{how-it-works,services,pricing,about,contact,privacy,terms}/page.tsx
  src/app/(site)/blog/page.tsx, blog/[slug]/page.tsx
  src/components/site-header.tsx, site-footer.tsx, logo.tsx
  src/components/section.tsx, url-form.tsx, faq.tsx, prose.tsx
  src/components/retint-demo.tsx, approval-demo.tsx, loop-section.tsx, results-strip.tsx
  src/components/pricing-table.tsx, contact-form.tsx, legal-page.tsx
  src/lib/site.ts, blog.ts
  src/lib/content/brands.ts, posts.ts, pricing.ts, services.ts, faq.ts, company.ts, legal.ts, loop.ts
  src/content/blog/*.mdx
```

---

### Task 1: Workspace wiring and app shell

**Files:** modify `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`; delete `package-lock.json`, `public/*.svg`, scaffold `src/app/page.tsx`; create `src/app/providers.tsx`, `src/lib/site.ts`.

**Produces:** `APP_NAME: string`, `APP_URL: string`, `SITE_URL: string`, `signUpUrl(url?: string): string`, `signInUrl: string`, `normalizeUrl(input: string): string | null`, `NAV: { href: string; label: string }[]` from `@/lib/site`.

- [ ] **Step 1: `package.json`.** Name `landing`, `"type": "module"`, scripts `dev` (`next dev --port 3001`), `build`, `start`, `lint` (`eslint --max-warnings 0`), `check-types` (`next typegen && tsc --noEmit`). Dependencies at the exact ranges `apps/web` uses: `@hookform/resolvers ^5.9.1`, `@repo/ui workspace:*`, `lucide-react ^1.47.0`, `motion ^13.4.0`, `next 16.3.4`, `react 19.2.8`, `react-dom 19.2.8`, `react-hook-form ^7.88.0`, `sonner ^2.0.8`, `zod ^4.6.1`. Dev: `@repo/eslint-config workspace:*`, `@repo/typescript-config workspace:*`, `@tailwindcss/postcss ^4.3.3`, `@types/node 26.4.1`, `@types/react 19.2.18`, `@types/react-dom 19.2.5`, `eslint 10.9.1`, `postcss ^8.5.28`, `tailwindcss ^4.3.3`, `typescript 7.0.2`. Drop `babel-plugin-react-compiler` and `eslint-config-next`: `apps/web` does not use the compiler and `SwipeCard` writes a ref during render.
- [ ] **Step 2:** Delete `package-lock.json` and the npm-installed `node_modules`, then from the repo root run `pnpm install --offline`. Expected: links from the store with no network. If a package is missing from the store, rerun without `--offline` in the background.
- [ ] **Step 3: config.** `next.config.ts`: `transpilePackages: ["@repo/ui"]` (MDX is added in Task 6). `tsconfig.json`: extend `@repo/typescript-config/nextjs.json`, keep the `next` plugin, `strictNullChecks`, `paths {"@/*": ["./src/*"]}`. `eslint.config.mjs`: spread `nextJsConfig` from `@repo/eslint-config/next-js`.
- [ ] **Step 4: `src/lib/site.ts`.**

```ts
export const APP_NAME = "Cadence";

/** Where the product itself runs. Sign-in, sign-up and the URL form all lead here. */
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
/** This site's own origin, for the sitemap and canonical URLs. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001").replace(/\/$/, "");

export const signInUrl = `${APP_URL}/sign-in`;
export const signUpUrl = (url?: string) =>
  url ? `${APP_URL}/sign-up?url=${encodeURIComponent(url)}` : `${APP_URL}/sign-up`;

export const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

/** Accepts "acme.com" as well as a full URL; returns null when it can't be a site. */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!url.hostname.includes(".")) return null;
    return url.origin + (url.pathname === "/" ? "" : url.pathname);
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: `globals.css`, `providers.tsx`, `layout.tsx`.** Mirror `apps/web/app/layout.tsx` without Clerk or React Query: both fonts with the same options and variables, `import "@repo/ui/styles.css"` then `./globals.css` (a comment-only file, as in `apps/web`), `THEME_SCRIPT` in `<head>`, `suppressHydrationWarning`, `metadataBase: new URL(SITE_URL)`, title template `%s | ${APP_NAME}`, the same `viewport`. `providers.tsx` is a client component: `<MotionConfig reducedMotion="user">` plus the `Toaster` copied with its classNames from `apps/web/app/providers.tsx`.
- [ ] **Step 6: verify.** Temporary `(site)/page.tsx` rendering `<h1 className="type-display">{APP_NAME}</h1>` and a `Button`. Run `tsc --noEmit`, then `next dev --port 3001`, open in a browser: fonts, iris pill button, grey paper background. This proves Tailwind sees the package.

### Task 2: Header, footer, section primitives, URL form

**Files:** create `src/components/logo.tsx`, `site-header.tsx`, `site-footer.tsx`, `section.tsx`, `url-form.tsx`, `src/app/(site)/layout.tsx`.

**Produces:**
- `Logo()`; `SiteHeader()`; `SiteFooter()`.
- `Section({ title, lead, children, className, id }: { title: string; lead?: string; children?: ReactNode; className?: string; id?: string })`: `<section className="mt-24 md:mt-32">`, `<h2 className="type-title">`, lead as `mt-3 max-w-[58ch] text-muted-foreground`, children in `mt-8`.
- `PageIntro({ title, lead })`: `<h1 className="type-title">` plus muted lead, `pt-10 md:pt-16`.
- `UrlForm({ className }: { className?: string })`: on submit `window.location.assign(signUpUrl(normalized))`.

- [ ] **Step 1: `logo.tsx`.** Same markup as `Logo` in `apps/web/components/shell/top-bar.tsx`, with `APP_NAME` from `@/lib/site`.
- [ ] **Step 2: `site-header.tsx`** (client). `header.sticky top-0 z-40 px-3 pt-3 md:px-5` > `div.material mx-auto flex h-14 max-w-5xl items-center gap-2 rounded-full pr-2 pl-4`. Left: `Logo`. Middle, `max-md:hidden`: `NAV` links as `rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground`, with `aria-current="page"` and `text-foreground` when `usePathname()` starts with the href. Right (`ml-auto`): `ThemeMenu`, `Button variant="ghost" size="sm" asChild` to `signInUrl` (`max-sm:hidden`), `Button size="sm" asChild` to `signUpUrl()` labelled "Get started", and below `md` a `Button variant="ghost" size="icon-sm" aria-label="Menu"` that opens a `Sheet title="Menu"` listing `NAV`, About, Contact and Sign in as full-width rows; choosing one closes the sheet.
- [ ] **Step 3: `site-footer.tsx`.** `footer.mx-auto mt-24 max-w-5xl px-4 pb-10 md:mt-32 md:px-6`, a `border-t border-border pt-8`, `Logo` and one muted sentence on the left, then three link groups (Product: How it works, Services, Pricing. Company: About, Blog, Contact. Legal: Privacy, Terms) as `type-label` links with `hover:text-foreground`. Last line: `© {year} {company.legalName}`.
- [ ] **Step 4: `url-form.tsx`.** Copy of `apps/web/components/onboarding/url-form.tsx` with `normalizeUrl` from `@/lib/site`, label "Your website", placeholder "yourbusiness.com", empty message "Enter your website to get started.", invalid message "That doesn't look like a website. Try something like acme.com.", button "Read my site".
- [ ] **Step 5: `(site)/layout.tsx`.** `SiteHeader`, `<main className="mx-auto max-w-5xl px-4 md:px-6">{children}</main>`, `SiteFooter`.
- [ ] **Step 6: verify** in the browser at 1440 and 390: header floats, sheet menu opens and closes, theme menu switches, no horizontal scroll.

### Task 3: Content data

**Files:** create every file in `src/lib/content/`.

**Produces:**

```ts
// brands.ts
import type { BrandKit } from "@repo/ui/components/social/types";
export interface ExampleBrand { id: string; name: string; kind: string; accent: string; kit: BrandKit; hooks: [string, string, string]; }
export const BRANDS: ExampleBrand[]; // kiln (terracotta #C2603C), brightside dental (blue #2F6FDE), sunny side cafe (yellow #F2C230), harbour legal (navy #1B2A4E); 4 kit colours each

// posts.ts
import type { Post } from "@repo/ui/components/social/types";
export const DEMO_POSTS: (Post & { id: string })[]; // 4 posts for the approval stack, written for BRANDS[0], scheduledFor fixed ISO strings
export const retintPosts: (brand: ExampleBrand) => Pick<Post, "hook" | "format" | "art">[]; // 3 posts: image, carousel, reel, using brand.hooks

// loop.ts
export const LOOP_STEPS: { stage: LoopStage; title: string; body: string }[]; // six, same order as LOOP in loop-track

// pricing.ts
export interface Plan { id: string; name: string; price: string; cadence: string; summary: string; cta: string; }
export const PLANS: Plan[]; // Starter, Growth, Managed
export const PLAN_ROWS: { label: string; values: (string | boolean)[] }[]; // one value per plan
export const PRICING_FAQ: QA[];

// faq.ts
export interface QA { q: string; a: string; }
export const FAQ: QA[];

// services.ts
export const SERVICES: { id: string; title: string; body: string; points: string[] }[];

// company.ts
export const company: { legalName: string; email: string; location: string; story: string[]; principles: { title: string; body: string }[] };

// legal.ts
export interface LegalDoc { title: string; updated: string; draftNotice: string; sections: { heading: string; body: string[] }[]; }
export const PRIVACY: LegalDoc; export const TERMS: LegalDoc;

// results (in posts.ts)
export const REACH_TREND: TrendRow[]; // 8 weekly points
```

- [ ] **Step 1:** Write all files with full draft copy in the DESIGN.md section 10 voice. Prices are drafts: Starter $49/month, Growth $149/month, Managed from $600/month. Legal docs carry `draftNotice: "Draft text. Have a lawyer review it before this site goes live."`.
- [ ] **Step 2:** `tsc --noEmit` passes.

### Task 4: Home page and its demos

**Files:** create `retint-demo.tsx`, `approval-demo.tsx`, `loop-section.tsx`, `results-strip.tsx`, `(site)/page.tsx`.

- [ ] **Step 1: `retint-demo.tsx`** (client). State `index`, `auto` (true until a chip is clicked). `useReducedMotion()` from `motion/react`; when reduced, no timer. Timer: `setInterval` every 3200ms advancing `index` while `auto`. Layout: a chip row (`role="radiogroup"`, each chip a `button role="radio" aria-checked`, `pressable rounded-full px-3 py-1.5 text-sm font-medium`, selected `bg-tint text-tint-foreground`, arrow keys move selection), then a `div.brand-scope` with `style={brandStyle(brand.accent)}` holding `grid grid-cols-3 gap-3 md:gap-5` of three cards. Each card is `AnimatePresence mode="popLayout" initial={false}` around a `motion.div key={brand.id + i}` with `initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}` and `transition={{ ...spring.smooth, delay: i * 0.06 }}`, containing `<PostArt post={posts[i]} brand={brand.kit} fixedAspect="aspect-[4/5]" className="rounded-xl shadow-raised" />`. Below: brand name, kind, and a `Button size="sm"` (not a link, `tabIndex={-1} aria-hidden`) reading "Approve" to show the accent moving through the chrome too.
- [ ] **Step 2: `approval-demo.tsx`** (client). Follows `apps/web/app/c/[clientId]/approvals/page.tsx`: `queue` state from `DEMO_POSTS`, `lead = useMotionValue(0)` reset to 0 when the top id changes, `topCard` ref, top three cards rendered in a `relative h-[30rem] w-full max-w-[24rem]` box, wrapped in `brand-scope` with `BRANDS[0]`. `onDecide` removes the top card and sets a `last` decision shown as a `Badge` (`success` "Approved" / `danger` "Rejected"). Buttons under the stack: `Button variant="outline"` "Reject" and `Button` "Approve" calling `topCard.current?.decide(...)`; left and right arrow keys do the same when the stack has focus. Empty queue: `EmptyState` titled "That's the queue cleared." with a `Button variant="secondary"` "Start again" that refills.
- [ ] **Step 3: `loop-section.tsx`** (client). State `stage`. `LoopTrack stage={stage}` inside a `bg-card shadow-raised rounded-xl p-5 md:p-6` panel, then an `ol` of `LOOP_STEPS`, `md:grid-cols-2 gap-x-10 gap-y-6`; each item is a `button` (`text-left`, `aria-pressed`) with a `type-number` index, `type-heading` title and muted body; hover/focus/click sets `stage`, so the marker slides to the step being read.
- [ ] **Step 4: `results-strip.tsx`.** Two-column from `md`: three stats (`type-number text-4xl`, `type-label` under each) and a panel with `TrendChart rows={REACH_TREND} metric="Reach" formatValue={formatCompact}`. A `type-label` line states these are example numbers.
- [ ] **Step 5: `(site)/page.tsx`.** Hero `pt-12 md:pt-24`: `h1.type-display` "Start with your website.", muted sentence, `UrlForm` at `max-w-xl`, a `type-label` line "Nothing is published until you approve it." Then `Section`s: "It becomes your brand" + `RetintDemo`; "How it works" + `LoopSection` + link to `/how-it-works`; "Nothing goes out without you" as two columns (text and three short paragraphs left, `ApprovalDemo` right); "It learns what works" + `ResultsStrip`; closing `Section` "Start with your website." + `UrlForm`. `metadata` with title and description.
- [ ] **Step 6: verify** in the browser: the re-tint cycles and stops on chip click; cards drag and throw; both themes; 390px; reduced motion shows no auto-cycle.

### Task 5: Static pages

**Files:** create `faq.tsx`, `pricing-table.tsx`, `contact-form.tsx`, `legal-page.tsx` and the seven page files.

- [ ] **Step 1: `faq.tsx`.** `Faq({ items }: { items: QA[] })`: a `divide-y divide-border` list of native `<details>` with `summary` as `flex cursor-pointer items-center justify-between gap-4 py-4 font-medium` plus a `ChevronDown` that rotates with `group-open:rotate-180`, answer `pb-5 max-w-[62ch] text-muted-foreground`. Native details needs no JS and is keyboard accessible.
- [ ] **Step 2: `pricing-table.tsx`.** From `md`: one `bg-card shadow-raised rounded-xl` panel containing a `<table>` with plan names, price (`type-number text-3xl`), cadence and a CTA per column header, `PLAN_ROWS` as rows with `border-t border-border`, booleans as a `Check` in `text-success` or a muted "Not included" (`sr-only` text plus a dash). Exactly one `default` button (Growth); the others `secondary`. Below `md`: each plan as its own card listing its rows. No ribbon, no glow.
- [ ] **Step 3: `contact-form.tsx`** (client). zod schema: `name` min 1 "Enter your name.", `email` "Enter an email address like name@business.com.", `website` optional but validated with `normalizeUrl` when present, `message` min 10 "Tell us a little more, a sentence or two is enough." Fields use `Form*`, `Input`, `Textarea`. Button "Send message", disabled until dirty, spinner inside while sending. `sendContactMessage(values)` in the same file is the seam: it awaits 600ms and resolves. On success `toast("Sent")` and reset; on failure `toast("That didn't send. Try again, or email " + company.email)`.
- [ ] **Step 4: pages.** Each starts with `PageIntro` and exports `metadata`.
  - `how-it-works`: six `LOOP_STEPS` as alternating two-column rows, each with a real component beside the text (UrlForm-style field mock is not allowed; use: 1 `PostArt` swatches of the brand kit colours, 2 a plain list of content pillars, 3 `PostArt`, 4 `ApprovalDemo`, 5 a short schedule list with `PlatformIcon` and `StatusBadge`, 6 `TrendChart`). Then `Section` "Questions" + `Faq items={FAQ}`, then the closing `UrlForm`.
  - `services`: `SERVICES` as left-aligned sections, `type-heading`, body, and `points` as a plain `ul`. Closing "Talk to us" `Button asChild` to `/contact` (secondary) beside "Get started".
  - `pricing`: `PricingTable`, `Section` "Pricing questions" + `Faq items={PRICING_FAQ}`.
  - `about`: `company.story` paragraphs, `company.principles` as three short titled paragraphs.
  - `contact`: two columns from `md`: email and location text, `ContactForm` in a `max-w-xl` card.
  - `privacy`, `terms`: `LegalPage doc={...}` which renders the draft notice in a `bg-warning/14 text-warning rounded-md px-4 py-3` banner, the updated date and sections at `max-w-[62ch]`.
- [ ] **Step 5:** `tsc`, `eslint`, browser pass over each page at both widths.

### Task 6: Blog

**Files:** modify `next.config.ts`, `package.json`; create `src/mdx-components.tsx`, `src/components/prose.tsx`, `src/lib/blog.ts`, `src/content/blog/*.mdx`, `blog/page.tsx`, `blog/[slug]/page.tsx`.

- [ ] **Step 1:** Add `@next/mdx 16.3.4`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx` and run `pnpm install` from the repo root **in the background** (the registry is slow; expect several minutes). Wrap the config with `createMDX()` and set `pageExtensions` per `node_modules/next/dist/docs/01-app/02-guides/mdx.md`.
- [ ] **Step 2: `mdx-components.tsx`** maps `h2` to `type-heading mt-10`, `p` to `mt-4 max-w-[62ch]`, `ul`/`ol`, `a` (`text-tint-foreground underline underline-offset-4`), `blockquote` (`bg-tint rounded-xl p-5`), `strong`.
- [ ] **Step 3: `src/lib/blog.ts`.** A typed registry, because static imports keep the list type-safe and avoid reading the filesystem at runtime:

```ts
export interface PostMeta { slug: string; title: string; summary: string; date: string; minutes: number; }
export const POSTS: PostMeta[] = [/* newest first, three entries */];
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
```

- [ ] **Step 4:** Three MDX posts, 400 to 600 words each: "What an agent should never post without asking", "Your website already contains your brand", "Four weeks of posts, then what: how the loop learns".
- [ ] **Step 5: pages.** `blog/page.tsx`: `PageIntro`, then posts as a `divide-y` list: date (`type-label tabular-nums`, `Tue 22 Sep 2026` format), `type-heading` title link, summary, minutes. `blog/[slug]/page.tsx`: `generateStaticParams` from `POSTS`, `dynamicParams = false`, `generateMetadata`, `const { default: Post } = await import(`@/content/blog/${slug}.mdx`)`, title as `type-title`, a "Back to the blog" link, closing `UrlForm`.
- [ ] **Step 6 (fallback):** If the MDX install cannot complete, write the three posts as `.tsx` components under `src/content/blog/` using the same element classes through `prose.tsx`, import them through a `Record<string, ComponentType>` in `blog.ts`, and tell the user. Everything else in this task is unchanged.

### Task 7: Site plumbing and final verification

**Files:** create `not-found.tsx`, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`; update root `README.md` section for the app if one exists.

- [ ] **Step 1:** `not-found.tsx`: centred (self-contained moment) `type-title` "That page isn't here.", muted line, `Button asChild` "Back to the start". It renders outside `(site)`, so it includes `SiteHeader` itself.
- [ ] **Step 2:** `sitemap.ts` lists every static route plus `POSTS`; `robots.ts` allows all and points at the sitemap. `opengraph-image.tsx` per the bundled metadata docs: paper background, ink headline, the product name; the colours are literals here because `ImageResponse` cannot read CSS variables (comment says so).
- [ ] **Step 3: full check.** `./node_modules/.bin/tsc --noEmit`, `./node_modules/.bin/eslint . --max-warnings 0`, `./node_modules/.bin/next build` in `apps/landing`; `tsc` and `eslint` in `packages/ui` if it was touched.
- [ ] **Step 4: browser check** over every route at 1440px and 390px, light and dark, reduced motion emulated, `document.documentElement.scrollWidth <= innerWidth` at 390px on every route, tab through the header, forms and approval stack.
- [ ] **Step 5:** Report to the user what is draft content (prices, legal, company details, blog posts) and where to edit it.
