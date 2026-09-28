# Scan endpoints (Phase 2A) — design

Date: 2026-09-22. Status: approved in chat section by section; file for the owner's review.

Builds on: `docs/superpowers/specs/2026-09-20-api-endpoints-catalogue.md` §7 (endpoints and shapes), `docs/superpowers/specs/2026-09-20-database-schema-design.md` (`brand_scans`), and the brand scan itself (`apps/api/src/scan`, `apps/api/src/mastra/workflows/brand-scan`, skill `brand-scan-firecrawl`).

## Goal

The onboarding screen can start a website scan, watch its progress, read the proposed brand kit, and create the brand from it. The scan that exists today as a terminal command runs behind the API and writes to `brand_scans`.

## What is already decided (catalogue §7, unchanged)

- `POST /api/v1/scans` `{ url }` → `202` `Scan` with `status: "queued"`. Any signed-in user. `400 VALIDATION_ERROR` when `url` fails `websiteUrlSchema`.
- `GET /api/v1/scans/:scanId` → `200` `Scan`; the web app polls every 1–2 s until `done` or `failed`. Requester or admin; anyone else gets `404 SCAN_NOT_FOUND` (same wording style as `BRAND_NOT_FOUND`).
- `Scan` shape: `{ id, brandId, url, status, currentStep, pages, result, error, startedAt, finishedAt, createdAt }`. `result` is a `ScanResult` when done; `error` is a plain sentence when failed.
- `POST /api/v1/brands` and `POST /api/v1/admin/clients/:id/brands` accept an optional `scanId`; the API sets `brand_scans.brand_id`.
- No third scan endpoint; no re-scan of an existing brand yet.

## Decisions made 2026-09-22

1. **Step ids are the workflow's real ids**: `currentStep ∈ discover | read-pages | interpret | report` (`SCAN_STEP_IDS` in `apps/api/src/scan/types.ts`). The catalogue's `fetch | visual | voice | audience` is replaced; the web app maps ids to labels when it leaves the mock in phase 3. Reason: colours and fonts now arrive with the home page, so "visual" is not a phase, and the API should not report a step that is not running.
2. **Execution: in-process queue, one scan at a time.** `POST /scans` inserts the row and enqueues its id in an in-memory FIFO owned by the API process. A worker loop takes one id at a time (`SCAN_CONCURRENCY = 1`; a free Firecrawl key allows 10 requests/min and a scan is up to 7) and runs `runBrandScan(url, { onStep })`. The queue sits behind one small interface so a Postgres-backed queue can replace it when there is more than one API process.
3. **Restart sweep.** At start-up the API marks every row still `queued` or `running` as `failed` with `error = "The scan was interrupted. Please try again."` and `finishedAt = now`. A scan never stays stuck.
4. **One active scan per user.** If the caller already has a scan in `queued` or `running`, `POST /scans` returns that scan with `200` instead of creating another. Stops double-clicks and reloads from spending Firecrawl credits.
5. **Error text.** `ScanError` messages (the six codes, already written for a business owner) go into `error` as they are. Any other failure (Firecrawl account/outage, model provider, bug) is logged with the scan id and stored as `"Something went wrong on our side. Please try again."`.

## Data flow

```
POST /scans ─▶ ScansService.start ─▶ ScansRepository.create (queued)
                                  └▶ scanQueue.enqueue(id) ──▶ worker: ScansRepository.markRunning(id)
                                                                        runBrandScan(url, { onStep: step => markStep(id, step) })
                                                                        ok   → markDone(id, result, pages)
                                                                        !ok  → markFailed(id, message)
GET /scans/:id ─▶ ScansService.get ─▶ ScansRepository.findById (requester or admin) ─▶ toScan(row)
POST /brands { scanId } ─▶ BrandsService.create ─▶ ScansService.claim(user, scanId) ─▶ brand row ─▶ ScansRepository.attachBrand(scanId, brandId)
```

Table writes per scan: 1 insert, 1 `running` + 4 step updates, 1 final update. `pages` and `result` are written together at `done`.

## Components (follow the API's Route → Controller → Service → Repository layout, static classes)

