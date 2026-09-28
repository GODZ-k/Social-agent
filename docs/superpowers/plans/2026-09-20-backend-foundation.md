# Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `apps/api` a Postgres database, Clerk-verified requests, server-side ownership rules and clients CRUD that returns the `Client` shape `apps/web` already uses.

**Architecture:** A new `packages/db` package owns the Drizzle schema, migrations and connection. `packages/shared` owns the zod schemas for request and response shapes. `apps/api` becomes `createApp(deps)`: a factory that receives the database and a small Clerk seam, so tests run against a real Postgres test database without Clerk keys or Mastra. Request flow is route, `validate` middleware, controller, service, database.

**Tech Stack:** Express 5, Drizzle ORM 0.45 + `pg`, Postgres 17 in Docker, `@clerk/express` 2.x, zod 4, Vitest + supertest, pnpm 11 + Turborepo, TypeScript 7.

**Spec:** `docs/superpowers/specs/2026-09-20-backend-foundation-design.md`. Read it before starting any task.

## Global Constraints

- Package manager is pnpm 11. Run scripts with `pnpm --filter <name> run <script>`. Package names: `api`, `@social-agent/db`, `@social-agent/shared`.
- The registry connection on this machine is slow. A `pnpm add` can take several minutes; run it with a 10 minute timeout and do not retry while one is still running.
- If any `pnpm` command fails with `ERR_PNPM_IGNORED_BUILDS`, add the named package under `allowBuilds` in `pnpm-workspace.yaml` (`true` to run its install script) and rerun.
- If `turbo` fails with `spawn UNKNOWN`, it is a transient Windows Smart App Control block. Retry, or use `pnpm --filter ... run ...` directly, which is what this plan does anyway.
- A dependency used by two workspace packages is declared at the same version range in both (`zod` is `^4.6.1`, `typescript` is `7.0.2`, `tsx` is `^4.23.13`, `dotenv` is `^17.4.2`). `drizzle-orm` and `pg` must be the same version in `packages/db` and `apps/api`.
- `packages/shared` and `packages/db` compile with `module: NodeNext`: relative imports inside them need the `.js` extension (`./schema.js`). `apps/api` uses `moduleResolution: Bundler` with the `@/*` alias and no extensions.
- `apps/api` consumes the two packages from their `dist` folders. After changing `packages/shared` or `packages/db`, rebuild it (`pnpm --filter <name> run build`) before running API tests or type checks.
- Every API response uses the envelope `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message", "details"? } }`. DELETE returns 204 with no body.
- A client that is missing, not the caller's, or addressed with a malformed id returns 404 with the message `This client doesn't exist, or you don't have access to it.`
- `docs` is listed in `.gitignore`, although the landing spec and plan were force-added earlier. Do not `git add` anything under `docs/` unless the user asks for it.
- Versions checked on 2026-09-20: `drizzle-orm` 0.45.2 (the 1.0 line is still a release candidate; stay on `latest`), `drizzle-kit` 0.31.10, `pg` 8.23.0, `@clerk/express` 2.1.69, `vitest` 5.0.1, `supertest` 7.2.2. Vitest 5 is new: if a config key in this plan (`globalSetup`, `fileParallelism`) is rejected, look it up in `node_modules/vitest` and use the current name.
- The user edits this repo at the same time. Run `git status` before overwriting a file you did not create in this plan, and never stage `apps/api/mastra.duckdb.wal`, `apps/landing/next-env.d.ts` or other files this plan does not name. Stage `pnpm-lock.yaml` only together with the `package.json` change that caused it.
- Do not read or print the values in `apps/api/.env` or `apps/web/.env.local`. Variable names are fine.
- Before using `@clerk/express` or Drizzle APIs, check the installed types (`node_modules/@clerk/express/dist/*.d.ts`, `node_modules/drizzle-orm/**/*.d.ts`). If a name in this plan does not exist in the installed version, use the installed equivalent and say so in the commit message.
- Match the existing code style in `apps/api`: double quotes, semicolons optional as found in the file being edited, named exports.

---

### Task 1: Postgres in Docker and a working API build

**Files:**
- Create: `docker-compose.yml`
- Create: `docker/postgres/init.sql`
- Modify: `apps/api/package.json` (add the `tsup` key)

**Interfaces:**
- Consumes: nothing.
- Produces: Postgres on `localhost:5432`, user `postgres`, password `postgres`, databases `social_agent` and `social_agent_test`. Connection strings used by every later task:
  - dev: `postgresql://postgres:postgres@localhost:5432/social_agent`
  - test: `postgresql://postgres:postgres@localhost:5432/social_agent_test`

- [ ] **Step 1: Create the working branch**

```bash
git status
git checkout -b backend-foundation
```

Expected: the three already-modified files (`apps/api/mastra.duckdb.wal`, `apps/landing/next-env.d.ts`, `pnpm-lock.yaml`) carry over unchanged. Do not stage them.

- [ ] **Step 2: Confirm the build is broken today**

Run: `pnpm --filter api run build`
Expected: FAIL with `No input files, try "tsup <your-file>" instead`.

- [ ] **Step 3: Add the tsup configuration**

In `apps/api/package.json`, add this top-level key after `"scripts"`:

```json
  "tsup": {
    "entry": ["src/server.ts"],
    "format": ["esm"],
    "target": "node24",
    "platform": "node",
    "clean": true,
    "noExternal": ["@social-agent/shared", "@social-agent/db"]
  },
```

`@social-agent/db` does not exist yet; listing it now is harmless and saves a later edit.

- [ ] **Step 4: Confirm the build passes**

Run: `pnpm --filter @social-agent/shared run build` then `pnpm --filter api run build`
Expected: PASS, `apps/api/dist/server.js` exists.

- [ ] **Step 5: Create the database init script**

`docker/postgres/init.sql`:

```sql
-- Runs once, the first time the data volume is created.
-- The development database comes from POSTGRES_DB; tests get their own.
CREATE DATABASE social_agent_test;
```

- [ ] **Step 6: Create the compose file**

`docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:17
    container_name: social_agent_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: social_agent
    ports:
      - "5432:5432"
    volumes:
      - social_agent_pgdata:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d social_agent"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  social_agent_pgdata:
```

- [ ] **Step 7: Start it and verify both databases exist**

```bash
docker compose up -d
docker compose ps
docker exec social_agent_postgres psql -U postgres -c "\l"
```

Expected: the service is `healthy` within about 30 seconds, and the list contains `social_agent` and `social_agent_test`. If port 5432 is already taken on this machine, stop and report it; do not pick another port silently, because later tasks hardcode the URL.

- [ ] **Step 8: Commit**

```bash
git add docker-compose.yml docker/postgres/init.sql apps/api/package.json
git commit -m "chore: add local Postgres and fix the api tsup build"
```

---

### Task 2: Shared client schemas

**Files:**
- Modify: `packages/shared/src/schema/client.schema.ts` (currently one import line)
- Modify: `packages/shared/package.json` (test script, vitest)
- Create: `packages/shared/src/schema/client.schema.test.ts`
- Modify: `packages/shared/tsconfig.json` (exclude tests from the build)

**Interfaces:**
- Consumes: nothing.
- Produces, all exported from `@social-agent/shared`:
  - schemas: `platformSchema`, `loopStageSchema`, `brandColorSchema`, `brandKitSchema`, `businessInfoSchema`, `clientPreferencesSchema`, `socialAccountSchema`, `clientStatsSchema`, `newClientSchema`, `clientPatchSchema`, `clientSchema`
  - types: `Platform`, `LoopStage`, `BrandKit`, `BusinessInfo`, `ClientPreferences`, `SocialAccount`, `ClientStats`, `NewClientInput`, `ClientPatch`, `Client`
  - constants: `DEFAULT_ACCENT = "#4B3FE4"`, `DEFAULT_PREFERENCES = { timezone: "UTC", approvalEmails: true }`

- [ ] **Step 1: Add Vitest to the package**

```bash
pnpm --filter @social-agent/shared add -D vitest
```

In `packages/shared/package.json` add to `"scripts"`: `"test": "vitest run"`.

In `packages/shared/tsconfig.json` change `"exclude"` to `["node_modules", "dist", "src/**/*.test.ts"]` so tests are not emitted into `dist`.

- [ ] **Step 2: Write the failing tests**

