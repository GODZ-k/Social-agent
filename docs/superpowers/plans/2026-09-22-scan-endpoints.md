# Scan Endpoints (Phase 2A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** `POST /api/v1/scans` starts a website scan in the background and `GET /api/v1/scans/:id` reports its progress and result from `brand_scans`; `POST /api/v1/brands` (and the admin variant) links a finished scan to the brand it produced.

**Architecture:** Route → Controller → Service → Repository, static classes, exactly like `brands`. A small in-process FIFO (`src/scan-queue`) runs one scan at a time with `runBrandScan(url, { onStep })` and writes every status change to the row. A start-up sweep marks scans left `queued`/`running` by a previous process as `failed`.

**Tech Stack:** Express 5, zod 4, Drizzle (`@social-agent/db`), the existing `runBrandScan`, Postman collection generator.

**Spec:** `docs/superpowers/specs/2026-09-22-scan-endpoints-design.md` (read it first; the catalogue §7 it references is `docs/superpowers/specs/2026-09-20-api-endpoints-catalogue.md`).

## Global Constraints

- **No automated tests** (owner's rule): every task ends with a real run whose output is recorded against the expected output in the task.
- **No git commits, no `git add`, no git index changes.** The owner reviews and commits.
- Clean code as the owner defines it: small named functions, one level of abstraction per function, no nested ternaries, descriptive names, comments only where the why is not obvious. Match the surrounding files (the API uses 4-space indentation, `@/` import alias, static classes, `asyncHandler`, `validateMiddleware(z.object({ body }))`, `AppError(message, status, code)`).
- Layer rules from `apps/api/AGENTS.md`: routes hold no logic; controllers read the request, call one service method, send `{ success, data }`; services hold rules and never import Drizzle; repositories hold every query and throw no HTTP errors.
- `src/scan/*` never imports `@mastra/*` or `src/mastra`. The queue lives in `src/scan-queue`, which may import `src/mastra/workflows/brand-scan/run`.
- Error codes: existing style; new codes `SCAN_NOT_FOUND` (404, "This scan doesn't exist, or you don't have access to it.") and `SCAN_NOT_DONE` (409, "This scan hasn't finished yet."). `VALIDATION_ERROR` comes from the validate middleware.
- Step ids are the workflow's: `discover | read-pages | interpret | report`. One source of truth: `scanStepIdSchema` in `packages/shared`; `apps/api/src/scan/types.ts` derives `SCAN_STEP_IDS` from it.
- `SCAN_CONCURRENCY = 1`. `INTERRUPTED_MESSAGE = "The scan was interrupted. Please try again."`. `SERVER_ERROR_MESSAGE = "Something went wrong on our side. Please try again."`.
- Every endpoint change updates the Postman collection (`pnpm --filter api run postman`), whose check fails on a missing route.
- After changing `packages/shared`, rebuild it: `pnpm --filter @social-agent/shared run build` (the API imports the built output).
- Run scripts as `pnpm --filter api run <script>` from the repo root. Typecheck: `pnpm --filter api run check-types`. Keep commands short; write reports incrementally.
- Firecrawl: a free key is in `apps/api/.env` (10 requests/min, one scan per minute). Live runs in Task 5 only; at most 4 scans.

## File map

| File | Responsibility | Task |
|---|---|---|
| `packages/shared/src/schema/scan.schema.ts` | `scanStepIdSchema`, `newScanSchema`, `scanSchema`, types | 1 |
| `packages/shared/src/schema/brand.schema.ts` | `newBrandSchema.scanId` | 1 |
| `apps/api/src/scan/types.ts` | `SCAN_STEP_IDS` from shared | 1 |
| `apps/api/src/repositories/scans.repository.ts` (new) | every `brand_scans` query | 2 |
| `apps/api/src/services/scans.service.ts` (new) | `start`, `get`, `claim`, `toScan` | 2 |
| `apps/api/src/controllers/scans.controller.ts`, `routes/scans.route.ts` (new), `routes/v1.route.ts` | HTTP | 2 |
| `apps/api/src/scan-queue/index.ts` (new) | `enqueueScan`, the run loop | 3 |
| `apps/api/src/server.ts` | start-up sweep, shutdown marks interrupted | 3 |
| `apps/api/src/services/brands.service.ts`, `admin-clients.service.ts` | `scanId` claim + attach | 4 |
| `apps/api/postman/build-collection.cjs` | Scans folder, `scanId` in brand examples | 4 |
| `apps/api/AGENTS.md`, catalogue §7 | docs | 4 |

Task 1 first. Tasks 2 and 3 touch disjoint files and may run in parallel (Task 2's service imports `enqueueScan` from Task 3's file — Task 2 creates the import; until Task 3 lands `check-types` reports only that missing module). Task 4 after both. Task 5 (live verification) last.

---

### Task 1: Shared schemas

**Files:**
- Modify: `packages/shared/src/schema/scan.schema.ts`
- Modify: `packages/shared/src/schema/brand.schema.ts:116-123`
- Modify: `apps/api/src/scan/types.ts:4-6`

**Interfaces produced:** `scanStepIdSchema`, `ScanStepId`; `newScanSchema`, `NewScanInput`; `scanSchema`, `Scan`; `newBrandSchema.scanId?: string` (`NewBrandInput.scanId`).

- [ ] **Step 1: `scan.schema.ts`** — replace the file with:

```ts
import { z } from "zod";
import { brandKitSchema, businessInfoSchema, websiteUrlSchema } from "./brand.schema.js";

export const scanStatusSchema = z.enum(["queued", "running", "done", "failed"]);

/** The workflow's step ids, in order. The scan screen shows a label per id. */
export const scanStepIdSchema = z.enum(["discover", "read-pages", "interpret", "report"]);

/** A page the agent read while scanning a website. */
export const scanPageSchema = z.object({
  url: z.string(),
  title: z.string(),
});

/** What a scan proposes. The person reviews it before a brand is created from it. */
export const scanResultSchema = z.object({
  name: z.string().optional(),
  industry: z.string().optional(),
  brand: brandKitSchema,
  business: businessInfoSchema.optional(),
});

export const newScanSchema = z.object({ url: websiteUrlSchema });

/** One scan as the API returns it. `result` is set when done, `error` when failed. */
export const scanSchema = z.object({
  id: z.uuid(),
  brandId: z.uuid().nullable(),
  url: z.string(),
  status: scanStatusSchema,
  currentStep: scanStepIdSchema.nullable(),
  pages: z.array(scanPageSchema),
  result: scanResultSchema.nullable(),
  error: z.string().nullable(),
  startedAt: z.string().nullable(),
  finishedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type ScanStatus = z.infer<typeof scanStatusSchema>;
export type ScanStepId = z.infer<typeof scanStepIdSchema>;
export type ScanPage = z.infer<typeof scanPageSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;
export type NewScanInput = z.infer<typeof newScanSchema>;
export type Scan = z.infer<typeof scanSchema>;
```

- [ ] **Step 2: `brand.schema.ts`** — add to `newBrandSchema` after `business`:

```ts
  /** The onboarding scan this brand came from. Phase 2: links the scan to the brand. */
  scanId: z.uuid().optional(),
```

- [ ] **Step 3: `apps/api/src/scan/types.ts`** — replace lines 4-6 with:

```ts
import { scanStepIdSchema } from "@social-agent/shared";

/** Stable ids: the progress screen shows a scan by them. One source of truth: the shared schema. */
export const SCAN_STEP_IDS = scanStepIdSchema.options;
export type ScanStepId = (typeof SCAN_STEP_IDS)[number];
```
(keep the existing `import { z } from "zod"` and the other shared import; merge the two `@social-agent/shared` imports into one.)

- [ ] **Step 4: Build and check** — `pnpm --filter @social-agent/shared run build` → succeeds. `pnpm --filter api run check-types` → clean. `pnpm --filter api exec tsx -e "import { scanSchema, newBrandSchema } from '@social-agent/shared'; console.log(Object.keys(scanSchema.shape).join(','), newBrandSchema.shape.scanId ? 'scanId ok' : 'MISSING')"` → prints the 11 keys and `scanId ok`.

---

### Task 2: Repository, service, controller, route

**Files:**
- Create: `apps/api/src/repositories/scans.repository.ts`, `apps/api/src/services/scans.service.ts`, `apps/api/src/controllers/scans.controller.ts`, `apps/api/src/routes/scans.route.ts`
- Modify: `apps/api/src/routes/v1.route.ts`

**Interfaces:**
- Consumes: Task 1 types; `enqueueScan(id: string): void` from `@/scan-queue` (Task 3 — import it now; `check-types` will report the missing module until Task 3 lands, nothing else).
- Produces: `ScansRepository` (below), `ScansService.start/get/claim`, `toScan`.

- [ ] **Step 1: `scans.repository.ts`**

```ts
import { brandScans, type BrandScanRow, type NewBrandScanRow } from "@social-agent/db";
import type { ScanPage, ScanResult, ScanStepId } from "@social-agent/shared";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/config/db";

/** Which scans a query may touch: all of them (admins) or one requester's. The service decides. */
export type ScanScope = "all" | { requestedBy: string };

const ACTIVE_STATUSES = ["queued", "running"] as const;
export const INTERRUPTED_MESSAGE = "The scan was interrupted. Please try again.";

const inScope = (scope: ScanScope) => (scope === "all" ? undefined : eq(brandScans.requestedBy, scope.requestedBy));
const byId = (id: string, scope: ScanScope) => and(eq(brandScans.id, id), inScope(scope));
const isActive = () => inArray(brandScans.status, [...ACTIVE_STATUSES]);

/** Database queries for the `brand_scans` table. No business rules here. */
export class ScansRepository {
    static async create(values: NewBrandScanRow): Promise<BrandScanRow> {
        const [row] = await db.insert(brandScans).values(values).returning();
        if (!row) throw new Error("Insert into brand_scans returned no row");
        return row;
    }

    static async findById(id: string, scope: ScanScope): Promise<BrandScanRow | undefined> {
        const [row] = await db.select().from(brandScans).where(byId(id, scope)).limit(1);
        return row;
    }

    /** The oldest scan this person still has queued or running, if any. */
    static async findActiveFor(requestedBy: string): Promise<BrandScanRow | undefined> {
        const [row] = await db
            .select()
            .from(brandScans)
            .where(and(eq(brandScans.requestedBy, requestedBy), isActive()))
            .orderBy(asc(brandScans.createdAt))
            .limit(1);
        return row;
    }

    static async markRunning(id: string): Promise<void> {
        await db.update(brandScans).set({ status: "running", startedAt: new Date(), currentStep: null }).where(eq(brandScans.id, id));
    }

    static async markStep(id: string, step: ScanStepId): Promise<void> {
        await db.update(brandScans).set({ currentStep: step }).where(eq(brandScans.id, id));
    }

    static async markDone(id: string, result: ScanResult, pages: ScanPage[]): Promise<void> {
        await db
            .update(brandScans)
            .set({ status: "done", currentStep: null, result, pages, finishedAt: new Date() })
            .where(eq(brandScans.id, id));
    }

    static async markFailed(id: string, error: string): Promise<void> {
        await db
            .update(brandScans)
            .set({ status: "failed", currentStep: null, error, finishedAt: new Date() })
            .where(eq(brandScans.id, id));
    }

    static async attachBrand(id: string, brandId: string): Promise<void> {
        await db.update(brandScans).set({ brandId }).where(eq(brandScans.id, id));
    }

    /** Scans a previous process left behind can never finish: fail them. Returns how many. */
    static async failInterrupted(): Promise<number> {
        const rows = await db
            .update(brandScans)
            .set({ status: "failed", currentStep: null, error: INTERRUPTED_MESSAGE, finishedAt: new Date() })
            .where(isActive())
            .returning({ id: brandScans.id });
        return rows.length;
    }
}
```

- [ ] **Step 2: `scans.service.ts`**

```ts
import type { BrandScanRow } from "@social-agent/db";
import type { NewScanInput, Scan } from "@social-agent/shared";
import { ScansRepository, type ScanScope } from "@/repositories/scans.repository";
import { enqueueScan } from "@/scan-queue";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { isUuid } from "@/utils/isUuid";

export class ScansService {
    /** Starts a scan, or returns the one this person already has running: a double click must not start two. */
    static async start(user: AuthUser, input: NewScanInput): Promise<{ scan: Scan; created: boolean }> {
        const active = await ScansRepository.findActiveFor(user.id);
        if (active) return { scan: toScan(active), created: false };

        const row = await ScansRepository.create({ url: input.url, requestedBy: user.id });
        enqueueScan(row.id);
        return { scan: toScan(row), created: true };
    }

    static async get(user: AuthUser, id: string): Promise<Scan> {
        return toScan(await findScan(user, id));
    }

    /** A finished scan the caller may attach to a brand they are creating. */
    static async claim(user: AuthUser, id: string): Promise<BrandScanRow> {
        const scan = await findScan(user, id);
        if (scan.status !== "done") throw new AppError("This scan hasn't finished yet.", 409, "SCAN_NOT_DONE");
        return scan;
    }
}

async function findScan(user: AuthUser, id: string): Promise<BrandScanRow> {
    if (!isUuid(id)) throw scanNotFound();
    const row = await ScansRepository.findById(id, scopeFor(user));
    if (!row) throw scanNotFound();
    return row;
}

/** An admin reaches every scan; everyone else only the scans they requested. */
function scopeFor(user: AuthUser): ScanScope {
    return user.role === "admin" ? "all" : { requestedBy: user.id };
}

/** "Missing" and "not yours" get the same answer, so nobody can probe for ids. */
function scanNotFound() {
    return new AppError("This scan doesn't exist, or you don't have access to it.", 404, "SCAN_NOT_FOUND");
}

const isoOrNull = (date: Date | null) => (date ? date.toISOString() : null);

/** Database row to the `Scan` shape the web app expects. */
export function toScan(row: BrandScanRow): Scan {
    return {
        id: row.id,
        brandId: row.brandId,
        url: row.url,
        status: row.status,
        currentStep: row.currentStep as Scan["currentStep"],
        pages: row.pages,
        result: row.result ?? null,
        error: row.error,
        startedAt: isoOrNull(row.startedAt),
        finishedAt: isoOrNull(row.finishedAt),
        createdAt: row.createdAt.toISOString(),
    };
}
```
If `AuthUser` has no `role` field, look at how `brands.service.ts`'s `scopeFor` reads the role and do the same.

- [ ] **Step 3: `scans.controller.ts`**

```ts
import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { ScansService } from "@/services/scans.service";

const idParam = (req: Request) => String(req.params.id);

export class ScansController {
    /** 202 when a scan was started; 200 when the caller's running scan was returned instead. */
    static async start(req: Request, res: Response) {
        const { scan, created } = await ScansService.start(currentUser(req), req.body);
        return res.status(created ? 202 : 200).json({ success: true, data: scan });
    }

    static async get(req: Request, res: Response) {
        const data = await ScansService.get(currentUser(req), idParam(req));
        return res.status(200).json({ success: true, data });
    }
}
```

- [ ] **Step 4: `scans.route.ts`** and mount

```ts
import { newScanSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { ScansController } from "@/controllers/scans.controller";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

const validateNewScan = validateMiddleware(z.object({ body: newScanSchema }));

router.post("/", validateNewScan, asyncHandler(ScansController.start));
router.get("/:id", asyncHandler(ScansController.get));

export default router;
```
In `v1.route.ts`: `import scansRoute from "@/routes/scans.route";` and `router.use("/scans", scansRoute);` after `/brands`.

- [ ] **Step 5: Check** — `pnpm --filter api run check-types`: the only error allowed is the missing module `@/scan-queue` (Task 3). If Task 3 has landed, it must be clean. Confirm `tsconfig` paths resolve `@/scan-queue` to `src/scan-queue/index.ts` (the alias already maps `@/*` to `src/*`).

---

### Task 3: The scan queue and server wiring

**Files:**
- Create: `apps/api/src/scan-queue/index.ts`
- Modify: `apps/api/src/server.ts`

**Interfaces:**
- Consumes: `runBrandScan(input, { onStep })` from `@/mastra/workflows/brand-scan/run` (returns `ScanOutcome`: `{ ok: true, result, pages, warnings } | { ok: false, code, message }`); `ScansRepository` (Task 2 — if it has not landed yet, `check-types` reports that module missing and nothing else).
- Produces: `enqueueScan(id: string): void`, `pendingScanCount(): number`.

- [ ] **Step 1: `scan-queue/index.ts`**

```ts
import { runBrandScan } from "@/mastra/workflows/brand-scan/run";
import { ScansRepository } from "@/repositories/scans.repository";

// One scan at a time: a free Firecrawl key allows 10 requests a minute and a scan is up to 7.
// The queue lives in this process; a Postgres-backed one can replace it when there are several.
const SCAN_CONCURRENCY = 1;
const SERVER_ERROR_MESSAGE = "Something went wrong on our side. Please try again.";

const waiting: string[] = [];
let running = 0;

export function enqueueScan(id: string): void {
    waiting.push(id);
    startNext();
}

/** Scans not yet finished: the shutdown log prints it. */
export function pendingScanCount(): number {
    return waiting.length + running;
}

function startNext(): void {
    while (running < SCAN_CONCURRENCY && waiting.length > 0) {
        const id = waiting.shift()!;
        running += 1;
        void runScan(id).finally(() => {
            running -= 1;
            startNext();
        });
    }
}

async function runScan(id: string): Promise<void> {
    const scan = await ScansRepository.findById(id, "all");
    if (!scan || scan.status !== "queued") return; // the start-up sweep got there first

    await ScansRepository.markRunning(id);
    try {
        const outcome = await runBrandScan(scan.url, { onStep: (step) => ScansRepository.markStep(id, step) });
        if (outcome.ok) await ScansRepository.markDone(id, outcome.result, outcome.pages);
        else await ScansRepository.markFailed(id, outcome.message);
    } catch (error) {
        console.error(`scan ${id} failed`, error);
        await ScansRepository.markFailed(id, SERVER_ERROR_MESSAGE).catch((writeError) => {
            console.error(`scan ${id}: could not record the failure`, writeError);
        });
    }
}
```

- [ ] **Step 2: `server.ts`** — after `console.log("Database connected successfully")`:

```ts
        const interrupted = await ScansRepository.failInterrupted()
        if (interrupted > 0) console.log(`Marked ${interrupted} interrupted scan(s) as failed`)
```
and in `shutdown`, inside `server.close(async () => { ... })` before `await pool.end()`:

```ts
                if (pendingScanCount() > 0) {
                    console.log(`${pendingScanCount()} scan(s) still running, marking them interrupted`)
                    await ScansRepository.failInterrupted()
                }
```
Add the two imports (`ScansRepository` from `@/repositories/scans.repository`, `pendingScanCount` from `@/scan-queue`). Keep the file's existing style (no semicolons, 4 spaces).

- [ ] **Step 3: Check** — `pnpm --filter api run check-types` clean once Task 2 has landed (else only the `scans.repository` module missing). `pnpm --filter api run build` succeeds.

---

### Task 4: Link a scan to the brand; Postman; docs

**Files:**
- Modify: `apps/api/src/services/brands.service.ts:24-32`
- Modify: `apps/api/postman/build-collection.cjs`
- Modify: `apps/api/AGENTS.md`, `docs/superpowers/specs/2026-09-20-api-endpoints-catalogue.md` §7

**Interfaces:** consumes `ScansService.claim(user, id)`, `ScansRepository.attachBrand(id, brandId)`, `NewBrandInput.scanId`.

- [ ] **Step 1: `BrandsService.create`** becomes:

```ts
    static async create(user: AuthUser, input: NewBrandInput, ownerId: string = user.id): Promise<Brand> {
        const { scanId, ...brand } = input;
        const scan = scanId ? await ScansService.claim(user, scanId) : undefined;

        const row = await BrandsRepository.create({
            ...brand,
            ownerId,
            createdBy: user.id,
            accent: accentFor(brand.brand),
        });
        if (scan) await ScansRepository.attachBrand(scan.id, row.id);
        return toBrand(row);
    }
```
with the two imports. `AdminClientsService.createBrand` already calls `BrandsService.create(admin, input, client.id)` and needs no change (an admin's scope is `all`, so the claim works for a scan the client requested). Verify that `BrandsRepository.create`'s `NewBrandRow` does not receive `scanId` (the destructuring removes it).

- [ ] **Step 2: Postman** — in `build-collection.cjs`, add a folder "Scans" after "Brands" with, following the file's own `request({...})` conventions (read the header comment and an existing folder first):
  - `POST /api/v1/scans` body `{ "url": "donangie.com" }`; description: `url` required, same rule as a brand's url; tests: status 202 or 200; examples: 202 queued `Scan`, 200 "already running" `Scan`, 400 `VALIDATION_ERROR`.
  - `GET /api/v1/scans/:scanId`; examples: 200 running (`currentStep: "read-pages"`), 200 done (with a `result` built from the file's `brandKit` + `business` demo data), 200 failed (`error: "We can only read public websites. Check the address and try again."`), 404 `SCAN_NOT_FOUND`.
  - Add `scanId` to the `newBrandBody` example (as an optional field with a demo uuid and a note) and add a 409 `SCAN_NOT_DONE` and 404 `SCAN_NOT_FOUND` example to `POST /brands` and `POST /admin/clients/:id/brands`.
  Run `pnpm --filter api run postman` → prints the route/request counts and "Every route has a Postman request."

- [ ] **Step 3: Docs** — `apps/api/AGENTS.md`: one bullet under the brand-scan bullet: scans run in an in-process queue one at a time (`src/scan-queue`), a person has at most one queued/running scan, a restart marks leftovers failed, step ids are `discover | read-pages | interpret | report`. Catalogue §7: replace the `currentStep` line with the real ids; add the one-active-scan rule (200 with the existing scan) and the interruption message; note `SCAN_NOT_DONE` on `POST /brands`.

- [ ] **Step 4: Check** — `check-types`, `build`, `postman` all clean.

---

### Task 5: Live verification through HTTP

**Files:** none changed (a temporary token-minting script is allowed and deleted afterwards).

- [ ] **Step 1: Token** — `apps/api/.env` has `CLERK_SECRET_KEY`. Mint a session token the way the Postman pre-request script does (read `postman/build-collection.cjs` around the `api.clerk.com/v1/sessions` calls): list users (`GET https://api.clerk.com/v1/users?limit=10`), pick the owner's user (an admin: email in `ADMIN_EMAILS` in `.env`) and, if one exists, a second non-admin user; `POST /v1/sessions` `{ user_id }` then `POST /v1/sessions/{id}/tokens` → JWT. Keep tokens out of the report.
- [ ] **Step 2: Start the API** — `pnpm --filter api run dev` in the background (port from `.env`, default 4000); wait for "Server is running". Record the start-up line about interrupted scans (expected 0 the first time).
- [ ] **Step 3: Run the spec's verification list** with `curl -H "Authorization: Bearer $TOKEN"` and record each response (trimmed):
  1. `POST /api/v1/scans` `{ "url": "donangie.com" }` → 202, `status: "queued"`, `currentStep: null`.
  2. Poll `GET /api/v1/scans/:id` every 2 s: `running` with `currentStep` visiting `discover`, `read-pages`, `interpret`, `report` (record which you observed), then `done` with `result.brand.colors[0].hex` `#971B2F`, `result.business.phone` `(212) 889-8884`, `pages.length` ≥ 3, `finishedAt` set.
  3. While a scan is running (start one for `tartinebakery.com`): a second `POST /scans` → 200 with the same id.
  4. `POST /scans` `{ "url": "localhost" }` → 202, then `failed` with error "We can only read public websites. Check the address and try again."; `{ "url": "not a url" }` → 400 `VALIDATION_ERROR`.
  5. Second user's token (if one exists) on the done scan → 404 `SCAN_NOT_FOUND`; admin token → 200. If no second user exists, say so.
  6. `POST /api/v1/brands` with a valid body plus `scanId` of the done scan → 201; `GET /scans/:id` now shows `brandId`; `scanId` of the failed scan → 409 `SCAN_NOT_DONE`; a random uuid → 404 `SCAN_NOT_FOUND`. Then `DELETE /api/v1/brands/:brandId` to archive the test brand.
  7. Start a scan and kill the dev server (Ctrl+C / stop the background process) mid-run; start it again → the start-up log says "Marked 1 interrupted scan(s) as failed" and `GET /scans/:id` shows `failed` with "The scan was interrupted. Please try again."
- [ ] **Step 4: Stop the dev server**, delete any temporary script, run `check-types`, `build`, `postman:check` once more. Report every response.
