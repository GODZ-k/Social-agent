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

Skills that apply to more than one app live at the repo root, so every app and package sees them:

- `.agents/skills/<name>` holds the files. `.claude/skills/<name>` links to them for Claude Code.
- `skills-lock.json` records where each one came from.
- Here now: `apple-design` and `frontend-design` (used by `apps/web`, `apps/landing` and `packages/ui`), and the Clerk skills (auth touches the web app, the landing page and the API).

Skills that only one app needs stay in that app. `apps/api/.agents/skills` has the Mastra skills, because only the API uses Mastra.

**Installing a skill:** run `npx skills add ...` from the repo root if more than one app will use it, or from inside the app if only that app needs it. Running it inside an app by habit is how shared skills end up in the wrong place.

## Working in this repo

- Package manager is pnpm 11 with Turborepo. Run app scripts with `pnpm --filter <name> run <script>`.
- pnpm blocks dependency install scripts until each is answered under `allowBuilds` in `pnpm-workspace.yaml`. An unanswered one makes every `pnpm run` fail with `ERR_PNPM_IGNORED_BUILDS`.
- A dependency used by `packages/ui` must be declared there at the same version the apps use, so pnpm links a single copy.
