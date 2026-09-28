# Brands Rename, Invited Clients and Admin Endpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the API speak the real domain (a client is a person, a brand is a website workspace), let an admin invite a client and set up brands for them, and archive brands instead of deleting them.

**Architecture:** The database already has the target schema (`packages/db/src/schema.ts`, migrations 0002 and 0003). This plan renames the `clients` feature to `brands` through shared schemas and the API's Controller → Service → Repository stack, teaches user resolution to link an invited row to its Clerk account by verified email, and adds an admin-only router under `/api/v1/admin`.

**Tech Stack:** Express 5, Drizzle ORM 0.45 on Neon Postgres, zod 4, `@clerk/express` (Clerk backend 3.x), pnpm 11 + Turborepo, TypeScript 7.

**Spec:** `docs/superpowers/specs/2026-09-20-database-schema-design.md`

## Global Constraints

- **No automated tests.** The owner removed all tests and test tooling on purpose. Do not add a test runner or test files. Each task is verified with `check-types`, `build`, and the HTTP requests listed in the task.
- **Never commit, stage or push.** The owner reviews and commits everything themselves. There are no commit steps in this plan.
- "client" means the person (`users.role = "client"`); "brand" means the website workspace. Never use "client" for a workspace in new names, comments or messages.
- A client can own any number of brands. No limit in the database or the service.
- Brands are never hard-deleted: set `archived_at`. Archived brands are invisible to every read.
- `users.email` is always lowercase (a database check rejects anything else).
- An invited row links to a Clerk account only when Clerk reports the email as **verified**.
- Follow the API's existing style: static-class Controller → Service → Repository, default-export routers, `asyncHandler` on every route, responses are `{ success: true, data }`, errors are `AppError(message, status, CODE)`, 4-space indent in `apps/api`, 2-space in `packages/*`.
- `src/auth/clerk.ts` stays the only file that imports Clerk. Only repositories import `db`.
- Run scripts with `pnpm --filter <name> run <script>` from the repo root. After changing `packages/shared` or `packages/db`, rebuild that package before type-checking the API (the API reads their `dist`).
- The first Neon connection after idle can fail once with "Connection terminated unexpectedly". Retry once before investigating.

## File Structure

| File | Responsibility |
|---|---|
| `packages/shared/src/schema/brand.schema.ts` (renamed from `client.schema.ts`) | Brand kit, business info, brand request and response shapes |
| `packages/shared/src/schema/me.schema.ts` | `/me` and `/me/overview` shapes, now with `brands` |
| `packages/shared/src/schema/admin.schema.ts` (new) | Invite body and the admin's view of a client |
| `apps/api/src/utils/isUuid.ts` (new) | One shared uuid check |
| `apps/api/src/{controllers,services,repositories,routes}/brands.*` (renamed from `clients.*`) | Brand CRUD with the ownership scope and archiving |
| `apps/api/src/repositories/users.repository.ts` | Adds invited-row and admin queries |
| `apps/api/src/services/users.service.ts` | Links an invited row on first sign-in |
| `apps/api/src/auth/clerk.ts` | Adds `sendInvitation` |
| `apps/api/src/middlewares/auth.middleware.ts` | Adds `requireAdmin` |
| `apps/api/src/{controllers,services,routes}/admin-clients.*` (new) | The admin's endpoints over clients (people) |

---

### Task 1: Apply the migrations

The schema and migrations are written but not applied. Until they are, every brand query fails with `relation "brands" does not exist`.

**Files:** none changed.

**Interfaces:**
- Produces: a database with tables `users`, `brands` and the ten new tables.

- [ ] **Step 1: Confirm with the owner which database to migrate**

`apps/api/.env` `DATABASE_URL` points at the Neon database `neondb`, which also holds another project's tables. Ask the owner: migrate `neondb` as is, or create a dedicated database first and put its URL in `apps/api/.env`. Do not proceed without an answer.

- [ ] **Step 2: Apply**

