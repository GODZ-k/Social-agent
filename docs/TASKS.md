# Roadmap board

![phase 1](https://img.shields.io/badge/phase_1-done-brightgreen)
![phase 2A](https://img.shields.io/badge/phase_2A-done-brightgreen)
![phase 2B](https://img.shields.io/badge/phase_2B-next-orange)
![open decisions](https://img.shields.io/badge/open_decisions-8-blue)
![known gaps](https://img.shields.io/badge/known_gaps-13-lightgrey)
![updated](https://img.shields.io/badge/updated-2026--09--22-lightgrey)

*What is in flight now, what comes next, what waits, and everything already landed.*

Endpoint counts and phases come from the endpoint catalogue,
[`docs/superpowers/specs/2026-09-20-api-endpoints-catalogue.md`](./superpowers/specs/2026-09-20-api-endpoints-catalogue.md),
which lists 39 endpoints. `docs/superpowers` has been versioned since 2026-09-22, so every spec and plan
linked below is in git. This is a working file:
update it as work lands.

<details>
<summary>How to read the board</summary>

A task sits in the column that describes its state, so there is no status column: **Now**
is in flight, **Next** is what starts when Now clears, **Later** is a phase nobody has
opened yet, **Done** has landed. Only the two lists at the bottom carry a status badge,
because deferred, open and blocked are the whole point there.

Priority reads as:

- ![P0][p0] blocks the next milestone
- ![P1][p1] this phase
- ![P2][p2] next phase
- ![P3][p3] later, nice to have

**Progress** is 0–100 % of the task's own scope. A planned task is always
![0%][pr0]; a finished one is always ![100%][pr100]; anything between is the honest share
of steps finished.

</details>

<a id="contents"></a>

## Contents

- [At a glance](#at-a-glance)
- [Now](#now)
- [Next](#next)
- [Later](#later)
- [Done](#done)
- [Deferred and known gaps](#deferred-and-known-gaps)
- [Open decisions](#open-decisions)
- [Related](#related)

<a id="at-a-glance"></a>

## At a glance

| Phase                                         | Progress       | Priority   | Next milestone                                           |
| --------------------------------------------- | -------------- | ---------- | -------------------------------------------------------- |
| **Phase 1 — Foundation**                      | ![100%][pr100] | ![P0][p0] | Remove `GET /health/test-error` before production (1-13) |
| **Phase 2A — Brand scan**                     | ![100%][pr100] | ![P0][p0] | The owner's commit, then phase 2B (2B-1)                 |
| **Phase 2B — Strategy**                       | ![0%][pr0]     | ![P1][p1] | Strategist agent spec (2B-1)                             |
| **Phase 3 — Posts**                           | ![0%][pr0]     | ![P2][p2] | Copywriter, Art Director, Editor agents (3-1)            |
| **Phase 4 — Chat**                            | ![0%][pr0]     | ![P2][p2] | Account Manager agent (4-1)                              |
| **Phase 5 — Accounts, publishing, analytics** | ![0%][pr0]     | ![P3][p3] | Social accounts and the OAuth callback (5-1)             |

<a id="now"></a>

## Now

Phase 2A, the scan endpoints. The plan is
[`2026-09-22-scan-endpoints.md`](./superpowers/plans/2026-09-22-scan-endpoints.md), the
spec is
[`2026-09-22-scan-endpoints-design.md`](./superpowers/specs/2026-09-22-scan-endpoints-design.md),
and the ledger is `.superpowers/sdd/2026-09-22-scan-endpoints/progress.md`.

> [!NOTE]
> Phase 2A is complete and verified on 2026-09-22: 8 of 8 live HTTP checks passed and
> the OpenAPI check reports 15 routes / 15 operations, every route covered. Only the owner's
> commit is outstanding.

| ID       | Task                                               | Priority  | Progress     | Notes                                              |
| -------- | -------------------------------------------------- | --------- | ------------ | -------------------------------------------------- |
| **2A-6** | Final report to the owner + commit (owner commits) | ![P0][p0] | ![50%][pr50] | Report given 2026-09-22; the commit is the owner's |

<a id="next"></a>

## Next

Next up, in order.

| Order | Task                                                                     | Priority  | Progress     | Pointer                                                                  |
| ----- | ------------------------------------------------------------------------ | --------- | ------------ | ------------------------------------------------------------------------ |
| **1** | Finish 2A (above)                                                        | ![P0][p0] | ![90%][pr90] | Five tasks done; the owner's commit is left                              |
| **2** | Strategist agent spec (design conversation like the brand scan)          | ![P1][p1] | ![0%][pr0]   | `apps/api/src/mastra/agents/strategist`, `workflows/strategy-generation` |
| **3** | Strategy endpoints (5)                                                   | ![P1][p1] | ![0%][pr0]   | catalogue §8                                                             |
| **4** | Onboarding screens in `apps/web` wired to real scan + strategy endpoints | ![P1][p1] | ![0%][pr0]   | [`DESIGN.md`](./DESIGN.md)                                               |
| **5** | Phase 3 — posts                                                          | ![P2][p2] | ![0%][pr0]   | catalogue §9                                                             |

<details>
<summary>Phase 2B — strategy, 6 tasks (part of phase 2, 7 endpoints with 2A)</summary>

| ID       | Task                                                                                     | Priority  | Progress   | Notes                                          |
| -------- | ---------------------------------------------------------------------------------------- | --------- | ---------- | ---------------------------------------------- |
| **2B-1** | Strategist agent: instructions, output schema, skills                                    | ![P1][p1] | ![0%][pr0] | `apps/api/src/mastra/agents/strategist`        |
| **2B-2** | `business-discovery` workflow (Growth Consultant → Audience Researcher)                  | ![P1][p1] | ![0%][pr0] | build order in `apps/api/src/mastra/README.md` |
| **2B-3** | `strategy-generation` workflow (Strategist, Editor-reviewed)                             | ![P1][p1] | ![0%][pr0] | —                                              |
| **2B-4** | Strategy endpoints (5): current, versions, get version, generate, approve/activate       | ![P1][p1] | ![0%][pr0] | catalogue §8                                   |
| **2B-5** | Background job: auto-activate a `draft` strategy after 15 min (`approved_by` stays null) | ![P1][p1] | ![0%][pr0] | owner's rule 2026-09-20                        |
| **2B-6** | Onboarding screens in `apps/web`: URL → poll scan → edit kit → intake → strategy         | ![P1][p1] | ![0%][pr0] | after 2A-f and 2B-4                            |

</details>

<a id="later"></a>

## Later

Phases nobody has opened yet, plus the one cross-cutting job that waits for a deploy.

<details>
<summary>Phase 3 — posts, 10 endpoints, 6 tasks</summary>

| ID      | Task                                                                                                   | Priority  | Progress   | Notes                                             |
| ------- | ------------------------------------------------------------------------------------------------------ | --------- | ---------- | ------------------------------------------------- |
| **3-1** | Copywriter, Art Director, Editor agents                                                                | ![P2][p2] | ![0%][pr0] | —                                                 |
| **3-2** | `content-generation` (≤2 rewrites, Editor-gated) and `post-revision` workflows                         | ![P2][p2] | ![0%][pr0] | —                                                 |
| **3-3** | Post slot planning from the strategy cadence (plain code)                                              | ![P2][p2] | ![0%][pr0] | —                                                 |
| **3-4** | Post endpoints: list, generate, get, patch, approve, reject, request-changes, reopen, add/delete media | ![P2][p2] | ![0%][pr0] | catalogue §9; a post is never auto-published      |
| **3-5** | Media storage — not decided yet: S3 / R2 / other; direct browser upload or not                         | ![P2][p2] | ![0%][pr0] | ![blocked][blocked] on catalogue open question 3  |
| **3-6** | Take `apps/web` off the mock data seam onto the real API                                               | ![P2][p2] | ![0%][pr0] | —                                                 |

</details>

<details>
<summary>Phase 4 — chat, 3 endpoints, 3 tasks</summary>

| ID      | Task                                                                       | Priority  | Progress   | Notes         |
| ------- | -------------------------------------------------------------------------- | --------- | ---------- | ------------- |
| **4-1** | Account Manager agent (runs intake, starts workflows)                      | ![P2][p2] | ![0%][pr0] | —             |
| **4-2** | `POST /brands/:brandId/chat` as SSE; Mastra memory threads tagged by brand | ![P2][p2] | ![0%][pr0] | catalogue §10 |
| **4-3** | List threads, list messages (`limit` + `cursor`)                           | ![P2][p2] | ![0%][pr0] | catalogue §10 |

</details>

<details>
<summary>Phase 5 — social accounts, publishing, analytics, 7 endpoints, 6 tasks</summary>

| ID      | Task                                                                        | Priority  | Progress   | Notes                   |
| ------- | --------------------------------------------------------------------------- | --------- | ---------- | ----------------------- |
| **5-1** | Social accounts: list, connect, OAuth callback (signed `state`), disconnect | ![P3][p3] | ![0%][pr0] | catalogue §11           |
| **5-2** | Publish a post                                                              | ![P3][p3] | ![0%][pr0] | catalogue §12           |
| **5-3** | Background jobs: publish due posts, fetch metrics, refresh tokens           | ![P3][p3] | ![0%][pr0] | no endpoints on purpose |
| **5-4** | Performance Analyst agent + `learning-cycle` workflow                       | ![P3][p3] | ![0%][pr0] | —                       |
| **5-5** | Analytics and audience endpoints                                            | ![P3][p3] | ![0%][pr0] | catalogue §13           |
| **5-6** | Meta deauthorize / data-deletion webhooks if app review requires them       | ![P3][p3] | ![0%][pr0] | catalogue §14           |

</details>

Cross-cutting, still to do:

| ID      | Task                                                                                                                        | Priority  | Progress   | Notes               |
| ------- | --------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- | ------------------- |
| **X-3** | Deploy story: run `packages/db` migrations before the API starts; `NODE_ENV=production` so Mastra Studio routes never mount | ![P1][p1] | ![0%][pr0] | before first deploy |

<a id="done"></a>

## Done

<details>
<summary>Phase 1 — foundation, 12 endpoints, 13 tasks (1-13 is the one still open)</summary>

| ID       | Task                                                                                                  | Priority  | Progress       | Notes                                                        |
| -------- | ----------------------------------------------------------------------------------------------------- | --------- | -------------- | ------------------------------------------------------------ |
| **1-1**  | `packages/db`: Drizzle schema, 12 tables, migrations 0000–0003 applied to Neon                        | ![P0][p0] | ![100%][pr100] | 2026-09-20, spec `…/2026-09-20-database-schema-design.md`    |
| **1-2**  | `apps/api` Express 5 at `/api/v1`, Controller → Service → Repository, `{ success, data }`, `AppError` | ![P0][p0] | ![100%][pr100] | 2026-09-20, plan `…/2026-09-20-backend-foundation.md`        |
| **1-3**  | Clerk auth: `requireUser` + own `users` row, `requireAdmin`, `authorizedParties` in production only   | ![P0][p0] | ![100%][pr100] | 2026-09-20                                                   |
| **1-4**  | `GET /health` (503 when the DB is down), graceful shutdown                                            | ![P1][p1] | ![100%][pr100] | 2026-09-20                                                   |
| **1-5**  | `GET /me`, `GET /me/overview`                                                                         | ![P0][p0] | ![100%][pr100] | 2026-09-20                                                   |
| **1-6**  | Brands: list, create, get, patch, archive (never delete), `scopeFor` ownership                        | ![P0][p0] | ![100%][pr100] | 2026-09-20, plan `…/2026-09-20-brands-rename-and-admin.md`   |
| **1-7**  | Rename `clients` → `brands` everywhere (client = person, brand = website workspace)                   | ![P0][p0] | ![100%][pr100] | 2026-09-20                                                   |
| **1-8**  | Admin: list clients, get client, invite via Clerk, create a brand for a client                        | ![P1][p1] | ![100%][pr100] | 2026-09-20                                                   |
| **1-9**  | Invited user links to its row on first sign-in by verified email (409 / 403)                          | ![P1][p1] | ![100%][pr100] | 2026-09-20                                                   |
| **1-10** | Postman collection generated from `build-collection.cjs`; `postman:check` fails on an uncovered route | ![P1][p1] | ![100%][pr100] | 2026-09-20                                                   |
| **1-11** | Endpoint catalogue (39 endpoints, phases 1–5)                                                         | ![P1][p1] | ![100%][pr100] | 2026-09-20                                                   |
| **1-12** | `apps/landing` marketing site on `@repo/ui`                                                           | ![P2][p2] | ![100%][pr100] | 2026-09-20, plan `…/2026-09-20-landing-site.md`              |
| **1-13** | Remove `GET /health/test-error` before production                                                     | ![P2][p2] | ![0%][pr0]     | ![open][open] developer tool, not in the 39; before shipping |

</details>

<details>
<summary>Phase 2A — brand scan agent, 6 tasks</summary>

| ID       | Task                                                                                                         | Priority  | Progress       | Notes                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------ | --------- | -------------- | -------------------------------------------------------------------------------------------------- |
| **2A-a** | `runBrandScan(url)`: `src/scan` + Mastra workflow `discover → read-pages → interpret → report`, one LLM call | ![P0][p0] | ![100%][pr100] | 2026-09-21, plan `…/2026-09-21-brand-scan-agent.md`                                                |
| **2A-b** | Firecrawl replaces own fetch + CSS parser; `src/scan/firecrawl.ts` the only egress, vets first               | ![P0][p0] | ![100%][pr100] | 2026-09-22, plan `…/2026-09-22-brand-scan-firecrawl.md`                                            |
| **2A-c** | Six owner-facing error codes                                                                                 | ![P0][p0] | ![100%][pr100] | 2026-09-22                                                                                         |
| **2A-d** | Clean-up pass over `src/scan` + brand-scan Mastra files, byte-identical output                               | ![P1][p1] | ![100%][pr100] | 2026-09-22, plan `…/2026-09-22-scan-clean-up.md`; live rerun on the 4 sites done with the API key |
| **2A-e** | `brand-scan-firecrawl` skill (verified API facts, test sites, expected values)                               | ![P1][p1] | ![100%][pr100] | 2026-09-22                                                                                         |
| **2A-f** | Scan endpoints (2A-1 … 2A-6)                                                                                 | ![P0][p0] | ![100%][pr100] | 2026-09-22; 8 of 8 live checks, Postman 15 routes / 25 requests                                    |

</details>

<details>
<summary>Phase 2A — scan endpoints, 5 of 6 tasks finished (2A-6 is in Now)</summary>

| ID       | Task                                                                                             | Priority  | Progress       | Notes                                                 |
| -------- | ------------------------------------------------------------------------------------------------ | --------- | -------------- | ----------------------------------------------------- |
| **2A-1** | Shared zod shapes (`scanSchema`, `newScanSchema`, `scanStepIdSchema`) + `scanId` on brand create | ![P0][p0] | ![100%][pr100] | 2026-09-22, reviewed clean                            |
| **2A-2** | `POST /api/v1/scans`, `GET /api/v1/scans/:id` — repository, service, controller, route           | ![P0][p0] | ![100%][pr100] | 2026-09-22, reviewed clean                            |
| **2A-3** | In-process FIFO scan queue (one at a time) + start-up/shutdown sweep in `server.ts`              | ![P0][p0] | ![100%][pr100] | 2026-09-22; fix round 1 closed an unhandled rejection |
| **2A-4** | Link a done scan to the brand in `BrandsService.create`; Postman "Scans" folder; docs            | ![P0][p0] | ![100%][pr100] | 2026-09-22, reviewed clean                            |
| **2A-5** | Live verification over HTTP (7 checks from the spec, incl. restart mid-scan)                     | ![P0][p0] | ![100%][pr100] | 2026-09-22; 8 of 8 checks passed                      |

</details>

<details>
<summary>Cross-cutting, finished</summary>

| ID      | Task                                                                                             | Priority  | Progress       | Notes                                            |
| ------- | ------------------------------------------------------------------------------------------------ | --------- | -------------- | ------------------------------------------------ |
| **X-1** | Put `docs/superpowers` (specs, plans) under version control                                     | ![P1][p1] | ![100%][pr100] | 2026-09-22; tracked now                          |
| **X-2** | Keep the OpenAPI registry current on every endpoint change (Postman removed 2026-09-22)         | ![P1][p1] | ![100%][pr100] | standing rule; `openapi:check` enforces it       |
| **X-7** | OpenAPI 3.1 from the code: `src/openapi/*`, `/api/docs` (Scalar), `openapi.json`, route↔operation check, `dev-token` script | ![P1][p1] | ![100%][pr100] | 2026-09-22                                       |
| **X-6** | Project docs in `docs/` (PRD, ARCHITECTURE, SECURITY, TASKS, LESSION, MEMORY, DESIGN); API_SPEC retired for OpenAPI | ![P1][p1] | ![100%][pr100] | 7 docs written and styled 2026-09-22        |

</details>

<a id="deferred-and-known-gaps"></a>

## Deferred and known gaps

Parked on purpose, cross-cutting:

| ID      | Task                                                                     | Priority  | Status                | Notes                         |
| ------- | ------------------------------------------------------------------------ | --------- | --------------------- | ----------------------------- |
| **X-4** | Billing — provider-agnostic (Razorpay, Stripe, Polar), not Clerk Billing | ![P3][p3] | ![deferred][deferred] | no tables yet                 |
| **X-5** | Decide whether a test suite comes back                                   | ![P3][p3] | ![deferred][deferred] | removed 2026-09-20 on purpose |

<details>
<summary>Thirteen known gaps (G-1 … G-13)</summary>

| ID       | Gap                                                                                                            | Priority  | Status                |
| -------- | -------------------------------------------------------------------------------------------------------------- | --------- | --------------------- |
| **G-1**  | `mailto:` input answers `BLOCKED_ADDRESS`; `INVALID_URL` would read better                                     | ![P3][p3] | ![deferred][deferred] |
| **G-2**  | The 45 s scan budget covers fetching only, not the LLM step (document before phase 2 adds an endpoint timeout) | ![P2][p2] | ![deferred][deferred] |
| **G-3**  | In-process queue: a second API process would run its own; Postgres-backed queue needed for >1 process          | ![P2][p2] | ![deferred][deferred] |
| **G-4**  | One-active-scan rule is best-effort (read-then-write); a partial unique index would make it hard               | ![P3][p3] | ![deferred][deferred] |
| **G-5**  | No index on `brand_scans (requested_by, status)`                                                               | ![P3][p3] | ![deferred][deferred] |
| **G-6**  | `GET /admin/clients` has no pagination                                                                         | ![P3][p3] | ![deferred][deferred] |
| **G-7**  | `WEB_APP_URL` env for the invite redirect does not exist (uses `CORS_ORIGINS[0]`)                              | ![P2][p2] | ![deferred][deferred] |
| **G-8**  | No rate limiting beyond one active scan per user                                                               | ![P2][p2] | ![deferred][deferred] |
| **G-9**  | Admin role revocation lags up to 1 h (`users` row cache)                                                       | ![P3][p3] | ![deferred][deferred] |
| **G-10** | Firecrawl's `secondary` colour varies run to run on rotating-hero pages                                        | ![P3][p3] | ![deferred][deferred] |
| **G-11** | `startedAt` can precede `createdAt` by ~0.4 s (database `now()` vs the API clock) — use `` sql`now()` `` in `markRunning` | ![P3][p3] | ![deferred][deferred] |
| **G-12** | The `report` step lasts ~5 s, so 2 s polling rarely shows it                                                   | ![P3][p3] | ![deferred][deferred] |
| **G-13** | No admin exists in development: decide between `ADMIN_EMAILS` in `.env` and Clerk `publicMetadata.role`        | ![P1][p1] | ![open][open]         |

</details>

<a id="open-decisions"></a>

## Open decisions

Nine on the list; eight are open, and D-9 is parked rather than undecided.

| ID      | Decision                                                                                              | Priority  | Status                |
| ------- | ----------------------------------------------------------------------------------------------------- | --------- | --------------------- |
| **D-1** | May content generation start on a *draft* strategy? (auto-activation after 15 min answers most of it) | ![P1][p1] | ![open][open]         |
| **D-2** | Long agent work (strategy, posts): one long request or 202 + polling like the scan                    | ![P1][p1] | ![open][open] Q2      |
| **D-3** | Media storage provider and upload path                                                                | ![P2][p2] | ![open][open] Q3      |
| **D-4** | Reject vs request-changes semantics; is a reason required                                             | ![P2][p2] | ![open][open] Q4      |
| **D-5** | Which OAuth apps / account types for phase 5                                                          | ![P3][p3] | ![open][open] Q5      |
| **D-6** | Always-on Node process or serverless (decides how background jobs run)                                | ![P1][p1] | ![open][open] Q6      |
| **D-7** | Chat scope: shared per brand or private per user                                                      | ![P3][p3] | ![open][open] Q8      |
| **D-8** | Billing provider(s)                                                                                   | ![P3][p3] | ![open][open]         |
| **D-9** | `brand_members` (several people per brand)                                                            | ![P3][p3] | ![later][later]       |

The Q numbers point at the open questions in the endpoint catalogue. D-9 is not designed
yet; it is a later idea rather than a decision waiting on anyone.

<a id="related"></a>

## Related

- [PRD.md](./PRD.md) sets out what the product must do.
- [ARCHITECTURE.md](./ARCHITECTURE.md) describes how the system is built.
- `/api/docs` (development) and `apps/api/openapi/openapi.json` are the HTTP contract.
- [SECURITY.md](./SECURITY.md) holds the threat model and the controls.
- [DESIGN.md](./DESIGN.md) is the design system.
- [LESSION.md](./LESSION.md) collects the lessons learned.
- [MEMORY.md](./MEMORY.md) is the brief to load first every session.

<!-- Priority, progress and status badges. Progress renders as an uptime-style bar: green bars for the done share, grey for the rest. -->

[p0]: https://img.shields.io/badge/P0-critical-red
[p1]: https://img.shields.io/badge/P1-this_phase-orange
[p2]: https://img.shields.io/badge/P2-next_phase-yellow
[p3]: https://img.shields.io/badge/P3-later-lightgrey
[pr0]: https://img.shields.io/badge/%20-%7C%7C%7C%7C%7C%7C%7C%7C%7C%7C%200%25-lightgrey?style=flat-square&labelColor=lightgrey
[pr50]: https://img.shields.io/badge/%7C%7C%7C%7C%7C-%7C%7C%7C%7C%7C%2050%25-lightgrey?style=flat-square&labelColor=brightgreen
[pr90]: https://img.shields.io/badge/%7C%7C%7C%7C%7C%7C%7C%7C%7C-%7C%2090%25-lightgrey?style=flat-square&labelColor=brightgreen
[pr100]: https://img.shields.io/badge/%7C%7C%7C%7C%7C%7C%7C%7C%7C%7C-100%25-brightgreen?style=flat-square&labelColor=brightgreen
[deferred]: https://img.shields.io/badge/deferred-lightgrey
[open]: https://img.shields.io/badge/open-blue
[blocked]: https://img.shields.io/badge/blocked-red
[later]: https://img.shields.io/badge/later-lightgrey