`packages/shared/src/schema/client.schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  brandKitSchema,
  businessInfoSchema,
  clientPatchSchema,
  newClientSchema,
} from "./client.schema.js";

const brand = {
  tagline: "Coffee worth waking up for",
  summary: "A neighbourhood roastery.",
  audience: "Commuters and remote workers",
  voice: ["warm", "direct"],
  colors: [{ name: "Espresso", hex: "#3B2F2F" }],
  fonts: { heading: "Fraunces", body: "Inter" },
};

const input = {
  name: "Acme Coffee",
  url: "acmecoffee.com",
  industry: "Cafe",
  brand,
  platforms: ["instagram", "linkedin"],
};

describe("newClientSchema", () => {
  it("accepts the payload the web onboarding form sends today", () => {
    expect(newClientSchema.safeParse(input).success).toBe(true);
  });

  it("adds https:// to a url without a protocol and trims it", () => {
    const parsed = newClientSchema.parse({ ...input, url: "  acmecoffee.com " });
    expect(parsed.url).toBe("https://acmecoffee.com");
  });

  it("keeps a url that already has a protocol", () => {
    expect(newClientSchema.parse({ ...input, url: "http://acme.test/x" }).url).toBe("http://acme.test/x");
  });

  it("rejects an empty name and an unknown platform", () => {
    expect(newClientSchema.safeParse({ ...input, name: " " }).success).toBe(false);
    expect(newClientSchema.safeParse({ ...input, platforms: ["myspace"] }).success).toBe(false);
  });
});

describe("brandKitSchema", () => {
  it("accepts the optional aesthetic and keywords", () => {
    const parsed = brandKitSchema.parse({ ...brand, aesthetic: "minimal, earthy", keywords: ["coffee", "roastery"] });
    expect(parsed.keywords).toEqual(["coffee", "roastery"]);
  });

  it("rejects a colour that is not a hex value", () => {
    const bad = { ...brand, colors: [{ name: "Red", hex: "red" }] };
    expect(brandKitSchema.safeParse(bad).success).toBe(false);
  });
});

describe("businessInfoSchema", () => {
  it("accepts an empty object", () => {
    expect(businessInfoSchema.parse({})).toEqual({});
  });

  it("accepts full contact details with split hours", () => {
    const business = {
      phone: "+91 98765 43210",
      email: "hello@acmecoffee.com",
      location: { address: "12 MG Road", city: "Bengaluru", region: "KA", country: "IN" },
      hours: [
        { day: "mon", open: "08:00", close: "12:00" },
        { day: "mon", open: "16:00", close: "21:00" },
      ],
    };
    expect(businessInfoSchema.safeParse(business).success).toBe(true);
  });

  it("rejects an invalid email, day or time", () => {
    expect(businessInfoSchema.safeParse({ email: "nope" }).success).toBe(false);
    expect(businessInfoSchema.safeParse({ hours: [{ day: "funday", open: "08:00", close: "12:00" }] }).success).toBe(false);
    expect(businessInfoSchema.safeParse({ hours: [{ day: "mon", open: "8am", close: "12:00" }] }).success).toBe(false);
    expect(businessInfoSchema.safeParse({ hours: [{ day: "mon", open: "24:00", close: "25:00" }] }).success).toBe(false);
  });
});

describe("clientPatchSchema", () => {
  it("accepts an empty patch and a partial patch", () => {
    expect(clientPatchSchema.parse({})).toEqual({});
    expect(clientPatchSchema.parse({ name: "New name" })).toEqual({ name: "New name" });
  });

  it("drops fields an owner may not change", () => {
    const parsed = clientPatchSchema.parse({ name: "X", ownerId: "someone", stage: "learning", id: "other" });
    expect(parsed).toEqual({ name: "X" });
  });
});
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `pnpm --filter @social-agent/shared run test`
Expected: FAIL, the imported schemas do not exist.

- [ ] **Step 4: Write the schemas**

Replace `packages/shared/src/schema/client.schema.ts` with:

```ts
import { z } from "zod";

export const DEFAULT_ACCENT = "#4B3FE4";

export const platformSchema = z.enum(["instagram", "facebook", "linkedin", "tiktok"]);

/** Where a client currently sits in the agent loop. */
export const loopStageSchema = z.enum([
  "onboarding",
  "strategy",
  "content",
  "approval",
  "publishing",
  "learning",
]);

export const brandColorSchema = z.object({
  name: z.string(),
  hex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use a hex colour such as #3B2F2F"),
});

export const brandKitSchema = z.object({
  tagline: z.string(),
  summary: z.string(),
  audience: z.string(),
  /** The brand tone, e.g. ["warm", "direct"]. */
  voice: z.array(z.string()),
  colors: z.array(brandColorSchema),
  fonts: z.object({ heading: z.string(), body: z.string() }),
  /** The visual feel, e.g. "minimal, earthy, lots of white space". */
  aesthetic: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24 hour HH:mm");

export const businessHoursEntrySchema = z.object({
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  open: timeSchema,
  close: timeSchema,
});

/** Contact details the agents can use in posts. A day with no hours entry is closed. */
export const businessInfoSchema = z.object({
  phone: z.string().optional(),
  email: z.email().optional(),
  location: z
    .object({
      address: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  hours: z.array(businessHoursEntrySchema).optional(),
});

export const clientPreferencesSchema = z.object({
  /** IANA name, e.g. "Asia/Kolkata". */
  timezone: z.string().min(1),
  approvalEmails: z.boolean(),
});

export const DEFAULT_PREFERENCES: z.infer<typeof clientPreferencesSchema> = {
  timezone: "UTC",
  approvalEmails: true,
};

export const socialAccountSchema = z.object({
  platform: platformSchema,
  handle: z.string(),
  status: z.enum(["connected", "expired"]),
  connectedAt: z.string(),
});

export const clientStatsSchema = z.object({
  followers: z.number(),
  followersDelta: z.number(),
  engagementRate: z.number(),
  engagementDelta: z.number(),
  scheduled: z.number(),
  pendingApprovals: z.number(),
});

const websiteUrlSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
  .pipe(z.url());

export const newClientSchema = z.object({
  name: z.string().trim().min(1),
  url: websiteUrlSchema,
  industry: z.string().trim(),
  brand: brandKitSchema,
  platforms: z.array(platformSchema),
  business: businessInfoSchema.optional(),
});

/** The parts of a client its owner can change in Settings. Unknown keys are dropped. */
export const clientPatchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  industry: z.string().trim().optional(),
  brand: brandKitSchema.optional(),
  business: businessInfoSchema.optional(),
  platforms: z.array(platformSchema).optional(),
  preferences: clientPreferencesSchema.optional(),
});

export const clientSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  url: z.string(),
  industry: z.string(),
  accent: z.string(),
  stage: loopStageSchema,
  brand: brandKitSchema,
  business: businessInfoSchema,
  platforms: z.array(platformSchema),
  accounts: z.array(socialAccountSchema),
  preferences: clientPreferencesSchema,
  createdAt: z.string(),
  stats: clientStatsSchema,
});

export type Platform = z.infer<typeof platformSchema>;
export type LoopStage = z.infer<typeof loopStageSchema>;
export type BrandKit = z.infer<typeof brandKitSchema>;
export type BusinessInfo = z.infer<typeof businessInfoSchema>;
export type ClientPreferences = z.infer<typeof clientPreferencesSchema>;
export type SocialAccount = z.infer<typeof socialAccountSchema>;
export type ClientStats = z.infer<typeof clientStatsSchema>;
export type NewClientInput = z.infer<typeof newClientSchema>;
export type ClientPatch = z.infer<typeof clientPatchSchema>;
export type Client = z.infer<typeof clientSchema>;
```

`packages/shared/src/index.ts` already re-exports this file; leave it alone.

- [ ] **Step 5: Run the tests to see them pass**

Run: `pnpm --filter @social-agent/shared run test`
Expected: PASS, 11 tests.

- [ ] **Step 6: Type-check and build**

Run: `pnpm --filter @social-agent/shared run check-types` then `pnpm --filter @social-agent/shared run build`
Expected: both PASS, and `packages/shared/dist` contains no `.test.js` file.

- [ ] **Step 7: Commit**

```bash
git add packages/shared pnpm-lock.yaml
git commit -m "feat(shared): client, brand kit and business info schemas"
```

---

### Task 3: The database package

**Files:**
- Delete: `packages/db/.gitkeep`
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/drizzle.config.ts`
- Create: `packages/db/src/schema.ts`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/migrate.ts`
- Create: `packages/db/src/cli-migrate.ts`
- Create: `packages/db/src/index.ts`
- Create (generated): `packages/db/drizzle/*`

**Interfaces:**
- Consumes: types `BrandKit`, `BusinessInfo`, `ClientPreferences`, `Platform` and constant `DEFAULT_PREFERENCES` from `@social-agent/shared` (Task 2).
- Produces:
  - from `@social-agent/db`: tables `users`, `clients`; enums `userRole`, `loopStage`; `createDb(url: string): { db: Db; pool: pg.Pool }`; types `Db`, `UserRow`, `ClientRow`, `NewClientRow`
  - from `@social-agent/db/migrate`: `runMigrations(url: string): Promise<void>`
  - scripts: `db:generate`, `db:migrate`, `db:studio`

Both tables live in one `schema.ts` on purpose: drizzle-kit loads the schema file itself and has trouble following `.js`-suffixed relative imports between schema files.

- [ ] **Step 1: Create the package manifest**

`packages/db/package.json`:

```json
{
  "name": "@social-agent/db",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./migrate": {
      "types": "./dist/migrate.d.ts",
      "import": "./dist/migrate.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch --preserveWatchOutput",
    "check-types": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx src/cli-migrate.ts",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@social-agent/shared": "workspace:*"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "dotenv": "^17.4.2",
    "tsx": "^4.23.13",
    "typescript": "7.0.2"
  }
}
```

`packages/db/tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

Delete `packages/db/.gitkeep`.

- [ ] **Step 2: Install the database dependencies**

```bash
pnpm --filter @social-agent/db add drizzle-orm pg
pnpm --filter @social-agent/db add -D drizzle-kit @types/pg
```

Note the exact `drizzle-orm` and `pg` version ranges written to `packages/db/package.json`; Task 5 installs the same ranges in `apps/api`.

- [ ] **Step 3: Write the schema**

`packages/db/src/schema.ts`:

```ts
import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  DEFAULT_PREFERENCES,
  type BrandKit,
  type BusinessInfo,
  type ClientPreferences,
  type Platform,
} from "@social-agent/shared";

export const userRole = pgEnum("user_role", ["admin", "client"]);

export const loopStage = pgEnum("loop_stage", [
  "onboarding",
  "strategy",
  "content",
  "approval",
  "publishing",
  "learning",
]);

/**
 * Our own record of a person. Clerk authenticates them; ownership points here,
 * so replacing Clerk later does not touch ownership data.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  role: userRole("role").notNull().default("client"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  /** Doubles as "last synced from Clerk". */
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    url: text("url").notNull(),
    industry: text("industry").notNull(),
    accent: text("accent").notNull(),
    stage: loopStage("stage").notNull().default("onboarding"),
    brand: jsonb("brand").$type<BrandKit>().notNull(),
    business: jsonb("business").$type<BusinessInfo>().notNull().default({}),
    platforms: text("platforms").array().$type<Platform[]>().notNull(),
    preferences: jsonb("preferences").$type<ClientPreferences>().notNull().default(DEFAULT_PREFERENCES),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("clients_owner_id_idx").on(table.ownerId)],
);

export type UserRow = typeof users.$inferSelect;
export type ClientRow = typeof clients.$inferSelect;
export type NewClientRow = typeof clients.$inferInsert;
```

- [ ] **Step 4: Write the connection factory, the migrator and the index**

`packages/db/src/client.ts`:

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

export function createDb(url: string) {
  const pool = new pg.Pool({ connectionString: url });
  const db = drizzle(pool, { schema });
  return { db, pool };
}

export type Db = ReturnType<typeof createDb>["db"];
```