Run: `pnpm --filter @social-agent/db run db:migrate`
Expected: exits 0 with no error. If it fails with `could not create unique index "users_email_unique"`, two users differ only by letter case; show the owner the rows and stop.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @social-agent/db run db:studio` and check that `brands` exists with `created_by` and `archived_at`, `clients` is gone, and `users` has `status`, `phone`, `invited_by`. Close studio afterwards.

---

### Task 2: Rename the `clients` feature to `brands` and archive instead of delete

**Files:**
- Rename: `packages/shared/src/schema/client.schema.ts` → `packages/shared/src/schema/brand.schema.ts`
- Modify: `packages/shared/src/schema/me.schema.ts`, `scan.schema.ts`, `strategy.schema.ts`, `social.schema.ts`, `packages/shared/src/index.ts`
- Modify: `packages/db/src/schema.ts` (one import name)
- Create: `apps/api/src/utils/isUuid.ts`
- Rename and rewrite: `apps/api/src/repositories/clients.repository.ts` → `brands.repository.ts`, `services/clients.service.ts` → `brands.service.ts`, `controllers/clients.controller.ts` → `brands.controller.ts`, `routes/clients.route.ts` → `brands.route.ts`
- Modify: `apps/api/src/services/me.service.ts`, `apps/api/src/routes/v1.route.ts`

**Interfaces:**
- Produces (shared): `brandSchema`, `newBrandSchema`, `brandPatchSchema`, `brandStatsSchema`, `brandPreferencesSchema`; types `Brand`, `NewBrandInput`, `BrandPatch`, `BrandStats`, `BrandPreferences`. `MeOverview` is `{ user, brands: Brand[], counts: { brands: number } }`.
- Produces (api): `isUuid(value: string): boolean`; `BrandScope = "all" | { ownerId: string }`; `BrandsService.list(user)`, `.listOwnedBy(ownerId: string)`, `.create(user, input, ownerId?)`, `.get(user, id)`, `.update(user, id, patch)`, `.archive(user, id)`.

- [ ] **Step 1: Rename the shared file and its exports**

Use `git mv packages/shared/src/schema/client.schema.ts packages/shared/src/schema/brand.schema.ts`, then rename inside it (whole-word, every occurrence):

| Old | New |
|---|---|
| `clientPreferencesSchema` | `brandPreferencesSchema` |
| `ClientPreferences` | `BrandPreferences` |
| `clientStatsSchema` | `brandStatsSchema` |
| `ClientStats` | `BrandStats` |
| `newClientSchema` | `newBrandSchema` |
| `NewClientInput` | `NewBrandInput` |
| `clientPatchSchema` | `brandPatchSchema` |
| `ClientPatch` | `BrandPatch` |
| `clientSchema` | `brandSchema` |
| `Client` (the type) | `Brand` |

Leave `brandKitSchema`/`BrandKit` alone: that is the kit (voice, colours), not the workspace. Fix the two comments: "Where a client currently sits in the agent loop" → "Where a brand currently sits in the agent loop"; "The parts of a client its owner can change" → "The parts of a brand its owner can change".

Add one field to `brandSchema`, after `ownerId`:

```ts
  /** Who set the brand up: the owner, or an admin on their behalf. */
  createdBy: z.string(),
```

- [ ] **Step 2: Update the files that import it**

In `scan.schema.ts`, `strategy.schema.ts` and `social.schema.ts` change `"./client.schema.js"` to `"./brand.schema.js"`.

`packages/shared/src/index.ts` becomes:

```ts
export * from "./schema/brand.schema.js";
export * from "./schema/me.schema.js";
export * from "./schema/post.schema.js";
export * from "./schema/scan.schema.js";
export * from "./schema/social.schema.js";
export * from "./schema/strategy.schema.js";
```

`packages/shared/src/schema/me.schema.ts`: change the import to `import { brandSchema } from "./brand.schema.js";` and replace `meOverviewSchema` with:

```ts
/** Everything a dashboard needs for its first paint, in one response. */
export const meOverviewSchema = z.object({
  user: meSchema,
  /** The brands this person owns, newest first. An empty list means they have not onboarded yet. */
  brands: z.array(brandSchema),
  counts: z.object({ brands: z.number() }),
});
```

In `packages/db/src/schema.ts` replace the imported type `ClientPreferences` with `BrandPreferences` (the import list and the `preferences` column's `$type<>`).

- [ ] **Step 3: Build both packages**

Run: `pnpm --filter @social-agent/shared run build` then `pnpm --filter @social-agent/db run build`
Expected: both exit 0. Then run `pnpm --filter @social-agent/db run db:generate` and expect "No schema changes, nothing to migrate" (a type-only rename must not produce a migration).

- [ ] **Step 4: Create `apps/api/src/utils/isUuid.ts`**

```ts
import { z } from "zod";

/** A malformed id would make Postgres throw, so callers treat it as "not found" up front. */
export function isUuid(value: string) {
    return z.uuid().safeParse(value).success;
}
```

- [ ] **Step 5: Repository**

`git mv apps/api/src/repositories/clients.repository.ts apps/api/src/repositories/brands.repository.ts`, then replace its content:

```ts
import { brands, type BrandRow, type NewBrandRow } from "@social-agent/db";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/config/db";

