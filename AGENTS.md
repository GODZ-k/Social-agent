# AGENTS.md

Guidance for any coding agent working in this monorepo. Each app has its own `AGENTS.md` with the rules for that app; read it before working there.

## Where things are

| Path | What |
|---|---|
| `apps/web` | The product: Next.js app for clients and admins. Start with `apps/web/AGENTS.md` and `apps/web/DESIGN.md` |
| `apps/landing` | The public marketing site. Follows the same design system (`apps/web/DESIGN.md`, section 12) |
| `apps/api` | Express + Mastra API. Start with `apps/api/AGENTS.md` |
| `packages/ui` | The shared design system (`@repo/ui`): tokens, components, motion, theme |
| `packages/db` | Drizzle schema, migrations and the Postgres connection (`@social-agent/db`). Postgres is hosted on Neon; see `apps/api/AGENTS.md` |
| `packages/shared`, `packages/config/*` | Shared zod schemas, and lint/TypeScript configs |

## Agent skills

All skills live at the repo root, whichever app uses them (decided 2026-09-22: one place, loaded no matter which folder Claude Code starts in):

- `.agents/skills/<name>` holds the files. `.claude/skills/<name>` links to them for Claude Code (symlink or junction; on Windows without admin rights use `New-Item -ItemType Junction`).
- `skills-lock.json` records where each installed one came from.
- Here now: `apple-design` and `frontend-design` (web, landing, ui); the Clerk skills (auth); `mastra` and `mastra-factory` (the API's agents); `firecrawl-build-scrape` (official, general `/scrape` guidance) and `brand-scan-firecrawl` (ours: how the brand scan uses Firecrawl, verified API facts, the test sites and their expected results).

**Installing a skill:** always run `npx skills add ...` from the repo root. Running it inside an app creates a second `.agents/skills` and `skills-lock.json` there, which nothing loads.

## Working in this repo

- Package manager is pnpm 11 with Turborepo. Run app scripts with `pnpm --filter <name> run <script>`.
- pnpm blocks dependency install scripts until each is answered under `allowBuilds` in `pnpm-workspace.yaml`. An unanswered one makes every `pnpm run` fail with `ERR_PNPM_IGNORED_BUILDS`.
- A dependency used by `packages/ui` must be declared there at the same version the apps use, so pnpm links a single copy.