`packages/db/src/migrate.ts`:

```ts
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

/** Applies every migration in packages/db/drizzle that the database has not seen. */
export async function runMigrations(url: string): Promise<void> {
  const pool = new pg.Pool({ connectionString: url });
  try {
    await migrate(drizzle(pool), {
      migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
    });
  } finally {
    await pool.end();
  }
}
```

`packages/db/src/cli-migrate.ts`:

```ts
import { config } from "dotenv";
import { runMigrations } from "./migrate.js";

// The API owns the environment file; the database package borrows DATABASE_URL from it.
config({ path: new URL("../../../apps/api/.env", import.meta.url) });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to apps/api/.env.");
  process.exit(1);
}

await runMigrations(url);
console.log("Migrations applied.");
```

`packages/db/src/index.ts`:

```ts
export * from "./schema.js";
export * from "./client.js";
```

`migrate.ts` is deliberately not re-exported from the index, so the API bundle never pulls in the migrator.

`packages/db/drizzle.config.ts`:

```ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../../apps/api/.env" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/social_agent",
  },
});
```

- [ ] **Step 5: Type-check and build**

Run: `pnpm --filter @social-agent/db run check-types` then `pnpm --filter @social-agent/db run build`
Expected: PASS. `packages/db/dist/index.js` and `packages/db/dist/migrate.js` exist.

- [ ] **Step 6: Generate the first migration**

Run: `pnpm --filter @social-agent/db run db:generate`
Expected: a new `packages/db/drizzle/0000_*.sql` plus a `meta/` folder. Open the SQL and check that it creates the two enums, both tables, the unique constraint on `clerk_id`, the foreign key from `clients.owner_id` to `users.id`, and `clients_owner_id_idx`. If drizzle-kit cannot load `@social-agent/shared`, run `pnpm --filter @social-agent/shared run build` first.

- [ ] **Step 7: Apply it to both databases and verify**

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/social_agent" pnpm --filter @social-agent/db exec tsx -e "import('./src/migrate.ts').then(m => m.runMigrations(process.env.DATABASE_URL)).then(() => console.log('ok'))"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/social_agent_test" pnpm --filter @social-agent/db exec tsx -e "import('./src/migrate.ts').then(m => m.runMigrations(process.env.DATABASE_URL)).then(() => console.log('ok'))"
docker exec social_agent_postgres psql -U postgres -d social_agent -c "\d clients"
```

Expected: `ok` twice, and `\d clients` lists every column from the spec with `business` defaulting to `'{}'::jsonb`. Running the first command a second time prints `ok` again and changes nothing.

(The `db:migrate` script reads `apps/api/.env`, whose `DATABASE_URL` the user has not pointed at Docker yet. That happens in Task 9; this step passes the URL directly instead.)

- [ ] **Step 8: Commit**

```bash
git add packages/db pnpm-lock.yaml
git commit -m "feat(db): drizzle schema, migrations and connection for users and clients"
```

---

### Task 4: Validated environment config

**Files:**
- Modify: `apps/api/src/config/env.ts` (currently empty)
- Modify: `apps/api/package.json` (test script, vitest)
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/test/env.test.ts`
- Modify: `apps/api/tsconfig.json` (type-check tests)

**Interfaces:**
- Consumes: nothing.
- Produces: `loadEnv(source?: NodeJS.ProcessEnv): Env` and the type

```ts
interface Env {
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  ADMIN_EMAILS: string[];   // lowercased
  PORT: number;             // default 4000
  CORS_ORIGINS: string[];   // default ["http://localhost:3000"]
}
```

`loadEnv` throws an `Error` whose message names every missing or invalid variable.

- [ ] **Step 1: Add Vitest and supertest to the API**

```bash
pnpm --filter api add -D vitest supertest @types/supertest
```

In `apps/api/package.json` replace the `"test"` script with `"test": "vitest run"`.

`apps/api/vitest.config.ts` (the global setup file arrives in Task 5; until then this config omits it):

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["test/**/*.test.ts"],
    // Every file shares one test database and truncates it between tests.
    fileParallelism: false,
    testTimeout: 15000,
  },
});
```

In `apps/api/tsconfig.json` change `"include"` to `["src", "test", "vitest.config.ts"]`.

- [ ] **Step 2: Write the failing tests**

`apps/api/test/env.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { loadEnv } from "@/config/env";

const valid = {
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/social_agent",
  CLERK_SECRET_KEY: "sk_test_x",
  CLERK_PUBLISHABLE_KEY: "pk_test_x",
};

describe("loadEnv", () => {
  it("applies defaults", () => {
    const env = loadEnv(valid);
    expect(env.PORT).toBe(4000);
    expect(env.CORS_ORIGINS).toEqual(["http://localhost:3000"]);
    expect(env.ADMIN_EMAILS).toEqual([]);
  });

  it("parses lists and the port", () => {
    const env = loadEnv({
      ...valid,
      PORT: "8080",
      CORS_ORIGINS: "http://localhost:3000, https://app.example.com",
      ADMIN_EMAILS: "Boss@Example.com,, ops@example.com ",
    });
    expect(env.PORT).toBe(8080);
    expect(env.CORS_ORIGINS).toEqual(["http://localhost:3000", "https://app.example.com"]);
    expect(env.ADMIN_EMAILS).toEqual(["boss@example.com", "ops@example.com"]);
  });

  it("names every missing variable in one error", () => {
    expect(() => loadEnv({})).toThrowError(/DATABASE_URL[\s\S]*CLERK_SECRET_KEY[\s\S]*CLERK_PUBLISHABLE_KEY/);
  });

  it("rejects a DATABASE_URL that is not a postgres url", () => {
    expect(() => loadEnv({ ...valid, DATABASE_URL: "mysql://x" })).toThrowError(/DATABASE_URL/);
  });
});
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `pnpm --filter api run test`
Expected: FAIL, `loadEnv` is not exported.

- [ ] **Step 4: Write the config**

`apps/api/src/config/env.ts`:

```ts
import { z } from "zod";

const list = (fallback: string) =>
  z
    .string()
    .default(fallback)
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );

const envSchema = z.object({
  DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\//, "must start with postgres:// or postgresql://"),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  /** Dev shortcut: these emails are admins without Clerk metadata. */
  ADMIN_EMAILS: list("").transform((emails) => emails.map((email) => email.toLowerCase())),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: list("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment. Fix these in apps/api/.env:\n${problems}`);
  }
  return result.data;
}
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `pnpm --filter api run test`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/config/env.ts apps/api/test/env.test.ts apps/api/vitest.config.ts apps/api/package.json apps/api/tsconfig.json pnpm-lock.yaml
git commit -m "feat(api): validated environment config"
```

---

### Task 5: App factory, Clerk seam, middleware repairs and the test harness

**Files:**
- Modify: `apps/api/src/app.ts` (rewrite as a factory)
- Modify: `apps/api/src/server.ts` (rewrite)
- Create: `apps/api/src/auth/clerk-gateway.ts`
- Modify: `apps/api/src/utils/AppError.ts`
- Modify: `apps/api/src/middlewares/error.middleware.ts`
- Modify: `apps/api/src/middlewares/validate.middleware.ts`
- Modify: `apps/api/vitest.config.ts` (add global setup)
- Create: `apps/api/test/test-db-url.ts`
- Create: `apps/api/test/global-setup.ts`
- Create: `apps/api/test/helpers.ts`
- Create: `apps/api/test/app.test.ts`
- Modify: `apps/api/package.json` (dependencies)

**Interfaces:**
- Consumes: `createDb`, `Db` from `@social-agent/db`; `runMigrations` from `@social-agent/db/migrate`; `loadEnv` from `@/config/env`.
- Produces:

```ts
// src/auth/clerk-gateway.ts
interface ClerkUserInfo { email: string; metadataRole: unknown }
interface ClerkGateway {
  middleware?: RequestHandler;                       // mounted on /v1 only
  getUserId(req: Request): string | null;
  fetchUser(clerkId: string): Promise<ClerkUserInfo>;
}
function createClerkGateway(): ClerkGateway

// src/app.ts
interface AppDeps {
  db: Db;
  clerk: ClerkGateway;
  adminEmails: string[];
  corsOrigins: string[];
  extend?: (app: Express) => Promise<void>;          // server.ts mounts Mastra here
}
function createApp(deps: AppDeps): Promise<Express>

// src/utils/AppError.ts
interface ErrorDetail { path: string; message: string }
new AppError(message, statusCode?, code?, details?: ErrorDetail[])

// test/helpers.ts
db, pool, resetDb(), makeTestApp(options?), asUser(clerkId)
```

In tests the caller is chosen with the `x-test-clerk-id` request header. No header means anonymous.

- [ ] **Step 1: Install runtime dependencies**

Use the same `drizzle-orm` and `pg` ranges that Task 3 wrote into `packages/db/package.json`.

```bash
pnpm --filter api add @social-agent/db@workspace:* @clerk/express drizzle-orm pg
pnpm --filter api add -D @types/pg
```

Then compare the `drizzle-orm` and `pg` lines in `apps/api/package.json` and `packages/db/package.json`. They must be identical; edit and rerun `pnpm install` if not.

- [ ] **Step 2: Write the test harness**

`apps/api/test/test-db-url.ts`:

```ts
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/social_agent_test";
```

`apps/api/test/global-setup.ts`:

```ts
import { runMigrations } from "@social-agent/db/migrate";
import { TEST_DATABASE_URL } from "./test-db-url";

export default async function setup() {
  await runMigrations(TEST_DATABASE_URL);
}
```

In `apps/api/vitest.config.ts` add `globalSetup: ["./test/global-setup.ts"],` inside `test`.

`apps/api/test/helpers.ts`:

```ts
import { createDb } from "@social-agent/db";
import { sql } from "drizzle-orm";
import { vi } from "vitest";
import { createApp } from "@/app";
import type { ClerkUserInfo } from "@/auth/clerk-gateway";
import { TEST_DATABASE_URL } from "./test-db-url";