/**
 * Which brands a query may touch: all of them (admins) or one owner's.
 * The service decides the scope. Every query below puts it in the WHERE clause,
 * so a user can never read, change or archive a brand that is not theirs.
 */
export type BrandScope = "all" | { ownerId: string };

const inScope = (scope: BrandScope) => (scope === "all" ? undefined : eq(brands.ownerId, scope.ownerId));

/** Archived brands are invisible to every query here. */
const live = (scope: BrandScope) => and(isNull(brands.archivedAt), inScope(scope));

const byId = (id: string, scope: BrandScope) => and(eq(brands.id, id), live(scope));

/** Database queries for the `brands` table. No business rules here. */
export class BrandsRepository {
    static async list(scope: BrandScope): Promise<BrandRow[]> {
        return db.select().from(brands).where(live(scope)).orderBy(desc(brands.createdAt));
    }

    static async findById(id: string, scope: BrandScope): Promise<BrandRow | undefined> {
        const [row] = await db.select().from(brands).where(byId(id, scope)).limit(1);
        return row;
    }

    static async create(values: NewBrandRow): Promise<BrandRow> {
        const [row] = await db.insert(brands).values(values).returning();
        if (!row) throw new Error("Insert into brands returned no row");
        return row;
    }

    /** Returns undefined when the brand does not exist or is outside the scope. */
    static async update(id: string, scope: BrandScope, changes: Partial<NewBrandRow>): Promise<BrandRow | undefined> {
        const [row] = await db
            .update(brands)
            .set({ ...changes, updatedAt: new Date() })
            .where(byId(id, scope))
            .returning();
        return row;
    }

    /**
     * Brands are never deleted: posts, metrics and learnings hang off them.
     * Returns false when the brand does not exist, is outside the scope, or is already archived.
     */
    static async archive(id: string, scope: BrandScope): Promise<boolean> {
        const now = new Date();
        const archived = await db
            .update(brands)
            .set({ archivedAt: now, updatedAt: now })
            .where(byId(id, scope))
            .returning({ id: brands.id });
        return archived.length > 0;
    }
}
```

- [ ] **Step 6: Service**

`git mv apps/api/src/services/clients.service.ts apps/api/src/services/brands.service.ts`, then replace its content:

```ts
import type { BrandRow, NewBrandRow } from "@social-agent/db";
import { DEFAULT_ACCENT, type Brand, type BrandKit, type BrandPatch, type NewBrandInput } from "@social-agent/shared";
import { BrandsRepository, type BrandScope } from "@/repositories/brands.repository";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { isUuid } from "@/utils/isUuid";

export class BrandsService {
    static async list(user: AuthUser): Promise<Brand[]> {
        const rows = await BrandsRepository.list(scopeFor(user));
        return rows.map(toBrand);
    }

    /** Only the brands one person owns. Used for "my brands" (even for an admin) and for an admin looking at a client. */
    static async listOwnedBy(ownerId: string): Promise<Brand[]> {
        const rows = await BrandsRepository.list({ ownerId });
        return rows.map(toBrand);
    }

    /**
     * `ownerId` defaults to the caller. An admin setting a brand up for a client passes the
     * client's id; `createdBy` still records the admin. A client may own any number of brands.
     */
    static async create(user: AuthUser, input: NewBrandInput, ownerId: string = user.id): Promise<Brand> {
        const row = await BrandsRepository.create({
            ...input,
            ownerId,
            createdBy: user.id,
            accent: accentFor(input.brand),
        });
        return toBrand(row);
    }

    static async get(user: AuthUser, id: string): Promise<Brand> {
        if (!isUuid(id)) throw brandNotFound();

        const row = await BrandsRepository.findById(id, scopeFor(user));
        if (!row) throw brandNotFound();
        return toBrand(row);
    }

    /** `patch` holds only the fields an owner may change; the zod schema dropped everything else. */
    static async update(user: AuthUser, id: string, patch: BrandPatch): Promise<Brand> {
        if (!isUuid(id)) throw brandNotFound();

        const changes: Partial<NewBrandRow> = { ...patch };
        if (patch.brand) changes.accent = accentFor(patch.brand);

        const row = await BrandsRepository.update(id, scopeFor(user), changes);
        if (!row) throw brandNotFound();
        return toBrand(row);
    }

    static async archive(user: AuthUser, id: string): Promise<void> {
        if (!isUuid(id)) throw brandNotFound();

        const archived = await BrandsRepository.archive(id, scopeFor(user));
        if (!archived) throw brandNotFound();
    }
}

