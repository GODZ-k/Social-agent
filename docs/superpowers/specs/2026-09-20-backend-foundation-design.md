# Backend foundation design

Date: 2026-09-20. Apps and packages: `apps/api`, `packages/db`, `packages/shared`. Approved in chat by the user.

## Goal

Turn the `apps/api` skeleton into a real backend base: a Postgres database, Clerk-verified requests, the ownership rule enforced on the server, and clients CRUD that returns the `Client` shape `apps/web` already uses. Everything later (agents, posts, chat, social accounts, analytics) builds on this.

This is phase 1 of five. The later phases each get their own spec:

1. Foundation (this document)
2. Brand scan and strategy agents
3. Posts
4. Chat stream
5. Social accounts, publishing and analytics

## Decisions

- Postgres 17 with Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `pg`). Postgres runs in local Docker through a `docker-compose.yml` at the repo root.
- The data layer lives in `packages/db` (package name `@social-agent/db`), not inside `apps/api`. No repository layer on top of Drizzle.
- Auth stays Clerk, verified on the API with `@clerk/express`. The database has its own `users` table, and `clients.owner_id` points at our id, not the Clerk id, so replacing Clerk later does not touch ownership data.
- A `users` row is created on the user's first authenticated request. No Clerk webhooks in this phase.
- Not Clerk Organizations. Ownership lives in our data.
- `apps/web` stays on its in-browser mock in this phase. Its strategy and posts mocks are keyed to mock clients, so switching only the clients functions would break those screens. The switch happens when posts land in phase 3.

## Database

`docker-compose.yml` starts one Postgres 17 container with a named volume, and an init script creates two databases: `social_agent` for development and `social_agent_test` for tests.

`users`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | default random |
| `clerk_id` | text, unique, not null | |
| `email` | text, not null | |
| `role` | enum `user_role`: `admin`, `client` | default `client` |
| `created_at`, `updated_at` | timestamptz, not null | `updated_at` doubles as "last synced from Clerk" |

`clients`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, primary key | default random |
| `owner_id` | uuid, not null | references `users.id`, indexed |
| `name`, `url`, `industry` | text, not null | |
| `accent` | text, not null | hex colour; set from the first brand colour on create |
| `stage` | enum `loop_stage`: `onboarding`, `strategy`, `content`, `approval`, `publishing`, `learning` | default `onboarding` |
| `brand` | jsonb, not null | the `BrandKit` shape, extended (see "Client profile data") |
| `business` | jsonb, not null | contact and location details, default `{}` (see "Client profile data") |
| `platforms` | text array, not null | values from `instagram`, `facebook`, `linkedin`, `tiktok` |
| `preferences` | jsonb, not null | `{ timezone, approvalEmails }`, default `{ "timezone": "UTC", "approvalEmails": true }` |
| `created_at`, `updated_at` | timestamptz, not null | |

### Client profile data

The client row holds everything the agents need to know about the business. It is stored as jsonb because it is read and written as a whole and handed to the agents as one block; nothing filters on it. A field that later needs searching can be promoted to a column.

`brand`:

| Field | Type | Required |
|---|---|---|
| `tagline`, `summary`, `audience` | string | yes |
| `voice` | string array (the brand tone) | yes |
| `colors` | `{ name, hex }` array | yes |
| `fonts` | `{ heading, body }` | yes |
| `aesthetic` | string, e.g. "minimal, earthy, lots of white space" | no |
| `keywords` | string array | no |

`business`, every field optional:

| Field | Type |
|---|---|
| `phone` | string |
| `email` | string, valid email |
| `location` | `{ address?, city?, region?, country? }` |
| `hours` | array of `{ day, open, close }`; `day` is `mon` to `sun`, times are `HH:mm` in the client's timezone; a day with no entry is closed; a day may appear twice for split hours |