| File | Responsibility |
|---|---|
| `packages/shared/src/schema/scan.schema.ts` | Add `scanSchema` (the `Scan` response shape), `newScanSchema` (`{ url: websiteUrlSchema }`), `scanStepIdSchema`; export types. `newBrandSchema` gains `scanId: z.uuid().optional()`. |
| `apps/api/src/routes/scans.route.ts` | `POST /` (validate body), `GET /:id`. Mounted at `/api/v1/scans` in `v1.route.ts` (behind `requireUser` like everything under `/api/v1`). |
| `apps/api/src/controllers/scans.controller.ts` | `start` → 202 (or 200 when an active scan was returned), `get` → 200. |
| `apps/api/src/services/scans.service.ts` | `start(user, input)`, `get(user, id)`, `claim(user, scanId)` (done + requester-or-admin, else `SCAN_NOT_FOUND`; not done → `409 SCAN_NOT_DONE`), `toScan(row)`. Access scope: `requestedBy = user.id` unless admin. |
| `apps/api/src/repositories/scans.repository.ts` | `create`, `findById(id, scope)`, `findActiveFor(userId)`, `markRunning`, `markStep`, `markDone`, `markFailed`, `attachBrand`, `failInterrupted()` (the sweep). Only file that imports Drizzle for scans. |
| `apps/api/src/scan-queue/index.ts` | `enqueueScan(id)`, `startScanWorker()`; the FIFO, `SCAN_CONCURRENCY`, and the run loop that calls `runBrandScan` and the repository. Plain functions. Imports `runBrandScan` from `src/mastra/workflows/brand-scan/run` — allowed, this is API code, not `src/scan`. |
| `apps/api/src/server.ts` | After the DB is reachable: `await ScansRepository.failInterrupted()`, then `startScanWorker()`. Graceful shutdown lets the running scan finish or marks it failed (whichever the existing shutdown timeout allows). |
| `apps/api/src/services/brands.service.ts` (+ admin) | `create` accepts `scanId`, calls `ScansService.claim` before inserting and `ScansRepository.attachBrand` after. |
| `apps/api/postman/*` | Two requests added; `pnpm --filter api run postman` regenerates and checks. |
| `apps/api/AGENTS.md`, catalogue §7 | Step ids, queue behaviour, one-active-scan rule. |

## Error codes

Existing `AppError(message, status, code)`. New: `SCAN_NOT_FOUND` (404, "This scan doesn't exist, or you don't have access to it."), `SCAN_NOT_DONE` (409, "This scan hasn't finished yet."). `VALIDATION_ERROR` from the existing validate middleware.

## Verification (no automated tests, owner's rule)

Through Postman (the collection's token-minting script) against the dev Neon database:

1. `POST /scans` `{ "url": "donangie.com" }` → 202, `status: queued`, `currentStep: null`.
2. Poll `GET /scans/:id` → `running` with `currentStep` moving `discover → read-pages → interpret → report`, then `done` with `result.brand.colors` containing `#971B2F` and `result.business.phone` `(212) 889-8884`, `pages` non-empty, `finishedAt` set.
3. Second `POST /scans` while one is running → 200 with the same id.
4. `POST /scans` `{ "url": "127.0.0.1" }` → 202 then `failed` with the `BLOCKED_ADDRESS` message (the address passes the URL rule and is refused by the scan's vetting); `{ "url": "localhost" }` and `{ "url": "not a url" }` → 400 `VALIDATION_ERROR` (`websiteUrlSchema` needs a dot in the host, so these never reach the scan).
5. Another user's token on `GET /scans/:id` → 404; admin token → 200.
6. `POST /brands` with `scanId` of the done scan → 201 and `GET /scans/:id` shows `brandId`; with a running scan's id → 409; with a random uuid → 404.
7. Restart the API while a scan is running → the row is `failed` with the interruption message.
8. `pnpm --filter api run postman` passes; `check-types` and `build` clean.

## Out of scope

Re-scanning an existing brand; a multi-process queue; scan history lists; rate limiting beyond the one-active-scan rule; the web app (mock until phase 3).