/**
 * THE OWNERSHIP RULE. An admin reaches every brand; everyone else only the
 * brands they own. Every repository call above takes this scope.
 */
function scopeFor(user: AuthUser): BrandScope {
    return user.role === "admin" ? "all" : { ownerId: user.id };
}

/** "Missing", "archived" and "not yours" get the same answer, so nobody can probe for ids. */
function brandNotFound() {
    return new AppError("This brand doesn't exist, or you don't have access to it.", 404, "BRAND_NOT_FOUND");
}

/** The workspace accent always follows the first brand colour. */
function accentFor(brand: BrandKit) {
    return brand.colors[0]?.hex ?? DEFAULT_ACCENT;
}

/** Real values arrive with the social accounts and analytics tables (phases 3 and 5). */
const EMPTY_STATS: Brand["stats"] = {
    followers: 0,
    followersDelta: 0,
    engagementRate: 0,
    engagementDelta: 0,
    scheduled: 0,
    pendingApprovals: 0,
};

/** Database row to the `Brand` shape the web app expects. */
function toBrand(row: BrandRow): Brand {
    return {
        id: row.id,
        ownerId: row.ownerId,
        createdBy: row.createdBy,
        name: row.name,
        url: row.url,
        industry: row.industry,
        accent: row.accent,
        stage: row.stage,
        brand: row.brand,
        business: row.business,
        platforms: row.platforms,
        preferences: row.preferences,
        createdAt: row.createdAt.toISOString(),
        accounts: [],
        stats: EMPTY_STATS,
    };
}
```

- [ ] **Step 7: Controller**

`git mv apps/api/src/controllers/clients.controller.ts apps/api/src/controllers/brands.controller.ts`, then replace its content:

```ts
import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { BrandsService } from "@/services/brands.service";

const idParam = (req: Request) => String(req.params.id);

export class BrandsController {
    static async list(req: Request, res: Response) {
        const data = await BrandsService.list(currentUser(req));
        return res.status(200).json({ success: true, data });
    }

    static async create(req: Request, res: Response) {
        const data = await BrandsService.create(currentUser(req), req.body);
        return res.status(201).json({ success: true, data });
    }

    static async get(req: Request, res: Response) {
        const data = await BrandsService.get(currentUser(req), idParam(req));
        return res.status(200).json({ success: true, data });
    }

    static async update(req: Request, res: Response) {
        const data = await BrandsService.update(currentUser(req), idParam(req), req.body);
        return res.status(200).json({ success: true, data });
    }

