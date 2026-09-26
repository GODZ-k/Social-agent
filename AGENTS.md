# AGENTS.md

Guidance for any coding agent working in this monorepo. Each app has its own `AGENTS.md` with the rules for that app; read it before working there.

## Project documents (`docs/`)

All project documents live in `docs/`. Read `docs/MEMORY.md` first in every session (`CLAUDE.md` auto-loads it). Then, as needed: `docs/PRD.md` (what we are building and for whom), `docs/ARCHITECTURE.md` (the system as built), `docs/API_SPEC.md` (the live HTTP API), `docs/SECURITY.md` (threat model, the SSRF and prompt-injection boundaries, secrets), `docs/TASKS.md` (roadmap board: priority, status, progress), `docs/LESSION.md` (lessons learned — add to it when something costs time twice), `docs/DESIGN.md` (the design system; web, landing and `packages/ui` all follow it), `docs/DESIGN_TRACKER.md` (every frontend screen from design to code: ID, route, design link, approval, Stitch, coded; update it with every design, approval or coding step). Rules live in this file and the per-app `AGENTS.md`. Detailed specs and plans are under `docs/superpowers/`.

## Where things are

| Path | What |
|---|---|
| `apps/web` | The product: Next.js app for clients and admins. Start with `apps/web/AGENTS.md` and `docs/DESIGN.md` |
| `apps/landing` | The public marketing site. Follows the same design system (`docs/DESIGN.md`, section 12) |
| `apps/api` | Express + Mastra API. Start with `apps/api/AGENTS.md` |
| `packages/ui` | The shared design system (`@repo/ui`): tokens, components, motion, theme |
| `packages/db` | Drizzle schema, migrations and the Postgres connection (`@social-agent/db`). Postgres is hosted on Neon; see `apps/api/AGENTS.md` |
| `packages/agents` | The product agents' know-how (`@social-agent/agents`): every built agent as a factory (the app passes the model and tools), the skills in `skills/<name>/SKILL.md`, `generateStructured`; agents take the shared `BrandContext` as input. Reused outside Cadence (client SEO work), so it never imports app code. Not the same as `.agents/skills`, which are Claude Code skills for building the repo |
| `packages/social-connect` | Connecting social accounts (`@social-agent/social-connect`): one provider per network with authorize URL, code exchange, refresh and profile. No framework, no storage; meant to be published later. Only `apps/api/src/social` calls it |
| `design/<feature>` | Wireframes as static HTML built from `packages/ui` tokens (`python design/<feature>/build.py`), for review in Figma before the feature is built |
| `packages/shared`, `packages/config/*` | Shared zod schemas, and lint/TypeScript configs |

## Agent skills

All skills live at the repo root, whichever app uses them (decided 2026-09-22: one place, loaded no matter which folder Claude Code starts in):