export const { db, pool } = createDb(TEST_DATABASE_URL);

export async function resetDb() {
  await db.execute(sql`truncate table clients, users restart identity cascade`);
}

export const TEST_USER_HEADER = "x-test-clerk-id";

/** supertest helper: `request(app).get("/v1/me").set(asUser("clerk_owner"))` */
export const asUser = (clerkId: string) => ({ [TEST_USER_HEADER]: clerkId });

/**
 * The real app with Clerk replaced at its two seams. `clerkUsers` is what
 * "Clerk" knows; `fetchUser` is a spy so tests can count lookups.
 */
export async function makeTestApp(options: { adminEmails?: string[] } = {}) {
  const clerkUsers = new Map<string, ClerkUserInfo>();
  const fetchUser = vi.fn(async (clerkId: string) => {
    const user = clerkUsers.get(clerkId);
    if (!user) throw new Error(`Test setup: no Clerk user registered for ${clerkId}`);
    return user;
  });
  const app = await createApp({
    db,
    clerk: {
      getUserId: (req) => req.get(TEST_USER_HEADER) ?? null,
      fetchUser,
    },
    adminEmails: options.adminEmails ?? [],
    corsOrigins: ["http://localhost:3000"],
  });
  return { app, clerkUsers, fetchUser };
}
```

- [ ] **Step 3: Write the failing tests**

`apps/api/test/app.test.ts`:

```ts
import express from "express";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { errorMiddleware } from "@/middlewares/error.middleware";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { makeTestApp, pool } from "./helpers";

afterAll(() => pool.end());

describe("createApp", () => {
  it("serves /health without a session", async () => {
    const { app } = await makeTestApp();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("healthy");
  });

  it("runs the extend hook before its own routes", async () => {
    const { createApp } = await import("@/app");
    const { db } = await import("./helpers");
    const app = await createApp({
      db,
      clerk: { getUserId: () => null, fetchUser: async () => ({ email: "", metadataRole: undefined }) },
      adminEmails: [],
      corsOrigins: [],
      extend: async (instance) => {
        instance.get("/extended", (_req, res) => res.json({ ok: true }));
      },
    });
    const res = await request(app).get("/extended");
    expect(res.body).toEqual({ ok: true });
  });

  it("answers a malformed JSON body with 400, not 500", async () => {
    const { app } = await makeTestApp();
    const res = await request(app)
      .post("/health")
      .set("Content-Type", "application/json")
      .send("{ not json");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: { code: "INVALID_JSON", message: "The request body is not valid JSON." },
    });
  });
});

describe("validateMiddleware", () => {
  const schema = z.object({ body: z.object({ name: z.string().trim().min(1), age: z.number() }) });
  const app = express();
  app.use(express.json());
  app.post("/echo", validateMiddleware(schema), (req, res) => res.json(req.body));
  app.use(errorMiddleware);

  it("passes the parsed body on, on Express 5, with a query string present", async () => {
    const res = await request(app).post("/echo?x=1").send({ name: "  Ada ", age: 36, extra: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: "Ada", age: 36 });
  });

  it("reports each invalid field", async () => {
    const res = await request(app).post("/echo").send({ name: "", age: "old" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
        expect.objectContaining({ path: "age" }),
      ]),
    );
  });
});
```

- [ ] **Step 4: Run the tests to see them fail**

Run: `pnpm --filter @social-agent/db run build` then `pnpm --filter api run test`
Expected: FAIL. `@/app` has no `createApp`, and `@/auth/clerk-gateway` does not exist. (Importing today's `app.ts` would also start Mastra; that is what this task removes from the import path.)

- [ ] **Step 5: Extend AppError and repair the two middlewares**

`apps/api/src/utils/AppError.ts`:

```ts
export interface ErrorDetail {
    path: string;
    message: string;
}

export class AppError extends Error{
    public readonly statusCode: number;
    public readonly code?:string
    public readonly details?: ErrorDetail[]
    constructor(message:string,  statusCode=500, code="INTERNAL_SERVER_ERROR", details?: ErrorDetail[]){
        super(message)
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this,this.constructor)
    }
}
```

`apps/api/src/middlewares/error.middleware.ts`:

```ts
import { AppError } from "@/utils/AppError";
import type { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.details && { details: err.details }),
            }
        })
    }

    // express.json() rejects a body it cannot parse with this type.
    if (err?.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            error: {
                code: "INVALID_JSON",
                message: "The request body is not valid JSON.",
            },
        })
    }

    // Unexpected: the details stay in the server log, never in the response.
    console.error(err)
    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
        },
    });
}
```

`apps/api/src/middlewares/validate.middleware.ts`:

```ts
import { AppError } from "@/utils/AppError"
import type { NextFunction, Request, Response } from "express"
import type { ZodType } from "zod"

/**
 * Validates `{ body, query, params }` against the schema and replaces `req.body`
 * with the parsed value. `req.query` is read-only in Express 5 and `req.params`
 * is rebuilt per route, so neither is reassigned.
 */
export const validateMiddleware = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        })

        if (!result.success) {
            const details = result.error.issues.map((issue) => ({
                // "body.brand.colors.0.hex" reads better to a client as "brand.colors.0.hex"
                path: (issue.path[0] === "body" ? issue.path.slice(1) : issue.path).join("."),
                message: issue.message,
            }))

            return next(new AppError("Some fields are invalid.", 400, "VALIDATION_ERROR", details))
        }

        const data = result.data as { body?: unknown }
        if (data.body !== undefined) req.body = data.body

        next()
    }
}
```

- [ ] **Step 6: Write the Clerk seam**

Check the installed names first: `clerkMiddleware`, `getAuth` and `clerkClient` in `apps/api/node_modules/@clerk/express/dist/index.d.ts`.

`apps/api/src/auth/clerk-gateway.ts`:

```ts
import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";
import type { Request, RequestHandler } from "express";

export interface ClerkUserInfo {
  email: string;
  /** `publicMetadata.role` as Clerk returned it. Only the string "admin" means anything. */
  metadataRole: unknown;
}

/**
 * Everything the API needs from Clerk. Tests replace this object, and it is the
 * only file to change when Clerk is replaced by our own auth.
 */
export interface ClerkGateway {
  /** Mounted in front of /v1 so `getUserId` can read the verified session. */
  middleware?: RequestHandler;
  getUserId(req: Request): string | null;
  fetchUser(clerkId: string): Promise<ClerkUserInfo>;
}

/** Reads CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY from the environment. */
export function createClerkGateway(): ClerkGateway {
  return {
    middleware: clerkMiddleware(),
    getUserId: (req) => getAuth(req).userId ?? null,
    async fetchUser(clerkId) {
      const user = await clerkClient.users.getUser(clerkId);
      const email =
        user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
      return { email, metadataRole: user.publicMetadata.role };
    },
  };
}
```

- [ ] **Step 7: Rewrite app.ts as a factory and server.ts as the composition root**

`apps/api/src/app.ts`:

```ts
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import type { Db } from "@social-agent/db";
import type { ClerkGateway } from "@/auth/clerk-gateway";
import healthRoute from "@/routes/health.route"
import {errorMiddleware} from "@/middlewares/error.middleware";

export interface AppDeps {
  db: Db;
  clerk: ClerkGateway;
  /** Lowercased emails that are admins regardless of Clerk metadata. */
  adminEmails: string[];
  corsOrigins: string[];
  /** Mounts routes this module must not import, such as Mastra. Runs before our routes. */
  extend?: (app: Express) => Promise<void>;
}