    /** DELETE archives: the brand disappears from every list, its history stays. */
    static async archive(req: Request, res: Response) {
        await BrandsService.archive(currentUser(req), idParam(req));
        return res.status(204).end();
    }
}
```

- [ ] **Step 8: Routes**

`git mv apps/api/src/routes/clients.route.ts apps/api/src/routes/brands.route.ts`, then replace its content:

```ts
import { brandPatchSchema, newBrandSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { BrandsController } from "@/controllers/brands.controller";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

const validateNewBrand = validateMiddleware(z.object({ body: newBrandSchema }));
const validateBrandPatch = validateMiddleware(z.object({ body: brandPatchSchema }));

router.get("/", asyncHandler(BrandsController.list));
router.post("/", validateNewBrand, asyncHandler(BrandsController.create));
router.get("/:id", asyncHandler(BrandsController.get));
router.patch("/:id", validateBrandPatch, asyncHandler(BrandsController.update));
router.delete("/:id", asyncHandler(BrandsController.archive));

export default router;
```

In `apps/api/src/routes/v1.route.ts` replace `import clientsRoute from "@/routes/clients.route";` with `import brandsRoute from "@/routes/brands.route";` and `router.use("/clients", clientsRoute);` with `router.use("/brands", brandsRoute);`.

- [ ] **Step 9: `me.service.ts`**

Replace the file's content:

```ts
import type { Me, MeOverview } from "@social-agent/shared";
import { BrandsService } from "@/services/brands.service";
import type { AuthUser } from "@/services/users.service";

/** What the signed-in person can see about themselves. */
export class MeService {
    static profile(user: AuthUser): Me {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            imageUrl: user.imageUrl,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
        };
    }

    /** `brands` is what this person owns, even for an admin. Empty means they have not onboarded yet. */
    static async overview(user: AuthUser): Promise<MeOverview> {
        const brands = await BrandsService.listOwnedBy(user.id);

        return {
            user: MeService.profile(user),
            brands,
            counts: { brands: brands.length },
        };
    }
}
```

- [ ] **Step 10: Verify**

Run: `pnpm --filter api run check-types` then `pnpm --filter api run build`. Expected: both exit 0.
Run: `grep -rniE "clients?(Service|Repository|Controller|Schema|Route|Scope|Patch|Stats|Preferences)|NewClient|CLIENT_NOT_FOUND" apps/api/src packages/shared/src packages/db/src`. Expected: no output.

Then with `pnpm --filter api run dev` running and a signed-in token (the owner mints one in Postman):

| Request | Expected |
|---|---|
| `POST /api/v1/brands` with a valid body | 201, `data.createdBy` equals `data.ownerId` |
| `POST /api/v1/brands` again, different name | 201 (a second brand for the same client is allowed) |
| `GET /api/v1/me/overview` | 200, `data.brands` has 2 items, `data.counts.brands` is 2 |
| `DELETE /api/v1/brands/:id` | 204 |
| `GET /api/v1/brands/:id` for that id | 404 `BRAND_NOT_FOUND` |
| `GET /api/v1/brands` | the archived brand is absent; its row still exists in the database with `archived_at` set |
| `GET /api/v1/clients` | 404 (the old path is gone) |

---

### Task 3: Link an invited client on first sign-in

**Files:**
- Modify: `apps/api/src/repositories/users.repository.ts`
- Modify: `apps/api/src/services/users.service.ts`

**Interfaces:**
- Consumes: `fetchClerkUser(clerkId)` from `@/auth/clerk` returning `{ email, name, imageUrl, emailVerified, metadataRole }`.
- Produces: `UsersRepository.findInvitedByEmail(email: string): Promise<UserRow | undefined>`, `UsersRepository.linkInvited(id: string, clerkId: string, profile: UserProfile): Promise<void>`. `UsersService.findOrCreate(clerkId)` keeps its signature.

- [ ] **Step 1: Repository**

In `users.repository.ts` change the drizzle import to `import { and, eq, isNull } from "drizzle-orm";`, replace `createIfMissing`, and add the two new methods:

```ts
    /** An admin created this row; nobody has signed in as it yet. */
    static async findInvitedByEmail(email: string): Promise<UserRow | undefined> {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.email, email), eq(users.status, "invited"), isNull(users.clerkId)))
            .limit(1);
        return row;
    }

    /**
     * The invited person's first sign-in. The `clerk_id is null` guard makes a second,
     * simultaneous request a no-op instead of overwriting the link.
     */
    static async linkInvited(id: string, clerkId: string, profile: UserProfile): Promise<void> {
        await db
            .update(users)
            .set({ ...profile, clerkId, status: "active", updatedAt: new Date() })
            .where(and(eq(users.id, id), isNull(users.clerkId)));
    }

    /**
     * Two first requests from the same person can arrive together, and the email may already
     * belong to another row. Either conflict skips the insert, so read the row back afterwards.
     */
    static async createIfMissing(clerkId: string, profile: UserProfile): Promise<void> {
        await db
            .insert(users)
            .values({ clerkId, ...profile })
            .onConflictDoNothing();
    }
```

- [ ] **Step 2: Service**

In `users.service.ts` add `import { AppError } from "@/utils/AppError";` and replace the end of `findOrCreate` (everything after the `if (existing) { ... }` block) with:

```ts
        // First sign-in. If an admin invited this person, the row already exists (and may already
        // own brands): attach the Clerk account to it. Only a verified email proves it is them.
        if (clerkUser.emailVerified) {
            const invited = await UsersRepository.findInvitedByEmail(profile.email);
            if (invited) {
                const name = profile.name ?? invited.name;
                await UsersRepository.linkInvited(invited.id, clerkId, { ...profile, name });
            }
        }

        // A no-op when the link above (or a simultaneous request) already produced the row.
        await UsersRepository.createIfMissing(clerkId, profile);

        const created = await UsersRepository.findByClerkId(clerkId);
        if (!created) {
            // The email is taken by a row this Clerk account may not claim: an invitation waiting
            // for a verified email, or another account.
            throw new AppError(
                "This email already belongs to another account. Verify your email address, then try again.",
                409,
                "EMAIL_IN_USE",
            );
        }
        return toAuthUser(created);