- `.agents/skills/<name>` holds the files. `.claude/skills/<name>` links to them for Claude Code (symlink or junction; on Windows without admin rights use `New-Item -ItemType Junction`).
- `skills-lock.json` records where each installed one came from.
- Here now (pruned 2026-09-23 to what the code uses): `apple-design` and `frontend-design` (web, landing, ui); `vercel-react-best-practices`, `vercel-composition-patterns` and `web-design-guidelines` (every React component); the Next.js skills (`next-dev-loop` for verifying a change in the running app; `next-cache-components-adoption`, on since 2026-09-24 with every route opted out pending route-by-route adoption; the cache-components optimizer and the partial-prefetching adoption/optimizer for what comes after); `drizzle`, `neon-postgres`, `zod-4` and `turborepo` (the data and build layers); the Clerk skills we use (`clerk` router, `clerk-nextjs-patterns`, `clerk-custom-ui`; no orgs, no Clerk webhooks, no CLI, per `docs/PRD.md`); `mastra` (the API's agents); `graft` (the code graph, use it before grep); `firecrawl-build-scrape` (official, general `/scrape` guidance) and `brand-scan-firecrawl` (ours: how the brand scan uses Firecrawl, verified API facts, the test sites and their expected results); the Stitch pack from `google-labs-code/stitch-skills` (16 skills; `stitch-upload-to-stitch` is the fallback for sending `design/<feature>` screens to Stitch when the Figma MCP call limit is used up, the owner imports them into Figma by hand; needs `STITCH_API_KEY`, and no Stitch MCP is configured); the `caveman` pack (`caveman` reply style, `caveman-review`, `caveman-stats`, `safe-refactor`, `surgical-patch`, `verify-and-stop`, `investigate-first`, `lean-build`, `migration`).
- Before adding a skill, check that the repo actually uses the feature it covers; a skill for an unused feature costs listing tokens every turn and nothing else. Reinstall with `npx skills add` from the root when the feature arrives.

**Using skills is not optional.** The owner installs a skill because they want it used. Every session and every dispatched agent:

1. Loads `caveman` first and replies in that style for the whole session (code, comments, commits and docs stay normal prose, as the skill says).
2. Loads the skills that match the work before writing anything: the three Vercel skills and `next-dev-loop` for `apps/web`; `mastra` for any Mastra file; `brand-scan-firecrawl` for the scan; the Clerk skills for auth.
3. Runs the `code-simplifier` plugin agent over new or changed code before reporting done.
4. Uses `safe-refactor` for restructures, `surgical-patch` for bug fixes, `verify-and-stop` for verification-only passes, `investigate-first` for unclear failures.

**Installing a skill:** always run `npx skills add ...` from the repo root. Running it inside an app creates a second `.agents/skills` and `skills-lock.json` there, which nothing loads.

## Working in this repo

- **Name a value before you pass it** (owner rule, 2026-09-25): `const context = await contextFor(row, lang); const questions = await writeQuestions(context);`, never `writeQuestions(await contextFor(row, lang))`; `const brandFilter = BrandsRepository.reachable(scope, id); ... .where(brandFilter)`. The name is a plain, generic noun for what the function returns (`brand`, `session`, `questions`, `context`, `brandFilter`), so anyone can tell what the value is without opening the function. Inline is fine for zod schema builders, JSX, trivial built-ins, the parts of one `and(eq(...), isNull(...))`, and `Promise.all([...])`. Never move a call out of an `if`, `?:`, `??` or `&&` branch.

- **Design before frontend code** (owner rule, 2026-09-26). Any frontend work (`apps/web`, `apps/landing`, `packages/ui`) starts with a design of the part being built, never with code:
  1. Build the screens as HTML from the real design system (`docs/DESIGN.md`, `packages/ui` tokens and components) in `design/<feature>/`, following the UI/UX rules (`figma-interface`, `frontend-design`, `apple-design`, `web-design-guidelines`).
  2. Every screen is responsive: design and check it at desktop (1440), tablet (768) and phone (390) widths, with no sideways scrolling.
  3. As soon as a design is built, open it in a visible Playwright browser as one review sheet (every screen at 1440, 768 and 390 side by side) so the owner gets one look.
  4. The owner approves or rejects from that look. Rejected: design it again with the next version label ("v2", "v3" …); nothing goes to Stitch. Approved (owner rule, 2026-09-26: upload only after approval): set its row in `docs/DESIGN_TRACKER.md` to approved, delete the versions that were not approved locally, and hand the Stitch upload of the approved screens to a background subagent so the main agent is never blocked. Uploads go to the one Stitch project `330652592731776730` (https://stitch.withgoogle.com/projects/330652592731776730), each screen confirmed on the canvas. Create a new Stitch project only when truly needed, and ask the owner first. Screens uploaded before this rule that were later replaced are removed from Stitch by the owner by hand (the Stitch API cannot delete a screen). Then start coding.
- Package manager is pnpm 11 with Turborepo. Run app scripts with `pnpm --filter <name> run <script>`.
- pnpm blocks dependency install scripts until each is answered under `allowBuilds` in `pnpm-workspace.yaml`. An unanswered one makes every `pnpm run` fail with `ERR_PNPM_IGNORED_BUILDS`.
- A dependency used by `packages/ui` must be declared there at the same version the apps use, so pnpm links a single copy.