export async function createApp(deps: AppDeps): Promise<Express> {
  const app = express();
  app.use(helmet());

  app.use(cors({
    origin: deps.corsOrigins,
    credentials: true,
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (deps.extend) await deps.extend(app);

  // Routes
  app.use("/health", healthRoute);

  app.use(errorMiddleware);
  return app;
}
```

`apps/api/src/server.ts`:

```ts
import "dotenv/config";
import { MastraServer } from "@mastra/express";
import { createDb } from "@social-agent/db";
import { createApp } from "./app"
import { createClerkGateway } from "./auth/clerk-gateway";
import { loadEnv, type Env } from "./config/env";
import { mastra } from "./mastra";

let env: Env;
try {
    env = loadEnv();
} catch (error) {
    console.error((error as Error).message);
    process.exit(1);
}

const { db } = createDb(env.DATABASE_URL);

const app = await createApp({
    db,
    clerk: createClerkGateway(),
    adminEmails: env.ADMIN_EMAILS,
    corsOrigins: env.CORS_ORIGINS,
    extend: async (instance) => {
        const server = new MastraServer({ app: instance, mastra });
        await server.init();
    },
});

app.listen(env.PORT,()=>{
    console.log(`Server is running on port ${env.PORT}`)
})
```

- [ ] **Step 8: Run the tests to see them pass**

Run: `pnpm --filter api run test`
Expected: PASS, 9 tests (4 env, 5 new). The Postgres container must be running.

- [ ] **Step 9: Type-check and build**

Run: `pnpm --filter api run check-types` then `pnpm --filter api run build`
Expected: both PASS.

- [ ] **Step 10: Commit**

```bash
git add apps/api/src apps/api/test apps/api/vitest.config.ts apps/api/package.json pnpm-lock.yaml
git commit -m "feat(api): app factory, Clerk seam, test harness and middleware fixes"
```

---

### Task 6: Users, `requireUser` and `GET /v1/me`

**Files:**
- Create: `apps/api/src/services/users.service.ts`
- Modify: `apps/api/src/middlewares/auth.middleware.ts` (currently empty)
- Create: `apps/api/src/types/express.d.ts`
- Create: `apps/api/src/controllers/me.controller.ts`
- Create: `apps/api/src/routes/v1.route.ts`
- Modify: `apps/api/src/app.ts` (mount `/v1`)
- Delete: `apps/api/src/services/.gitkeep`
- Create: `apps/api/test/me.test.ts`

**Interfaces:**
- Consumes: `AppDeps`, `ClerkGateway` (Task 5); `users`, `Db` from `@social-agent/db`; test helpers `makeTestApp`, `asUser`, `resetDb`, `db`, `pool`.
- Produces:

```ts
// src/services/users.service.ts
type Role = "admin" | "client"
interface AuthUser { id: string; clerkId: string; email: string; role: Role }
interface UserDeps { db: Db; clerk: ClerkGateway; adminEmails: string[] }
function roleFor(email: string, metadataRole: unknown, adminEmails: string[]): Role
function resolveUser(deps: UserDeps, clerkId: string, now?: Date): Promise<AuthUser>

// src/middlewares/auth.middleware.ts
function requireUser(deps: UserDeps): RequestHandler     // sets req.user
function currentUser(req: Request): AuthUser             // throws 401 AppError when absent

// src/routes/v1.route.ts
function createV1Router(deps: AppDeps): Router
```

`GET /v1/me` responds `{ success: true, data: { id, email, role } }`.

- [ ] **Step 1: Write the failing tests**

`apps/api/test/me.test.ts`:

```ts
import { users } from "@social-agent/db";
import { eq } from "drizzle-orm";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { asUser, db, makeTestApp, pool, resetDb } from "./helpers";

beforeEach(resetDb);
afterAll(() => pool.end());

describe("GET /v1/me", () => {
  it("rejects an anonymous request with 401", async () => {
    const { app } = await makeTestApp();
    const res = await request(app).get("/v1/me");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      error: { code: "UNAUTHENTICATED", message: "Sign in to continue." },
    });
  });

  it("creates the user on the first request and reuses it afterwards", async () => {
    const { app, clerkUsers, fetchUser } = await makeTestApp();
    clerkUsers.set("clerk_owner", { email: "owner@acme.test", metadataRole: undefined });

    const first = await request(app).get("/v1/me").set(asUser("clerk_owner"));
    const second = await request(app).get("/v1/me").set(asUser("clerk_owner"));

    expect(first.status).toBe(200);
    expect(first.body.data).toEqual({ id: expect.any(String), email: "owner@acme.test", role: "client" });
    expect(second.body.data.id).toBe(first.body.data.id);
    expect(await db.select().from(users)).toHaveLength(1);
    expect(fetchUser).toHaveBeenCalledTimes(1);
  });

  it("survives two first requests arriving together", async () => {
    const { app, clerkUsers } = await makeTestApp();
    clerkUsers.set("clerk_owner", { email: "owner@acme.test", metadataRole: undefined });

    const [a, b] = await Promise.all([
      request(app).get("/v1/me").set(asUser("clerk_owner")),
      request(app).get("/v1/me").set(asUser("clerk_owner")),
    ]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(a.body.data.id).toBe(b.body.data.id);
    expect(await db.select().from(users)).toHaveLength(1);
  });

  it("makes an admin from Clerk public metadata", async () => {
    const { app, clerkUsers } = await makeTestApp();
    clerkUsers.set("clerk_admin", { email: "boss@agency.test", metadataRole: "admin" });
    const res = await request(app).get("/v1/me").set(asUser("clerk_admin"));
    expect(res.body.data.role).toBe("admin");
  });

  it("makes an admin from ADMIN_EMAILS, ignoring letter case", async () => {
    const { app, clerkUsers } = await makeTestApp({ adminEmails: ["boss@agency.test"] });
    clerkUsers.set("clerk_admin", { email: "Boss@Agency.test", metadataRole: undefined });
    const res = await request(app).get("/v1/me").set(asUser("clerk_admin"));
    expect(res.body.data.role).toBe("admin");
  });

  it("treats any other metadata role as a client", async () => {
    const { app, clerkUsers } = await makeTestApp();
    clerkUsers.set("clerk_x", { email: "x@acme.test", metadataRole: "superuser" });
    const res = await request(app).get("/v1/me").set(asUser("clerk_x"));
    expect(res.body.data.role).toBe("client");
  });

  it("re-reads email and role from Clerk once the row is over an hour old", async () => {
    const { app, clerkUsers, fetchUser } = await makeTestApp();
    clerkUsers.set("clerk_owner", { email: "owner@acme.test", metadataRole: undefined });
    await request(app).get("/v1/me").set(asUser("clerk_owner"));

    // Promoted in Clerk, and our copy is two hours old.
    clerkUsers.set("clerk_owner", { email: "owner@new.test", metadataRole: "admin" });
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await db.update(users).set({ updatedAt: twoHoursAgo }).where(eq(users.clerkId, "clerk_owner"));

    const res = await request(app).get("/v1/me").set(asUser("clerk_owner"));

    expect(res.body.data).toMatchObject({ email: "owner@new.test", role: "admin" });
    expect(fetchUser).toHaveBeenCalledTimes(2);
    expect(await db.select().from(users)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter api run test -- test/me.test.ts`
Expected: FAIL, every request returns 404 because `/v1` is not mounted.

- [ ] **Step 3: Write the users service**

`apps/api/src/services/users.service.ts`:

```ts
import { users, type Db, type UserRow } from "@social-agent/db";
import { eq } from "drizzle-orm";
import type { ClerkGateway } from "@/auth/clerk-gateway";

export type Role = "admin" | "client";

export interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  role: Role;
}

export interface UserDeps {
  db: Db;
  clerk: ClerkGateway;
  adminEmails: string[];
}

/** How long our copy of a Clerk user is trusted before it is read again. */
const STALE_AFTER_MS = 60 * 60 * 1000;

export function roleFor(email: string, metadataRole: unknown, adminEmails: string[]): Role {
  if (metadataRole === "admin") return "admin";
  if (adminEmails.includes(email.toLowerCase())) return "admin";
  return "client";
}

const toAuthUser = (row: UserRow): AuthUser => ({
  id: row.id,
  clerkId: row.clerkId,
  email: row.email,
  role: row.role,
});

async function findByClerkId(db: Db, clerkId: string) {
  const [row] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return row;
}

/** Finds our user for a Clerk id, creating it on first sight and refreshing it when stale. */
export async function resolveUser(deps: UserDeps, clerkId: string, now = new Date()): Promise<AuthUser> {
  const existing = await findByClerkId(deps.db, clerkId);
  if (existing && now.getTime() - existing.updatedAt.getTime() < STALE_AFTER_MS) {
    return toAuthUser(existing);
  }

  const info = await deps.clerk.fetchUser(clerkId);
  const role = roleFor(info.email, info.metadataRole, deps.adminEmails);

  if (existing) {
    const [updated] = await deps.db
      .update(users)
      .set({ email: info.email, role, updatedAt: now })
      .where(eq(users.id, existing.id))
      .returning();
    return toAuthUser(updated ?? existing);
  }

  // Two first requests can race; the loser's insert is dropped and both read the winner's row.
  await deps.db
    .insert(users)
    .values({ clerkId, email: info.email, role, createdAt: now, updatedAt: now })
    .onConflictDoNothing({ target: users.clerkId });

  const created = await findByClerkId(deps.db, clerkId);
  if (!created) throw new Error(`User row for ${clerkId} is missing right after insert`);
  return toAuthUser(created);
}
```

Delete `apps/api/src/services/.gitkeep`.

- [ ] **Step 4: Write the middleware and the request type**

`apps/api/src/types/express.d.ts`:

```ts
import type { AuthUser } from "@/services/users.service";

declare global {
  namespace Express {
    interface Request {
      /** Set by requireUser. Read it with currentUser(req). */
      user?: AuthUser;
    }
  }
}

export {};
```

`apps/api/src/middlewares/auth.middleware.ts`:

```ts
import type { Request, RequestHandler } from "express";
import { resolveUser, type AuthUser, type UserDeps } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { asyncHandler } from "@/utils/asyncHandler";

const unauthenticated = () => new AppError("Sign in to continue.", 401, "UNAUTHENTICATED");

/** Turns a verified Clerk session into `req.user`, or answers 401. */
export const requireUser = (deps: UserDeps): RequestHandler =>
  asyncHandler(async (req, _res, next) => {
    const clerkId = deps.clerk.getUserId(req);
    if (!clerkId) throw unauthenticated();
    req.user = await resolveUser(deps, clerkId);
    next();
  });

export function currentUser(req: Request): AuthUser {
  if (!req.user) throw unauthenticated();
  return req.user;
}
```

- [ ] **Step 5: Write the controller and the v1 router, and mount it**

`apps/api/src/controllers/me.controller.ts`:

```ts
import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";

export class MeController {
    static async me(req: Request, res: Response) {
        const { id, email, role } = currentUser(req);
        res.status(200).json({ success: true, data: { id, email, role } });
    }
}
```

`apps/api/src/routes/v1.route.ts`:

```ts
import { Router } from "express";
import type { AppDeps } from "@/app";
import { MeController } from "@/controllers/me.controller";
import { requireUser } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

/** Everything under /v1 needs a signed-in user. */
export function createV1Router(deps: AppDeps) {
  const router = Router();

  if (deps.clerk.middleware) router.use(deps.clerk.middleware);
  router.use(requireUser(deps));

  router.get("/me", asyncHandler(MeController.me));

  return router;
}
```

In `apps/api/src/app.ts` add the import `import { createV1Router } from "@/routes/v1.route";` and, directly under `app.use("/health", healthRoute);`, add:

```ts
  app.use("/v1", createV1Router(deps));
```

`AppDeps` is imported as a type in `v1.route.ts` and `createV1Router` as a value in `app.ts`; the type-only direction keeps this from being a runtime import cycle. Keep `import type`.

- [ ] **Step 6: Run the tests to see them pass**

Run: `pnpm --filter api run test`
Expected: PASS, 16 tests.

- [ ] **Step 7: Type-check**

Run: `pnpm --filter api run check-types`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src apps/api/test/me.test.ts
git commit -m "feat(api): users table sync, requireUser and GET /v1/me"
```

---

### Task 7: Clients: create, read and list

**Files:**
- Create: `apps/api/src/services/clients.service.ts`
- Create: `apps/api/src/controllers/clients.controller.ts`
- Create: `apps/api/src/routes/clients.route.ts`
- Modify: `apps/api/src/routes/v1.route.ts` (mount `/clients`)
- Create: `apps/api/test/clients-fixtures.ts`
- Create: `apps/api/test/clients.read.test.ts`

**Interfaces:**
- Consumes: `AuthUser`, `currentUser`, `validateMiddleware`, `AppError`; `clients`, `Db`, `ClientRow` from `@social-agent/db`; `newClientSchema`, `clientSchema`, `DEFAULT_ACCENT`, types `Client`, `NewClientInput` from `@social-agent/shared`.
- Produces:

```ts
// src/services/clients.service.ts
function listClients(db: Db, user: AuthUser): Promise<Client[]>
function createClient(db: Db, user: AuthUser, input: NewClientInput): Promise<Client>
function getClient(db: Db, user: AuthUser, id: string): Promise<Client>
// used by Task 8, defined here:
function accessWhere(user: AuthUser, id: string): SQL | undefined
function toClient(row: ClientRow): Client
function clientNotFound(): AppError
function isUuid(value: string): boolean

// src/controllers/clients.controller.ts
function createClientsController(db: Db): { list, create, get }   // Task 8 adds update, remove

// src/routes/clients.route.ts
function createClientsRouter(db: Db): Router

// test/clients-fixtures.ts
validClientInput, registerUsers(clerkUsers), createClientAs(app, clerkId, overrides?)
```

- [ ] **Step 1: Write the shared test fixtures**

`apps/api/test/clients-fixtures.ts`:

```ts
import type { Express } from "express";
import request from "supertest";
import type { ClerkUserInfo } from "@/auth/clerk-gateway";
import { asUser } from "./helpers";

export const validClientInput = {
  name: "Acme Coffee",
  url: "acmecoffee.com",
  industry: "Cafe",
  brand: {
    tagline: "Coffee worth waking up for",
    summary: "A neighbourhood roastery.",
    audience: "Commuters and remote workers",
    voice: ["warm", "direct"],
    colors: [
      { name: "Espresso", hex: "#3B2F2F" },
      { name: "Cream", hex: "#F5E9DA" },
    ],
    fonts: { heading: "Fraunces", body: "Inter" },
  },
  platforms: ["instagram", "linkedin"],
};

/** Three people: two unrelated owners and an agency admin. */
export function registerUsers(clerkUsers: Map<string, ClerkUserInfo>) {
  clerkUsers.set("clerk_owner", { email: "owner@acme.test", metadataRole: undefined });
  clerkUsers.set("clerk_stranger", { email: "stranger@other.test", metadataRole: undefined });
  clerkUsers.set("clerk_admin", { email: "boss@agency.test", metadataRole: "admin" });
}

export async function createClientAs(app: Express, clerkId: string, overrides: Record<string, unknown> = {}) {
  const res = await request(app)
    .post("/v1/clients")
    .set(asUser(clerkId))
    .send({ ...validClientInput, ...overrides });
  if (res.status !== 201) throw new Error(`Test setup: create failed with ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.data as { id: string; ownerId: string; name: string };
}
```

- [ ] **Step 2: Write the failing tests**

`apps/api/test/clients.read.test.ts`:

```ts
import { clientSchema } from "@social-agent/shared";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createClientAs, registerUsers, validClientInput } from "./clients-fixtures";
import { asUser, makeTestApp, pool, resetDb } from "./helpers";

const NOT_FOUND = {
  success: false,
  error: { code: "CLIENT_NOT_FOUND", message: "This client doesn't exist, or you don't have access to it." },
};

beforeEach(resetDb);
afterAll(() => pool.end());

async function setup() {
  const ctx = await makeTestApp();
  registerUsers(ctx.clerkUsers);
  return ctx.app;
}

describe("POST /v1/clients", () => {
  it("rejects an anonymous request with 401", async () => {
    const app = await setup();
    const res = await request(app).post("/v1/clients").send(validClientInput);
    expect(res.status).toBe(401);
  });

  it("creates a client owned by the caller, in the shape the web app expects", async () => {
    const app = await setup();
    const me = await request(app).get("/v1/me").set(asUser("clerk_owner"));

    const res = await request(app).post("/v1/clients").set(asUser("clerk_owner")).send(validClientInput);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const client = clientSchema.parse(res.body.data);
    expect(client).toMatchObject({
      ownerId: me.body.data.id,
      name: "Acme Coffee",
      url: "https://acmecoffee.com",
      accent: "#3B2F2F",
      stage: "onboarding",
      business: {},
      accounts: [],
      preferences: { timezone: "UTC", approvalEmails: true },
      stats: { followers: 0, followersDelta: 0, engagementRate: 0, engagementDelta: 0, scheduled: 0, pendingApprovals: 0 },
    });
    expect(new Date(client.createdAt).toISOString()).toBe(client.createdAt);
  });

  it("stores business details and the extra brand fields", async () => {
    const app = await setup();
    const business = {
      phone: "+91 98765 43210",
      email: "hello@acmecoffee.com",
      location: { city: "Bengaluru", country: "IN" },
      hours: [{ day: "mon", open: "08:00", close: "21:00" }],
    };
    const brand = { ...validClientInput.brand, aesthetic: "minimal, earthy", keywords: ["coffee", "roastery"] };

    const created = await createClientAs(app, "clerk_owner", { business, brand });
    const res = await request(app).get(`/v1/clients/${created.id}`).set(asUser("clerk_owner"));

    expect(res.body.data.business).toEqual(business);
    expect(res.body.data.brand).toEqual(brand);
  });

  it("falls back to the default accent when the brand has no colours", async () => {
    const app = await setup();
    const res = await request(app)
      .post("/v1/clients")
      .set(asUser("clerk_owner"))
      .send({ ...validClientInput, brand: { ...validClientInput.brand, colors: [] } });
    expect(res.body.data.accent).toBe("#4B3FE4");
  });

  it("answers 400 with field messages for an invalid body", async () => {
    const app = await setup();
    const res = await request(app)
      .post("/v1/clients")
      .set(asUser("clerk_owner"))
      .send({ ...validClientInput, name: "", business: { email: "nope", hours: [{ day: "funday", open: "8am", close: "21:00" }] } });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    const paths = res.body.error.details.map((d: { path: string }) => d.path);
    expect(paths).toEqual(expect.arrayContaining(["name", "business.email", "business.hours.0.day", "business.hours.0.open"]));
  });

  it("answers 400 when there is no body at all", async () => {
    const app = await setup();
    const res = await request(app).post("/v1/clients").set(asUser("clerk_owner"));
    expect(res.status).toBe(400);
  });
});

describe("GET /v1/clients/:id", () => {
  it("returns the owner's client", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");
    const res = await request(app).get(`/v1/clients/${created.id}`).set(asUser("clerk_owner"));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(created.id);
  });

  it("answers a stranger with the same 404 as a missing client", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");

    const stranger = await request(app).get(`/v1/clients/${created.id}`).set(asUser("clerk_stranger"));
    const missing = await request(app).get("/v1/clients/00000000-0000-4000-8000-000000000000").set(asUser("clerk_owner"));
    const malformed = await request(app).get("/v1/clients/not-a-uuid").set(asUser("clerk_owner"));

    for (const res of [stranger, missing, malformed]) {
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND);
    }
  });

  it("lets an admin read any client", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");
    const res = await request(app).get(`/v1/clients/${created.id}`).set(asUser("clerk_admin"));
    expect(res.status).toBe(200);
  });
});