```

- [ ] **Step 3: Verify**

Run: `pnpm --filter api run check-types`. Expected: exit 0.

Manual check (needs a Clerk test user whose email is verified and who has never called the API):
1. In Drizzle Studio insert a `users` row: `email` = that user's email in lowercase, `status` = `invited`, `clerk_id` empty, `name` = `Invited Name`.
2. Call `GET /api/v1/me` with that user's token. Expected: 200, and `data.id` equals the inserted row's id.
3. In Studio the row now has `clerk_id` set and `status` = `active`; there is still exactly one row with that email.
4. Call `GET /api/v1/me` again. Expected: 200, same id.

---

### Task 4: Admin endpoints

`GET /admin/clients`, `GET /admin/clients/:id`, `POST /admin/clients` (invite), `POST /admin/clients/:id/brands`.

**Files:**
- Create: `packages/shared/src/schema/admin.schema.ts`
- Modify: `packages/shared/src/index.ts`
- Modify: `apps/api/src/auth/clerk.ts`, `apps/api/src/middlewares/auth.middleware.ts`, `apps/api/src/repositories/users.repository.ts`, `apps/api/src/routes/v1.route.ts`
- Create: `apps/api/src/services/admin-clients.service.ts`, `apps/api/src/controllers/admin-clients.controller.ts`, `apps/api/src/routes/admin.route.ts`

**Interfaces:**
- Consumes: `BrandsService.listOwnedBy(ownerId: string)`, `BrandsService.create(user, input, ownerId)`, `isUuid`, `newBrandSchema`, `brandSchema`.
- Produces: shared `inviteClientSchema`, `adminClientSchema`, `adminClientDetailSchema` and types `InviteClientInput`, `AdminClient`, `AdminClientDetail`; `requireAdmin` middleware; `sendInvitation(email, redirectUrl)`.

- [ ] **Step 1: Shared schemas**

Create `packages/shared/src/schema/admin.schema.ts`:

```ts
import { z } from "zod";
import { brandSchema } from "./brand.schema.js";

/** What an admin types to bring a client in before they have an account. */
export const inviteClientSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
});

/** A client (a person) as the admin sees them. */
export const adminClientSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  imageUrl: z.string().nullable(),
  phone: z.string().nullable(),
  /** `invited` until their first sign-in. */
  status: z.enum(["invited", "active"]),
  /** Archived brands are not counted. */
  brandCount: z.number(),
  createdAt: z.string(),
});

export const adminClientDetailSchema = z.object({
  client: adminClientSchema,
  brands: z.array(brandSchema),
});

export type InviteClientInput = z.infer<typeof inviteClientSchema>;
export type AdminClient = z.infer<typeof adminClientSchema>;
export type AdminClientDetail = z.infer<typeof adminClientDetailSchema>;
```

Add `export * from "./schema/admin.schema.js";` as the first line of `packages/shared/src/index.ts`. Run `pnpm --filter @social-agent/shared run build`; expected exit 0.

- [ ] **Step 2: Clerk invitation**

Append to `apps/api/src/auth/clerk.ts`:

```ts
/**
 * Clerk emails the person a sign-up link. `ignoreExisting` keeps this from failing when they were
 * invited before or already have a Clerk account; either way they end up signing in with this email.
 */
export async function sendInvitation(email: string, redirectUrl: string): Promise<void> {
    await clerkClient.invitations.createInvitation({ emailAddress: email, redirectUrl, ignoreExisting: true });
}
```

- [ ] **Step 3: `requireAdmin`**

In `apps/api/src/middlewares/auth.middleware.ts` change the express import to `import type { Request, RequestHandler } from "express";` and append:

```ts
/** Mount after `requireUser`. */
export const requireAdmin: RequestHandler = (req, _res, next) => {
    if (currentUser(req).role !== "admin") throw new AppError("Only an admin can do this.", 403, "FORBIDDEN");
    next();
};
```

- [ ] **Step 4: Repository queries**

In `users.repository.ts` change the imports to:

```ts
import { brands, users, type UserRow } from "@social-agent/db";
import { and, count, desc, eq, isNull } from "drizzle-orm";
```

Add below `UserProfile`:

```ts
export interface ClientWithBrandCount {
    user: UserRow;
    brandCount: number;
}
```

Add these methods to the class:

```ts
    static async findByEmail(email: string): Promise<UserRow | undefined> {
        const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return row;
    }

    /** Admins are not clients, so they are left out. */
    static async findClientById(id: string): Promise<UserRow | undefined> {
        const [row] = await db
            .select()
            .from(users)
            .where(and(eq(users.id, id), eq(users.role, "client")))
            .limit(1);
        return row;
    }

    /** Every client, newest first, with how many live brands they own. */
    static async listClients(): Promise<ClientWithBrandCount[]> {
        return db
            .select({ user: users, brandCount: count(brands.id) })
            .from(users)
            .leftJoin(brands, and(eq(brands.ownerId, users.id), isNull(brands.archivedAt)))
            .where(eq(users.role, "client"))
            .groupBy(users.id)
            .orderBy(desc(users.createdAt));
    }

    static async createInvited(values: {
        email: string;
        name: string | null;
        phone: string | null;
        invitedBy: string;
    }): Promise<UserRow> {
        const [row] = await db
            .insert(users)
            .values({ ...values, role: "client", status: "invited" })
            .returning();
        if (!row) throw new Error("Insert into users returned no row");
        return row;
    }

    /** Undo for an invitation whose email could not be sent. Never touches a person who has signed in. */
    static async deleteInvited(id: string): Promise<void> {
        await db.delete(users).where(and(eq(users.id, id), eq(users.status, "invited"), isNull(users.clerkId)));
    }