The website is the `url` column. The new fields are optional because the web onboarding form does not send them yet and a website scan will not always find them; the owner completes them in Settings. `NewClientInput` accepts an optional `business`, `ClientPatch` accepts `brand` and `business`, and `Client` responses always include `business` (an empty object when nothing is known). A patch replaces `brand` or `business` as a whole, the same way the web mock treats `brand`.

Not in this phase: `social_accounts`, strategy, posts and analytics tables. Until they exist, the API returns `accounts: []` and a `stats` object with every number set to `0`, so responses already satisfy the frontend's `Client` type.

`packages/db` exports the schema, a `createDb(url)` factory that returns the Drizzle instance and its pool, and the inferred row types. Scripts: `db:generate` (drizzle-kit generate), `db:migrate` (apply migrations), `db:studio`. Migrations are committed SQL files under `packages/db/drizzle/`.

## Auth

`clerkMiddleware()` from `@clerk/express` is added in `app.ts`. The empty `src/middlewares/auth.middleware.ts` becomes `requireUser`:

1. Get the Clerk user id for the request. This is a single function, `getClerkUserId(req)`, which is the seam tests replace.
2. No id: respond 401.
3. Look up `users` by `clerk_id`.
4. No row: fetch the Clerk user once through the Clerk backend client, take the primary email and `publicMetadata.role`, and insert the row. The insert uses "on conflict do nothing" followed by a select, so two parallel first requests do not fail.
5. Row older than one hour (`updated_at`): re-fetch from Clerk and update email and role. Promoting a user to admin in Clerk therefore takes effect within an hour without webhooks.
6. Role is `admin` when `publicMetadata.role === "admin"` or the email is listed in `ADMIN_EMAILS`. Otherwise `client`.
7. Attach `req.user = { id, clerkId, email, role }`. The Express `Request` type is extended for this.

## Endpoints

All under `/v1`, all behind `requireUser`. `/health` stays public. The Mastra routes mounted by `MastraServer` are left as they are in this phase.

| Method | Path | Body | Success | Behaviour |
|---|---|---|---|---|
| GET | `/v1/me` | | 200 `{ id, email, role }` | The caller |
| GET | `/v1/clients` | | 200 `Client[]` | Admin: all clients. Otherwise: only the caller's. Newest first |
| POST | `/v1/clients` | `NewClientInput` | 201 `Client` | Owned by the caller, stage `onboarding` |
| GET | `/v1/clients/:id` | | 200 `Client` | 404 when missing or not the caller's |
| PATCH | `/v1/clients/:id` | `ClientPatch` | 200 `Client` | Same access rule. Only the fields in `ClientPatch` can change |
| DELETE | `/v1/clients/:id` | | 204 | Same access rule |

Responses use the envelope the API already has: `{ "success": true, "data": ... }` on success and `{ "success": false, "error": { "code", "message", "details"? } }` on failure. "200 `Client`" in the table means `data` is a `Client`. DELETE returns 204 with no body. The web app's unused `http()` helper expects a bare body, so it has to unwrap `data` and read `error.message` when the web app is switched over in phase 3.

`url` is normalised on create: surrounding spaces are trimmed and `https://` is added when no protocol is given, then it must parse as a URL. `accent` is the first brand colour's hex, or `#4B3FE4` when the brand has no colours, and it follows the first colour again whenever a patch replaces `brand`. Both rules match the web mock.

Access rule, in one place (`clients.service.ts`): an admin can reach any client, everyone else only rows where `owner_id` is their `users.id`. A client that exists but is not the caller's returns 404, not 403, which matches the web mock and does not reveal that the id exists. A malformed `:id` (not a uuid) also returns 404.

`ownerId` in responses is our `users.id`. The web app's role and ownership checks are cosmetic; the API is the authority.

## Code structure

