# AGENTS.md

## CRITICAL: Load `mastra` skill first

Load the `mastra` skill BEFORE any Mastra work. Never rely on cached knowledge — APIs change between versions.

## Rules

- Read `src/mastra/README.md` before building any agent, workflow, skill, tool or scorer. It describes the team of nine specialists, the six workflows, who owns what, and the rules for building them. Each agent and workflow folder has a README that is its brief.
- Register all agents, tools, workflows, and scorers in `src/mastra/index.ts`
- Model ids live only in `src/mastra/config/models.ts`.
- Use the `dev` and `build` scripts from `package.json` instead of running `mastra dev` / `mastra build` directly

## Structure, database and auth

A request travels through four layers, always in this order:

| Layer | Folder | Does | Must not |
|---|---|---|---|
| Route | `src/routes` | Maps a URL to a controller method and validates the body with a zod schema from `packages/shared` | Hold logic |
| Controller | `src/controllers` | Reads the request, calls one service method, sends `{ success, data }` | Hold rules or queries |
| Service | `src/services` | Business rules: who may see what, roles, the accent rule, row to response mapping, 404s | Import Drizzle |
| Repository | `src/repositories` | Every database query | Throw HTTP errors or hold rules |

All three class layers use static methods, like `HealthController`: `BrandsController.list` calls `BrandsService.list`, which calls `BrandsRepository.list`. To add a feature, copy the `brands` files.

- `src/config/env.ts` validates the environment at start-up and exports `env`. `src/config/db.ts` exports the one database connection, `db`; only repositories import it.
- Everything under `/api/v1` requires a signed-in user (`src/routes/v1.route.ts`). `src/auth/clerk.ts` is the only file that imports Clerk. `requireUser` finds or creates our own `users` row and sets `req.user`; controllers read it with `currentUser(req)`.
- The signed-in person's own endpoints are under `/api/v1/me`: `/me` (account) and `/me/overview` (the account plus the **brands** they own, even for an admin, in one response: `brands`, `counts.brands`). An empty list means they have not onboarded yet. `name` and `imageUrl` are copied from Clerk into `users` by the hourly sync. Response shapes are `meSchema` and `meOverviewSchema` in `packages/shared`.
- In development the Clerk `authorizedParties` check is off, so a token minted with the Clerk Backend API works (create a session for a user, then `POST /v1/sessions/{id}/tokens` on api.clerk.com). With `NODE_ENV=production` only sessions issued to `CORS_ORIGINS` are accepted.
- Admins: set `{ "role": "admin" }` in the user's public metadata in the Clerk dashboard. `ADMIN_EMAILS` is a local shortcut and needs a verified email.
- The ownership rule is `scopeFor` in `src/services/brands.service.ts`: admins reach every brand, everyone else only their own, and "not yours", "archived" and "missing" all answer 404. The repository puts that scope in the WHERE clause of every query. `DELETE /brands/:id` archives (`archived_at`); brands are never deleted. New brand-scoped data must take a scope the same way.
- Words: a **client** is a person (`users.role = "client"`), a **brand** is a website workspace. A client can own any number of brands.
- A client arrives by signing up, or by an admin's invitation (`POST /api/v1/admin/clients`), which creates a `users` row with `status = "invited"` and no `clerk_id` and has Clerk send the email. `UsersService.findOrCreate` attaches the Clerk account to that row on the first sign-in, only if Clerk reports the email as verified.
- `/api/v1/admin/*` is behind `requireAdmin`: `GET /admin/clients`, `GET /admin/clients/:id`, `POST /admin/clients`, `POST /admin/clients/:id/brands`.
- Errors: throw `new AppError(message, status, code)`; `errorMiddleware` turns it into `{ success: false, error: { code, message, details? } }`.
- Postgres is hosted on Neon. `DATABASE_URL` in `apps/api/.env` is the development database. The first connection after Neon has been idle can fail once with "Connection terminated unexpectedly"; rerun the script that hit it.
- The schema and migrations live in `packages/db` (`@social-agent/db`). After changing `packages/db/src/schema.ts`: `pnpm --filter @social-agent/db run db:generate`, review the SQL, `pnpm --filter @social-agent/db run build`, then `pnpm --filter @social-agent/db run db:migrate`.
- `packages/db` code only reads `process.env.DATABASE_URL`; it never loads a file. The `db:*` scripts in its `package.json` load `apps/api/.env` for local use. In CI or production, set `DATABASE_URL` and run `pnpm --filter @social-agent/db exec tsx src/cli-migrate.ts`. The tsup bundle does not run migrations, so a deploy step has to call that before the API starts.
- The API reads `packages/shared` and `packages/db` from their `dist` folders. Rebuild a package after changing it.
- There is no automated test suite yet.
- **Every endpoint has a Postman request. Adding or changing an endpoint is not done until the collection is updated.** The collection `apps/api/postman/cadence-api.postman_collection.json` is generated; never edit the JSON. Add or edit a `request({ ... })` entry in `apps/api/postman/build-collection.cjs` (a demo input, which fields are required, a status test, and one saved example per response the endpoint can give, errors included), then run `pnpm --filter api run postman`. That rebuilds the file and then fails if any route in `src/routes` has no request. `pnpm --filter api run postman:check` runs only the check.
- Mastra's own HTTP routes (what Studio talks to) have no auth, so `src/app.ts` mounts them only when `NODE_ENV` is not `production`. The host must set `NODE_ENV=production`. Product code never calls those routes: it calls one function per workflow (`runBrandScan`, ...).
- The brand scan: `pnpm --filter api run scan -- <url>` runs it from the terminal (`--facts` skips the AI step and needs no API key; `--fetch` downloads the home page only). `src/scan` is plain code with no Mastra import. Websites are read through Firecrawl (`src/scan/firecrawl.ts` is the only file allowed to send a user-typed address anywhere; it vets the address first because Firecrawl does not refuse private hosts). Never fetch a user-supplied URL any other way. `FIRECRAWL_API_KEY` is optional in development (keyless, rate-limited) and required in production.
- `POST /api/v1/scans` runs the scan behind an in-process queue owned by the API (`src/scan-queue`): one scan at a time (`SCAN_CONCURRENCY = 1`), taken off an in-memory FIFO. A person has at most one `queued`/`running` scan; a second `POST /scans` while one is active returns that same scan instead of starting another. On start-up the API marks every leftover `queued`/`running` row `failed` (a restart never leaves a scan stuck). Step ids (`brand_scans.current_step`) are `discover | read-pages | interpret | report` (`SCAN_STEP_IDS` in `src/scan/types.ts`), the workflow's real steps, not a fixed screen label set.
- An agent that must answer in one model call gets its skill text through `loadSkill()` (`src/mastra/config/skills.ts`), not through `skills:`, which adds tool calls. The build copies `src/mastra/skills` to `dist/skills`.

## Resources

- [Mastra Documentation](https://mastra.ai/llms.txt)
- [Skills Discovery](https://mastra.ai/.well-known/skills/index.json)