```

- [ ] **Step 5: Service**

Create `apps/api/src/services/admin-clients.service.ts`:

```ts
import type { UserRow } from "@social-agent/db";
import type { AdminClient, AdminClientDetail, Brand, InviteClientInput, NewBrandInput } from "@social-agent/shared";
import { sendInvitation } from "@/auth/clerk";
import { env } from "@/config/env";
import { UsersRepository } from "@/repositories/users.repository";
import { BrandsService } from "@/services/brands.service";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { isUuid } from "@/utils/isUuid";

/** The admin's view of clients (people). Every route that reaches this is behind `requireAdmin`. */
export class AdminClientsService {
    static async list(): Promise<AdminClient[]> {
        const rows = await UsersRepository.listClients();
        return rows.map(({ user, brandCount }) => toAdminClient(user, brandCount));
    }

    static async get(id: string): Promise<AdminClientDetail> {
        const client = await findClient(id);
        const brands = await BrandsService.listOwnedBy(client.id);
        return { client: toAdminClient(client, brands.length), brands };
    }

    /**
     * Creates the person before they have an account, so the admin can set up their brand
     * straight away. The row links to their Clerk account on their first sign-in.
     */
    static async invite(admin: AuthUser, input: InviteClientInput): Promise<AdminClient> {
        const existing = await UsersRepository.findByEmail(input.email);
        if (existing) throw new AppError("Someone with this email is already here.", 409, "CLIENT_EXISTS");

        const row = await UsersRepository.createInvited({
            email: input.email,
            name: input.name ?? null,
            phone: input.phone ?? null,
            invitedBy: admin.id,
        });

        try {
            await sendInvitation(row.email, `${env.CORS_ORIGINS[0]}/sign-up`);
        } catch (error) {
            // Without the email the person can never arrive, so do not leave a row behind.
            await UsersRepository.deleteInvited(row.id);
            console.error("Clerk invitation failed", error);
            throw new AppError("The invitation email could not be sent. Try again.", 502, "INVITE_FAILED");
        }

        return toAdminClient(row, 0);
    }

    /** The client owns the brand; `createdBy` records the admin. */
    static async createBrand(admin: AuthUser, clientId: string, input: NewBrandInput): Promise<Brand> {
        const client = await findClient(clientId);
        return BrandsService.create(admin, input, client.id);
    }
}

async function findClient(id: string): Promise<UserRow> {
    const client = isUuid(id) ? await UsersRepository.findClientById(id) : undefined;
    if (!client) throw new AppError("This client doesn't exist.", 404, "CLIENT_NOT_FOUND");
    return client;
}

function toAdminClient(row: UserRow, brandCount: number): AdminClient {
    return {
        id: row.id,
        email: row.email,
        name: row.name,
        imageUrl: row.imageUrl,
        phone: row.phone,
        status: row.status,
        brandCount,
        createdAt: row.createdAt.toISOString(),
    };
}
```

- [ ] **Step 6: Controller**

Create `apps/api/src/controllers/admin-clients.controller.ts`:

```ts
import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { AdminClientsService } from "@/services/admin-clients.service";

const idParam = (req: Request) => String(req.params.id);

export class AdminClientsController {
    static async list(_req: Request, res: Response) {
        const data = await AdminClientsService.list();
        return res.status(200).json({ success: true, data });
    }

    static async get(req: Request, res: Response) {
        const data = await AdminClientsService.get(idParam(req));
        return res.status(200).json({ success: true, data });
    }

    static async invite(req: Request, res: Response) {
        const data = await AdminClientsService.invite(currentUser(req), req.body);
        return res.status(201).json({ success: true, data });
    }