describe("GET /v1/clients", () => {
  it("shows owners only their own clients and admins everything, newest first", async () => {
    const app = await setup();
    const first = await createClientAs(app, "clerk_owner", { name: "First" });
    const second = await createClientAs(app, "clerk_owner", { name: "Second" });
    const other = await createClientAs(app, "clerk_stranger", { name: "Other" });

    const owner = await request(app).get("/v1/clients").set(asUser("clerk_owner"));
    const stranger = await request(app).get("/v1/clients").set(asUser("clerk_stranger"));
    const admin = await request(app).get("/v1/clients").set(asUser("clerk_admin"));

    expect(owner.body.data.map((c: { id: string }) => c.id)).toEqual([second.id, first.id]);
    expect(stranger.body.data.map((c: { id: string }) => c.id)).toEqual([other.id]);
    expect(admin.body.data.map((c: { id: string }) => c.id)).toEqual([other.id, second.id, first.id]);
  });

  it("returns an empty list for someone with no clients", async () => {
    const app = await setup();
    const res = await request(app).get("/v1/clients").set(asUser("clerk_owner"));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [] });
  });
});
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `pnpm --filter api run test -- test/clients.read.test.ts`
Expected: FAIL with 404s, because `/v1/clients` does not exist.

- [ ] **Step 4: Write the clients service**

`apps/api/src/services/clients.service.ts`:

```ts
import { clients, type ClientRow, type Db } from "@social-agent/db";
import { DEFAULT_ACCENT, type BrandKit, type Client, type NewClientInput } from "@social-agent/shared";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";

/** Same answer for "missing" and "not yours", so ids can't be probed. */
export const clientNotFound = () =>
  new AppError("This client doesn't exist, or you don't have access to it.", 404, "CLIENT_NOT_FOUND");

export const isUuid = (value: string) => z.uuid().safeParse(value).success;

/** The workspace accent always follows the first brand colour. */
export const accentFor = (brand: BrandKit) => brand.colors[0]?.hex ?? DEFAULT_ACCENT;

/**
 * The one place the ownership rule lives: an admin reaches any client,
 * everyone else only the clients they own.
 */
export function accessWhere(user: AuthUser, id: string) {
  return user.role === "admin"
    ? eq(clients.id, id)
    : and(eq(clients.id, id), eq(clients.ownerId, user.id));
}

/** Social accounts and stats get real values when their tables exist (phases 3 and 5). */
export function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    url: row.url,
    industry: row.industry,
    accent: row.accent,
    stage: row.stage,
    brand: row.brand,
    business: row.business,
    platforms: row.platforms,
    accounts: [],
    preferences: row.preferences,
    createdAt: row.createdAt.toISOString(),
    stats: {
      followers: 0,
      followersDelta: 0,
      engagementRate: 0,
      engagementDelta: 0,
      scheduled: 0,
      pendingApprovals: 0,
    },
  };
}

export async function listClients(db: Db, user: AuthUser): Promise<Client[]> {
  const rows = await db
    .select()
    .from(clients)
    .where(user.role === "admin" ? undefined : eq(clients.ownerId, user.id))
    .orderBy(desc(clients.createdAt));
  return rows.map(toClient);
}

export async function createClient(db: Db, user: AuthUser, input: NewClientInput): Promise<Client> {
  const [row] = await db
    .insert(clients)
    .values({
      ownerId: user.id,
      name: input.name,
      url: input.url,
      industry: input.industry,
      accent: accentFor(input.brand),
      brand: input.brand,
      business: input.business ?? {},
      platforms: input.platforms,
    })
    .returning();
  if (!row) throw new Error("Insert into clients returned no row");
  return toClient(row);
}

export async function getClient(db: Db, user: AuthUser, id: string): Promise<Client> {
  if (!isUuid(id)) throw clientNotFound();
  const [row] = await db.select().from(clients).where(accessWhere(user, id)).limit(1);
  if (!row) throw clientNotFound();
  return toClient(row);
}
```

- [ ] **Step 5: Write the controller and the router, and mount it**

`apps/api/src/controllers/clients.controller.ts`:

```ts
import type { Db } from "@social-agent/db";
import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import * as clientsService from "@/services/clients.service";

/** Express 5 types a route param as string | string[]; ours are always single. */
const idParam = (req: Request) => String(req.params.id);

export function createClientsController(db: Db) {
  return {
    async list(req: Request, res: Response) {
      const data = await clientsService.listClients(db, currentUser(req));
      res.status(200).json({ success: true, data });
    },

    async create(req: Request, res: Response) {
      const data = await clientsService.createClient(db, currentUser(req), req.body);
      res.status(201).json({ success: true, data });
    },

    async get(req: Request, res: Response) {
      const data = await clientsService.getClient(db, currentUser(req), idParam(req));
      res.status(200).json({ success: true, data });
    },
  };
}
```

`apps/api/src/routes/clients.route.ts`:

```ts
import type { Db } from "@social-agent/db";
import { newClientSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { createClientsController } from "@/controllers/clients.controller";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

export function createClientsRouter(db: Db) {
  const router = Router();
  const controller = createClientsController(db);

  router.get("/", asyncHandler(controller.list));
  router.post("/", validateMiddleware(z.object({ body: newClientSchema })), asyncHandler(controller.create));
  router.get("/:id", asyncHandler(controller.get));

  return router;
}
```

In `apps/api/src/routes/v1.route.ts` add the import `import { createClientsRouter } from "@/routes/clients.route";` and, under the `/me` route, add:

```ts
  router.use("/clients", createClientsRouter(deps.db));
```

- [ ] **Step 6: Run the tests to see them pass**

Run: `pnpm --filter api run test`
Expected: PASS, 27 tests. If the "newest first" test is flaky because two rows share a timestamp, that is a real ordering bug: add `desc(clients.id)` as a second `orderBy` key only if `created_at` values are genuinely identical, and say so in the commit.

- [ ] **Step 7: Type-check**

Run: `pnpm --filter api run check-types`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src apps/api/test
git commit -m "feat(api): create, read and list clients with the ownership rule"
```

---

### Task 8: Clients: update and delete

**Files:**
- Modify: `apps/api/src/services/clients.service.ts` (add two functions)
- Modify: `apps/api/src/controllers/clients.controller.ts` (add two handlers)
- Modify: `apps/api/src/routes/clients.route.ts` (add two routes)
- Create: `apps/api/test/clients.write.test.ts`

**Interfaces:**
- Consumes from Task 7: `accessWhere`, `accentFor`, `toClient`, `clientNotFound`, `isUuid`, `createClientsController`, `createClientsRouter`, fixtures `createClientAs`, `registerUsers`, `validClientInput`. From `@social-agent/shared`: `clientPatchSchema`, type `ClientPatch`.
- Produces:

```ts
function updateClient(db: Db, user: AuthUser, id: string, patch: ClientPatch): Promise<Client>
function deleteClient(db: Db, user: AuthUser, id: string): Promise<void>
```

`PATCH /v1/clients/:id` returns 200 with the updated client. `DELETE /v1/clients/:id` returns 204 with no body.

- [ ] **Step 1: Write the failing tests**

`apps/api/test/clients.write.test.ts`:

```ts
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createClientAs, registerUsers, validClientInput } from "./clients-fixtures";
import { asUser, makeTestApp, pool, resetDb } from "./helpers";

beforeEach(resetDb);
afterAll(() => pool.end());

async function setup() {
  const ctx = await makeTestApp();
  registerUsers(ctx.clerkUsers);
  return ctx.app;
}