```
packages/db/
  src/schema/users.ts, clients.ts, index.ts
  src/client.ts            createDb(url)
  src/migrate.ts           applies migrations; used by db:migrate and the test setup
  drizzle/                 generated SQL migrations
  drizzle.config.ts
packages/shared/src/schema/client.schema.ts
  platformSchema, loopStageSchema, brandKitSchema, businessInfoSchema, clientPreferencesSchema,
  newClientSchema, clientPatchSchema, clientSchema, and the inferred types
apps/api/src/
  config/env.ts            zod-validated config
  db.ts                    the app's single Drizzle instance
  middlewares/auth.middleware.ts
  routes/me.route.ts, clients.route.ts
  controllers/me.controller.ts, clients.controller.ts
  services/users.service.ts      find or create, hourly refresh
  services/clients.service.ts    queries, access rule, row to Client mapping
```

Request flow: route, then the existing `validate` middleware with a shared schema, then controller, then service, then `@social-agent/db`. Controllers hold no logic beyond reading the request and sending the response.

`env.ts` validates `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `ADMIN_EMAILS` (comma separated, default empty), `PORT` (default `4000`) and `CORS_ORIGINS` (comma separated, default `http://localhost:3000`). The API exits at start with a message naming each missing or invalid variable. The hardcoded CORS list in `app.ts` is replaced by `CORS_ORIGINS`. An `.env.example` in `apps/api` lists every variable.

Repairs to existing code that this phase depends on:

- `apps/api` has no tsup configuration, so `pnpm --filter api run build` fails with "No input files". A `tsup` key is added to `apps/api/package.json`: entry `src/server.ts`, ESM, and `@social-agent/shared` and `@social-agent/db` bundled in.
- `validate.middleware.ts` assigns `req.query`, which is read-only in Express 5 and throws. It stops reassigning `query` and `params`, keeps the parsed `body`, and reports each failed field as `{ path, message }` in `error.details`.
- `app.ts` becomes `createApp(deps)`, a factory that takes the database, the Clerk seam and config. `server.ts` builds the real dependencies and mounts Mastra; tests build the app without Clerk keys and without starting Mastra.
- `errorMiddleware` answers a malformed JSON body with 400 `INVALID_JSON` instead of 500, and logs only unexpected errors.

`packages/db` follows the repo rules: built the same way as `packages/shared`, and any dependency it shares with `apps/api` (`zod` if used) is declared at the same version.

## Errors

Through the existing `AppError` and `errorMiddleware`:

| Case | Status | Body |
|---|---|---|
| Invalid body | 400 | message plus per-field messages from zod |
| No or invalid session | 401 | message |
| Client missing, not the caller's, or malformed id | 404 | message |
| Anything else | 500 | generic message; details only in the server log |

## Testing

Vitest and supertest against the real `social_agent_test` database. Tests are written before the code they cover.

- Global setup applies migrations to the test database. Each test starts from truncated tables.
- Clerk is replaced at two seams only: `getClerkUserId(req)` and the function that fetches a Clerk user. Nothing else is mocked.
- Cases: anonymous request gets 401; first request creates the `users` row, a second does not duplicate it; role comes from Clerk metadata and from `ADMIN_EMAILS`; a stale row is refreshed; an owner can list, read, update and delete their client; a stranger gets 404 on read, update and delete and does not see the client in the list; an admin sees and can change every client; invalid create and patch bodies get 400 with field messages; a patch cannot change `ownerId`, `stage` or `id`; a client created without `business` returns `business: {}`; `business` and the new `brand` fields round-trip through create and patch; an invalid email or an hours entry with a bad day or time gets 400; responses parse against `clientSchema`.
- `pnpm --filter api run test` replaces the placeholder test script. `check-types` and `build` must pass for `api`, `@social-agent/db` and `@social-agent/shared`.
- Final manual check: start Docker and the API, sign in to `apps/web`, copy a session token and call `/v1/me` and `/v1/clients` against the running server.

## Out of scope

Clerk webhooks, social account connection, strategy, posts, analytics, chat, moving Mastra storage into Postgres, removing the weather demo, switching `apps/web` off its mock, deployment.