    static async createBrand(req: Request, res: Response) {
        const data = await AdminClientsService.createBrand(currentUser(req), idParam(req), req.body);
        return res.status(201).json({ success: true, data });
    }
}
```

- [ ] **Step 7: Routes**

Create `apps/api/src/routes/admin.route.ts`:

```ts
import { inviteClientSchema, newBrandSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { AdminClientsController } from "@/controllers/admin-clients.controller";
import { requireAdmin } from "@/middlewares/auth.middleware";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

// Everything below is for admins only. "clients" here are people, not brands.
router.use(requireAdmin);

const validateInvite = validateMiddleware(z.object({ body: inviteClientSchema }));
const validateNewBrand = validateMiddleware(z.object({ body: newBrandSchema }));

router.get("/clients", asyncHandler(AdminClientsController.list));
router.post("/clients", validateInvite, asyncHandler(AdminClientsController.invite));
router.get("/clients/:id", asyncHandler(AdminClientsController.get));
router.post("/clients/:id/brands", validateNewBrand, asyncHandler(AdminClientsController.createBrand));

export default router;
```

In `apps/api/src/routes/v1.route.ts` add `import adminRoute from "@/routes/admin.route";` with the other route imports and `router.use("/admin", adminRoute);` after the `/brands` line.

- [ ] **Step 8: Verify**

Run: `pnpm --filter api run check-types` then `pnpm --filter api run build`. Expected: both exit 0.

With the dev server running, an admin token and a non-admin token:

| Request | Expected |
|---|---|
| `GET /api/v1/admin/clients` with the non-admin token | 403 `FORBIDDEN` |
| `POST /api/v1/admin/clients` `{ "email": "New.Person@Example.com", "name": "New Person" }` (admin) | 201, `data.email` is lowercase, `data.status` is `invited`, `data.brandCount` is 0; Clerk dashboard → Invitations shows it |
| the same request again | 409 `CLIENT_EXISTS` |
| `POST /api/v1/admin/clients` `{ "email": "nope" }` | 400 `VALIDATION_ERROR` |
| `POST /api/v1/admin/clients/:id/brands` with a valid brand body | 201, `data.ownerId` is the client's id, `data.createdBy` is the admin's id |
| `GET /api/v1/admin/clients/:id` | 200, `data.client.brandCount` is 1, `data.brands` has the brand |
| `GET /api/v1/admin/clients` | 200, the invited person is listed; the admin is not |
| `GET /api/v1/admin/clients/not-a-uuid` | 404 `CLIENT_NOT_FOUND` |

---

### Task 5: Update the API guide

**Files:**
- Modify: `apps/api/AGENTS.md`

- [ ] **Step 1: Rewrite the lines that changed**

Read the file, then:
- In the `/api/v1/me` bullet, say `/me/overview` returns the account plus the **brands** they own (`brands`, `counts.brands`), and that an empty list means "not onboarded yet".
- Replace the ownership-rule bullet with: "The ownership rule is `scopeFor` in `src/services/brands.service.ts`: admins reach every brand, everyone else only their own, and "not yours", "archived" and "missing" all answer 404. The repository puts that scope in the WHERE clause of every query. `DELETE /brands/:id` archives (`archived_at`); brands are never deleted. New brand-scoped data must take a scope the same way."
- Add a bullet: "Words: a **client** is a person (`users.role = "client"`), a **brand** is a website workspace. A client can own any number of brands."
- Add a bullet: "A client arrives by signing up, or by an admin's invitation (`POST /api/v1/admin/clients`), which creates a `users` row with `status = "invited"` and no `clerk_id` and has Clerk send the email. `UsersService.findOrCreate` attaches the Clerk account to that row on the first sign-in, only if Clerk reports the email as verified."
- Add a bullet: "`/api/v1/admin/*` is behind `requireAdmin`: `GET /admin/clients`, `GET /admin/clients/:id`, `POST /admin/clients`, `POST /admin/clients/:id/brands`."

Replace any remaining mention of a `clients` table, `/clients` route or `clients.service.ts` with the brand equivalent.

- [ ] **Step 2: Final check**

Run from the repo root: `pnpm --filter @social-agent/shared run build`, `pnpm --filter @social-agent/db run build`, `pnpm --filter api run check-types`, `pnpm --filter api run build`. Expected: all exit 0.
Run `git status --short` and give the owner the list of changed files to review. Do not stage or commit.

---

## Not in this plan

- Onboarding endpoints (website scan → review → create brand): they depend on `brand_scans` and the phase 2 agent, and get their own spec.
- Renaming `Client` to `Brand` in `apps/web` (types, mock, routes): done when the web app is wired to the API.
- Resending or revoking an invitation, and editing a client's name or phone.
- Auth on the Mastra routes (flagged for phase 2).
