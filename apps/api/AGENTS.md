# AGENTS.md

## CRITICAL: Load `mastra` skill first

Load the `mastra` skill BEFORE any Mastra work. Never rely on cached knowledge — APIs change between versions.

## Rules

- Register all agents, tools, workflows, and scorers in `src/mastra/index.ts`
- Use the `dev` and `build` scripts from `package.json` instead of running `mastra dev` / `mastra build` directly

## Structure, database and auth

A request travels through four layers, always in this order:

| Layer | Folder | Does | Must not |
|---|---|---|---|
| Route | `src/routes` | Maps a URL to a controller method and validates the body with a zod schema from `packages/shared` | Hold logic |
| Controller | `src/controllers` | Reads the request, calls one service method, sends `{ success, data }` | Hold rules or queries |
| Service | `src/services` | Business rules: who may see what, roles, the accent rule, row to response mapping, 404s | Import Drizzle |
| Repository | `src/repositories` | Every database query | Throw HTTP errors or hold rules |

All three class layers use static methods, like `HealthController`: `ClientsController.list` calls `ClientsService.list`, which calls `ClientsRepository.list`. To add a feature, copy the `clients` files.

- `src/config/env.ts` validates the environment at start-up and exports `env`. `src/config/db.ts` exports the one database connection, `db`; only repositories import it.
- Everything under `/v1` requires a signed-in user (`src/routes/v1.route.ts`). `src/auth/clerk.ts` is the only file that imports Clerk. `requireUser` finds or creates our own `users` row and sets `req.user`; controllers read it with `currentUser(req)`.
- Admins: set `{ "role": "admin" }` in the user's public metadata in the Clerk dashboard. `ADMIN_EMAILS` is a local shortcut and needs a verified email.
- The ownership rule is `scopeFor` in `src/services/clients.service.ts`: admins reach every client, everyone else only their own, and "not yours" answers 404 exactly like "missing". The repository puts that scope in the WHERE clause of every query, including updates and deletes. New client-scoped data must take a scope the same way.
- Errors: throw `new AppError(message, status, code)`; `errorMiddleware` turns it into `{ success: false, error: { code, message, details? } }`.
- Postgres is hosted on Neon. `DATABASE_URL` in `apps/api/.env` is the development database. The first connection after Neon has been idle can fail once with "Connection terminated unexpectedly"; rerun the script that hit it.
- The schema and migrations live in `packages/db` (`@social-agent/db`). After changing `packages/db/src/schema.ts`: `pnpm --filter @social-agent/db run db:generate`, review the SQL, `pnpm --filter @social-agent/db run build`, then `pnpm --filter @social-agent/db run db:migrate`.
- `packages/db` code only reads `process.env.DATABASE_URL`; it never loads a file. The `db:*` scripts in its `package.json` load `apps/api/.env` for local use. In CI or production, set `DATABASE_URL` and run `pnpm --filter @social-agent/db exec tsx src/cli-migrate.ts`. The tsup bundle does not run migrations, so a deploy step has to call that before the API starts.
- The API reads `packages/shared` and `packages/db` from their `dist` folders. Rebuild a package after changing it.
- There is no automated test suite yet.

## Resources

- [Mastra Documentation](https://mastra.ai/llms.txt)
- [Skills Discovery](https://mastra.ai/.well-known/skills/index.json)