describe("PATCH /v1/clients/:id", () => {
  it("changes only the fields that were sent", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");

    const res = await request(app)
      .patch(`/v1/clients/${created.id}`)
      .set(asUser("clerk_owner"))
      .send({ name: "Acme Roasters", preferences: { timezone: "Asia/Kolkata", approvalEmails: false } });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: created.id,
      name: "Acme Roasters",
      industry: "Cafe",
      preferences: { timezone: "Asia/Kolkata", approvalEmails: false },
      platforms: ["instagram", "linkedin"],
    });
  });

  it("replaces business and brand as a whole, and the accent follows the first colour", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner", { business: { phone: "111", email: "old@acme.test" } });
    const brand = {
      ...validClientInput.brand,
      colors: [{ name: "Leaf", hex: "#2F6B3B" }],
      aesthetic: "fresh, botanical",
      keywords: ["tea"],
    };

    const res = await request(app)
      .patch(`/v1/clients/${created.id}`)
      .set(asUser("clerk_owner"))
      .send({ brand, business: { phone: "222" } });

    expect(res.body.data.brand).toEqual(brand);
    expect(res.body.data.accent).toBe("#2F6B3B");
    expect(res.body.data.business).toEqual({ phone: "222" });
  });

  it("ignores fields an owner may not change", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");

    const res = await request(app)
      .patch(`/v1/clients/${created.id}`)
      .set(asUser("clerk_owner"))
      .send({ name: "Renamed", ownerId: "00000000-0000-4000-8000-000000000000", stage: "learning", id: "other", accent: "#000000" });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: created.id,
      ownerId: created.ownerId,
      name: "Renamed",
      stage: "onboarding",
      accent: "#3B2F2F",
    });
  });

  it("accepts an empty patch and changes nothing", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");
    const res = await request(app).patch(`/v1/clients/${created.id}`).set(asUser("clerk_owner")).send({});
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Acme Coffee");
  });

  it("answers 400 with field messages for invalid values", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");
    const res = await request(app)
      .patch(`/v1/clients/${created.id}`)
      .set(asUser("clerk_owner"))
      .send({ name: "", business: { email: "nope" } });

    expect(res.status).toBe(400);
    const paths = res.body.error.details.map((d: { path: string }) => d.path);
    expect(paths).toEqual(expect.arrayContaining(["name", "business.email"]));
  });

  it("answers a stranger with 404 and leaves the client untouched", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");

    const res = await request(app).patch(`/v1/clients/${created.id}`).set(asUser("clerk_stranger")).send({ name: "Hijacked" });
    const after = await request(app).get(`/v1/clients/${created.id}`).set(asUser("clerk_owner"));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("CLIENT_NOT_FOUND");
    expect(after.body.data.name).toBe("Acme Coffee");
  });

  it("lets an admin update any client without taking ownership", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");
    const res = await request(app).patch(`/v1/clients/${created.id}`).set(asUser("clerk_admin")).send({ industry: "Coffee roastery" });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ industry: "Coffee roastery", ownerId: created.ownerId });
  });

  it("answers 404 for a malformed id", async () => {
    const app = await setup();
    const res = await request(app).patch("/v1/clients/not-a-uuid").set(asUser("clerk_owner")).send({ name: "X" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /v1/clients/:id", () => {
  it("deletes the owner's client", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");

    const res = await request(app).delete(`/v1/clients/${created.id}`).set(asUser("clerk_owner"));
    const after = await request(app).get(`/v1/clients/${created.id}`).set(asUser("clerk_owner"));

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(after.status).toBe(404);
  });

  it("answers a stranger with 404 and deletes nothing", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");

    const res = await request(app).delete(`/v1/clients/${created.id}`).set(asUser("clerk_stranger"));
    const after = await request(app).get(`/v1/clients/${created.id}`).set(asUser("clerk_owner"));

    expect(res.status).toBe(404);
    expect(after.status).toBe(200);
  });

  it("lets an admin delete any client", async () => {
    const app = await setup();
    const created = await createClientAs(app, "clerk_owner");
    const res = await request(app).delete(`/v1/clients/${created.id}`).set(asUser("clerk_admin"));
    expect(res.status).toBe(204);
  });

  it("answers 404 when the client is already gone or the id is malformed", async () => {
    const app = await setup();
    const gone = await request(app).delete("/v1/clients/00000000-0000-4000-8000-000000000000").set(asUser("clerk_owner"));
    const malformed = await request(app).delete("/v1/clients/not-a-uuid").set(asUser("clerk_owner"));
    expect(gone.status).toBe(404);
    expect(malformed.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter api run test -- test/clients.write.test.ts`
Expected: FAIL with 404s from Express, because the PATCH and DELETE routes do not exist.

- [ ] **Step 3: Add the two service functions**

In `apps/api/src/services/clients.service.ts`, extend the shared import to `import { DEFAULT_ACCENT, type BrandKit, type Client, type ClientPatch, type NewClientInput } from "@social-agent/shared";`, extend the db import to `import { clients, type ClientRow, type Db, type NewClientRow } from "@social-agent/db";`, and append:

```ts
/**
 * The access check is part of the UPDATE's WHERE clause, so there is no window
 * between "may they?" and "do it".
 */
export async function updateClient(db: Db, user: AuthUser, id: string, patch: ClientPatch): Promise<Client> {
  if (!isUuid(id)) throw clientNotFound();

  const changes: Partial<NewClientRow> = { updatedAt: new Date() };
  if (patch.name !== undefined) changes.name = patch.name;
  if (patch.industry !== undefined) changes.industry = patch.industry;
  if (patch.platforms !== undefined) changes.platforms = patch.platforms;
  if (patch.preferences !== undefined) changes.preferences = patch.preferences;
  if (patch.business !== undefined) changes.business = patch.business;
  if (patch.brand !== undefined) {
    changes.brand = patch.brand;
    changes.accent = accentFor(patch.brand);
  }

  const [row] = await db.update(clients).set(changes).where(accessWhere(user, id)).returning();
  if (!row) throw clientNotFound();
  return toClient(row);
}

export async function deleteClient(db: Db, user: AuthUser, id: string): Promise<void> {
  if (!isUuid(id)) throw clientNotFound();
  const deleted = await db.delete(clients).where(accessWhere(user, id)).returning({ id: clients.id });
  if (deleted.length === 0) throw clientNotFound();
}
```

- [ ] **Step 4: Add the handlers and routes**

In `apps/api/src/controllers/clients.controller.ts`, add inside the returned object after `get`:

```ts
    async update(req: Request, res: Response) {
      const data = await clientsService.updateClient(db, currentUser(req), idParam(req), req.body);
      res.status(200).json({ success: true, data });
    },

    async remove(req: Request, res: Response) {
      await clientsService.deleteClient(db, currentUser(req), idParam(req));
      res.status(204).end();
    },
```

In `apps/api/src/routes/clients.route.ts`, change the shared import to `import { clientPatchSchema, newClientSchema } from "@social-agent/shared";` and add after the `GET /:id` route:

```ts
  router.patch("/:id", validateMiddleware(z.object({ body: clientPatchSchema })), asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.remove));
```

- [ ] **Step 5: Run the whole suite**

Run: `pnpm --filter api run test`
Expected: PASS, 39 tests.

- [ ] **Step 6: Type-check and build**

Run: `pnpm --filter api run check-types` then `pnpm --filter api run build`
Expected: both PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src apps/api/test/clients.write.test.ts
git commit -m "feat(api): update and delete clients"
```

---

### Task 9: Environment hand-off, docs and a real signed-in request

**Files:**
- Modify: `apps/api/.env.example`
- Modify: `apps/api/AGENTS.md`
- Modify: `AGENTS.md` (repo root, one table row)
- User action: `apps/api/.env`

**Interfaces:**
- Consumes: everything above.
- Produces: a running API at the configured port that answers real Clerk sessions.

- [ ] **Step 1: Update the example environment file**

`apps/api/.env.example`:

```
PORT="4000"
NODE_ENV="development"
# Comma separated. The web app's origin.
CORS_ORIGINS="http://localhost:3000"
# Matches docker-compose.yml at the repo root.
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/social_agent"
REDIS_URL="redis://localhost:6379"
# Both keys must come from the same Clerk instance as apps/web.
CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key"
CLERK_SECRET_KEY="sk_test_your_secret_key"
# Comma separated. Dev shortcut: these emails are admins without Clerk metadata.
ADMIN_EMAILS=""
ANTHROPIC_API_KEY=your-api-key
```

`FRONTEND_URL` is removed because nothing reads it; `CORS_ORIGINS` replaces it.

- [ ] **Step 2: Ask the user to update `apps/api/.env`**

Do not read or edit the real `.env`. Ask the user to make these changes and wait for confirmation:

1. `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/social_agent"`
2. Add `CLERK_PUBLISHABLE_KEY`, copied from `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `apps/web/.env.local`.
3. Confirm `CLERK_SECRET_KEY` is the secret key of that same Clerk instance (`CLERK_SECRET_KEY` in `apps/web/.env.local`).
4. `PORT="4000"`, which is what `apps/web` expects by default (`NEXT_PUBLIC_API_URL` falls back to `http://localhost:4000`). Keeping 8080 also works if the web app's `NEXT_PUBLIC_API_URL` is set to match.
5. Optional: `ADMIN_EMAILS` with their own email, to be an admin locally.

- [ ] **Step 3: Apply migrations through the real script**

Run: `pnpm --filter @social-agent/db run db:migrate`
Expected: `Migrations applied.` This proves the script reads `apps/api/.env` correctly.

- [ ] **Step 4: Start the API and check the unauthenticated paths**

Run in the background: `pnpm --filter api run dev`

```bash
curl -s http://localhost:4000/health
curl -s -i http://localhost:4000/v1/me
```

Expected: `/health` returns `"status":"healthy"`. `/v1/me` returns HTTP 401 with `"code":"UNAUTHENTICATED"`. Also check that the Mastra routes still answer, for example `curl -s http://localhost:4000/api/agents` lists `weatherAgent` (confirm the exact path from the `@mastra/express` docs via the `mastra` skill if this one returns 404).

Then prove the start-up check without touching `.env`: `pnpm --filter api exec tsx -e "import('./src/config/env.ts').then(m => m.loadEnv({})).catch(e => console.error(e.message))"` prints `Invalid environment` followed by `DATABASE_URL`, `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY`.

- [ ] **Step 5: Make a real signed-in request**

With `apps/web` running and the user signed in, ask the user to run this in the browser console on `http://localhost:3000` and paste the token into the terminal session (it expires in about a minute, so run the curl commands immediately):

```js
await window.Clerk.session.getToken()
```

```bash
TOKEN="<pasted token>"
curl -s http://localhost:4000/v1/me -H "Authorization: Bearer $TOKEN"
curl -s -X POST http://localhost:4000/v1/clients -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Smoke Test Cafe","url":"smoketest.example","industry":"Cafe","brand":{"tagline":"t","summary":"s","audience":"a","voice":["warm"],"colors":[{"name":"Ink","hex":"#111111"}],"fonts":{"heading":"Inter","body":"Inter"}},"platforms":["instagram"],"business":{"phone":"+1 555 0100","hours":[{"day":"mon","open":"09:00","close":"17:00"}]}}'
curl -s http://localhost:4000/v1/clients -H "Authorization: Bearer $TOKEN"
```

Expected: `/v1/me` returns the user's real email and role; the POST returns 201 with `"url":"https://smoketest.example"` and the business details; the list contains that client. Delete the smoke-test client afterwards with `curl -s -X DELETE http://localhost:4000/v1/clients/<id> -H "Authorization: Bearer $TOKEN" -i` and expect 204.

If the user would rather not paste a token, the fallback is the approach recorded for web E2E: create a throwaway user with the Clerk Backend API, mint a session token for it, run the same curls, then delete the user.

- [ ] **Step 6: Document how to work with the database**

In `apps/api/AGENTS.md`, add this section after `## Rules`:

```markdown
## Database, auth and tests

- Postgres runs in Docker: `docker compose up -d` from the repo root. It has two databases, `social_agent` (development) and `social_agent_test` (tests).
- The schema and migrations live in `packages/db` (`@social-agent/db`). After changing `packages/db/src/schema.ts`: `pnpm --filter @social-agent/db run db:generate`, review the SQL, `pnpm --filter @social-agent/db run build`, then `pnpm --filter @social-agent/db run db:migrate`. Tests apply migrations to the test database themselves.
- Request and response shapes are zod schemas in `packages/shared`. Rebuild it after changes; the API reads both packages from `dist`.
- `src/app.ts` is a factory, `createApp(deps)`. Only `src/server.ts` may import Mastra or read the environment, so tests can build the app without either.
- Everything under `/v1` requires a signed-in user. `src/auth/clerk-gateway.ts` is the only file that imports Clerk; tests replace it and pick the caller with the `x-test-clerk-id` header.
- The ownership rule lives in `accessWhere` in `src/services/clients.service.ts`: admins reach every client, everyone else only their own, and "not yours" answers 404 exactly like "missing". New client-scoped data must go through it.
- Responses use `{ success, data }` or `{ success, error: { code, message, details? } }`.
- Tests: `pnpm --filter api run test` (needs the Postgres container). Write the test first.
```

In the root `AGENTS.md` table, replace the `packages/shared`, `packages/db`, ... row with:

```markdown
| `packages/db` | Drizzle schema, migrations and the Postgres connection (`@social-agent/db`). Local Postgres is `docker compose up -d` |
| `packages/shared`, `packages/config/*` | Shared zod schemas, and lint/TypeScript configs |
```

- [ ] **Step 7: Final verification**

```bash
pnpm --filter @social-agent/shared run test
pnpm --filter api run test
pnpm --filter @social-agent/shared --filter @social-agent/db --filter api run check-types
pnpm --filter @social-agent/shared --filter @social-agent/db --filter api run build
```

Expected: all PASS. Then `git status` and confirm nothing under `docs/` and none of the user's unrelated modified files are staged.

- [ ] **Step 8: Commit**

```bash
git add apps/api/.env.example apps/api/AGENTS.md AGENTS.md
git commit -m "docs: backend foundation setup, env example and agent guidance"
```

---

## Spec coverage

| Spec section | Task |
|---|---|
| Postgres in Docker, two databases | 1 |
| tsup build repair | 1 |
| Shared schemas, client profile data (`brand` additions, `business`) | 2 |
| `users` and `clients` tables, migrations, `createDb`, scripts | 3 |
| Validated env, CORS from config | 4, 5 |
| `createApp` factory, Clerk seam, validate and error middleware repairs, envelope | 5 |
| `requireUser`, first-request user creation, hourly refresh, `ADMIN_EMAILS`, `/v1/me` | 6 |
| Create, read, list; ownership rule; 404 for missing, not yours, malformed; url and accent rules; `accounts: []`, zero `stats` | 7 |
| Patch and delete; patch cannot change `ownerId`, `stage`, `id`; whole-object replace of `brand` and `business` | 8 |
| `.env.example`, manual signed-in check, docs | 9 |
