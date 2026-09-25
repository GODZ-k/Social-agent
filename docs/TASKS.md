# Roadmap board

![phase 1](https://img.shields.io/badge/phase_1-done-brightgreen)
![phase 2A](https://img.shields.io/badge/phase_2A-done-brightgreen)
![phase 2B](https://img.shields.io/badge/phase_2B-in_progress-orange)
![open decisions](https://img.shields.io/badge/open_decisions-8-blue)
![known gaps](https://img.shields.io/badge/known_gaps-13-lightgrey)
![updated](https://img.shields.io/badge/updated-2026--09--23-lightgrey)

*What is in flight now, what comes next, what waits, and everything already landed.*

Endpoint counts and phases come from the endpoint catalogue,
[`docs/superpowers/specs/2026-09-20-api-endpoints-catalogue.md`](./superpowers/specs/2026-09-20-api-endpoints-catalogue.md),
which lists 39 endpoints. The seven docs in `docs/` are versioned; `docs/superpowers` (specs, plans) is local-only
by the owner's choice. This is a working file:
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
| **Phase 2B — Strategy**                       | ![50%][pr50]   | ![P1][p1] | Live verification of business discovery (2B-1), then the Strategist (2B-2) |
| **Phase 3 — Posts**                           | ![0%][pr0]     | ![P2][p2] | Copywriter, Art Director, Editor agents (3-1)            |
| **Phase 4 — Chat**                            | ![0%][pr0]     | ![P2][p2] | Account Manager agent (4-1)                              |
| **Phase 5 — Accounts, publishing, analytics** | ![15%][pr15]   | ![P3][p3] | 5-1 built for Instagram (2026-09-23); live check waits on Meta app keys |

<a id="now"></a>

## Now

Phase 2A, the scan endpoints. The plan is
[`2026-09-22-scan-endpoints.md`](./superpowers/plans/2026-09-22-scan-endpoints.md), the
spec is
[`2026-09-22-scan-endpoints-design.md`](./superpowers/specs/2026-09-22-scan-endpoints-design.md),
and the ledger is `.superpowers/sdd/2026-09-22-scan-endpoints/progress.md`.

> [!NOTE]
> Phase 2A is complete and verified on 2026-09-22: 8 of 8 live HTTP checks passed and
> 15 routes are live. Postman was removed on 2026-09-22. Only the owner's
> commit is outstanding.

| ID       | Task                                               | Priority  | Progress     | Notes                                              |
| -------- | -------------------------------------------------- | --------- | ------------ | -------------------------------------------------- |
| **2A-6** | Final report to the owner + commit (owner commits) | ![P0][p0] | ![50%][pr50] | Report given 2026-09-22; the commit is the owner's |

<a id="next"></a>

## Next

Next up, in order.

| Order | Task                                                                     | Priority  | Progress     | Pointer                                                                  |
| ----- | ------------------------------------------------------------------------ | --------- | ------------ | ------------------------------------------------------------------------ |
| **1** | Finish 2B-1: commit the resolved stash merge (migrations `0004` and `0005` applied and live checks passed 2026-09-25) | ![P0][p0] | ![95%][pr95] | Left: the owner stages, commits and drops the stash |
| **2** | Strategist agent spec (design conversation like the brand scan)          | ![P1][p1] | ![0%][pr0]   | `apps/api/src/mastra/agents/strategist`, `workflows/strategy-generation` |
| **3** | Strategy endpoints (5)                                                   | ![P1][p1] | ![0%][pr0]   | catalogue §8                                                             |
| **4** | Onboarding screens in `apps/web` wired to real scan + strategy endpoints | ![P1][p1] | ![0%][pr0]   | [`DESIGN.md`](./DESIGN.md)                                               |
| **5** | Phase 3 — posts                                                          | ![P2][p2] | ![0%][pr0]   | catalogue §9                                                             |

<details>
<summary>Phase 2B — strategy, 7 tasks (part of phase 2, 7 endpoints with 2A)</summary>

| ID       | Task                                                                                     | Priority  | Progress   | Notes                                          |
| -------- | ---------------------------------------------------------------------------------------- | --------- | ---------- | ---------------------------------------------- |
| **2B-1** | Business discovery: intake, `research_runs` + `brand_research`, Firecrawl search tools, Growth Consultant + Audience Researcher, `business-discovery` workflow, research queue, `POST\|GET /brands/:brandId/research`, nine skills | ![P1][p1] | ![95%][pr95] | Built 2026-09-22, integrated and reviewed 2026-09-23. Live 2026-09-25 on fourbarrelcoffee.com: 409 INTAKE_REQUIRED without intake, 202 start, 409 RESEARCH_RUNNING on a second start, run done in 4 min 52 s with a growth brief and an audience profile (5 sources each). Left: commit. Ledger `.superpowers/sdd/2026-09-22-business-discovery/progress.md` |
| **2B-2** | Strategist agent: instructions, output schema, skills                                    | ![P1][p1] | ![0%][pr0] | `packages/agents/src/strategist` as `createStrategist({ model })`; takes `BrandContext` (latest growth brief and audience profile included) |
| **2B-3** | `strategy-generation` workflow (Strategist, Editor-reviewed)                             | ![P1][p1] | ![0%][pr0] | —                                              |
| **2B-4** | Strategy endpoints (5): current, versions, get version, generate, approve/activate       | ![P1][p1] | ![0%][pr0] | catalogue §8                                   |
| **2B-5** | Background job: auto-activate a `draft` strategy after 30 min (`approved_by` stays null) | ![P1][p1] | ![0%][pr0] | owner's rule 2026-09-20                        |
| **2B-6** | Onboarding screens in `apps/web`: URL → poll scan → edit kit → intake → strategy         | ![P1][p1] | ![0%][pr0] | after 2A-f and 2B-4                            |
| **2B-7** | Guided intake by the Account Manager (see the notes below)                                | ![P1][p1] | ![95%][pr95] | Built and verified live 2026-09-25 (plan `docs/superpowers/plans/2026-09-25-guided-intake.md`, ledger `.superpowers/sdd/2026-09-25-guided-intake/progress.md`): migration 0006, 4 endpoints, the Account Manager in `packages/agents`. Left: the owner's commit; the onboarding screens are 2B-6 |
| **X-12** | Code style: name a value before passing it (no `f(await g())`, no `.where(helper())`); plain generic names for what a function returns | ![P2][p2] | ![95%][pr95] | Done 2026-09-25 by 4 parallel agents: ~150 rewrites in ~60 files (api, packages, web, landing, ui), plus 22 `../` imports in apps/api turned into `@/`. Rule written into root `AGENTS.md`. Verified: 37 live API calls byte-identical, every agent instruction/schema/rendered prompt byte-identical (19 items), donangie.com scan facts identical, all packages build, check-types + lint pass for api/web/landing/ui, web build passes, migration runner still works. Left inline on purpose: route wiring `asyncHandler(Controller.x)`, calls inside conditions/callbacks, zod, JSX, trivial built-ins. Left: commit |
| **X-11** | Rename "intake" to "questionnaire" everywhere; `POST .../intake/approve` becomes `POST .../questionnaire/submit` (the owner submits, only the Account Manager approves) | ![P1][p1] | ![95%][pr95] | Done 2026-09-25: 7 files and folders moved, 70 files updated (code, types, `QUESTIONNAIRE_*` error codes, prompts and skills, docs), migration `0009_rename_intake_to_questionnaire.sql` renames the three `brands` columns (data kept; drizzle-kit reports no drift) and is applied. Verified: 26 live API calls identical to before once names are mapped (the only other difference is old AI-written research text that says "intake", stored data left as is); a full live run on a new test brand: 7 questions, answers, submit approved, research done in ~5 min with brief + profile; check-types (api, web), lint, build pass. Eraser diagrams 7, 8, 9, 11, 12, 13 and the whole loop updated. Rows above this one keep the old word. Left: commit |
| **X-10** | Simpler repository and service layer | ![P2][p2] | ![95%][pr95] | Done 2026-09-25: single-row reads use `db.query.<table>.findFirst`, inserts use `insertedRow()`, one `BrandsService.findRow` replaces four brand lookups (research polls no longer load social accounts), the Account Manager calls moved to `src/intake/account-manager-calls.ts` (intake service 264 to 162 lines), one `isoOrNull`. Verified: 38 live API calls byte-identical before and after (run twice for determinism), the six moved functions identical to the staged copy, check-types, lint, build pass. Left: commit |
| **2B-9** | `research_runs.current_step` as the `research_steps` enum (built from `researchStepIdSchema`), like `brand_scans.current_step` | ![P2][p2] | ![95%][pr95] | Done 2026-09-25: migration `0008_research_steps.sql` (drizzle-kit generated `"undefined"."research_steps"` without `USING`; fixed by hand) applied to Neon; the database refuses `diagonse` and accepts `diagnose`; a live discovery run on Four Barrel went 202 → diagnose → profile → done in 300 s; check-types, lint, build pass. Left: commit |
| **2B-8** | Move every built agent into `packages/agents` as factories; shared `BrandContext` + `BrandContextService.load` | ![P1][p1] | ![95%][pr95] | Done 2026-09-25: Brand Analyst, Growth Consultant, Audience Researcher, Account Manager and `generateStructured` in the package; Cadence wires models and tools in `apps/api/src/mastra/agents/team.ts`. Verified: instructions, schemas, prompts and tools identical before and after (11 of 11), `--facts` identical, live scan of tartinebakery.com ok in 26.8 s, check-types, lint and build pass. Eraser diagram 7 "Where the code lives" added. Left: commit |

Intake design notes (agreed 2026-09-24):

- **Runs after the owner saves the brand kit, before any research.** The Account Manager reads the brand kit and asks only what the website could not tell; what the scan found is confirmed, not asked again ("Your website says you sell cakes and bread. Is that right?").
- **Language first**: the chat language (what the owner reads comfortably) and, separately, the post language (what their customers speak). Both stored; the post language on the brand.
- **Languages supported first (owner, 2026-09-25)**: Hindi, English and Hinglish (Hindi written in English letters). Others later. The simple-wording rules are written for all three.
- **Very simple wording**: one question at a time, under about 12 words, an everyday example with each, buttons wherever possible (goals as chips, money as ranges), a progress count ("3 of 7"), 6-8 questions, about 3 minutes.
- **Required, no "Not sure"**: confirm what they sell; product, service or both (`businessType`); main goal; post language; ideal customer in their own words. **Optional, with "Not sure"**: best sellers, slow periods, order value (ranges), competitors, things never to say. "Not sure" is a valid answer; the Growth Consultant turns it into an open question.
- **Enforced three times**: the screen (no skip on required), `intakeSchema` (required fields not optional; add `businessType` and `postLanguage`), and discovery refuses to start without them (`INTAKE_REQUIRED`).
- **The Account Manager approves before research (owner, 2026-09-25)**: business discovery never starts without the Account Manager's approval that the intake is complete (every required answer present and confirmed with the owner). No approval, no research.
- **Every brand gets its own questions (owner, 2026-09-25)**: the Account Manager writes them from what the Brand Analyst found; only the five required facts are fixed, and code rejects a question list that misses one. Chat language on the brand; admins may type answers but the Account Manager still reviews; money ranges written for the business in its currency. Spec: `docs/superpowers/specs/2026-09-25-guided-intake-design.md`.
- **Ends in data, not a transcript**: a validated `intake` saved on the brand, then discovery starts through a workflow tool.
- **Two steps**: now a guided intake (one Account Manager call writes the questions as structured output in the chosen language; the onboarding screen asks them one by one); in phase 4 the same agent asks them conversationally, with follow-ups.
- **Product images for product businesses**: parked, to discuss; `businessType` is recorded now so content generation can use it later.

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

Phase 4 design notes (agreed 2026-09-24, to discuss when the phase opens):

- **Account Manager is a Mastra supervisor**: `agents: { brandAnalyst, strategist, copywriter, ... }`; Mastra picks a specialist from each one's `description`. Use `onDelegationStart` to cap or refuse delegations, and `requestContext` to pass the brand id (from the API, never from model output) into every delegation.
- **Client can pick a specialist directly**: the chat endpoint (4-2) takes an optional `agentId`; without it the message goes to the Account Manager. Same agents either way, one memory thread per brand and agent.
- **Skills stay with their specialists**: the Account Manager gets only its own skills (intake, explaining results, handoff), never the whole `packages/agents/skills` folder. All skills would make it do specialists' work itself, cost context every turn and blur who is responsible. No shared workspace skills folder either; each agent lists its own `skills: [...]`.
- **Actions go through workflows, not free delegation**: chat and advice may be delegated; anything that changes data (generate strategy, create posts, publish) is a tool that starts the workflow, so code-owned facts, voice checks and "never publish without human approval" can never be skipped in conversation.
- **Two modes per specialist**: one-call structured output inside workflows (skills inlined with `loadSkill()`), free text with memory in chat (`skills: [...]` loaded on demand). Instructions can be a function of `requestContext` to switch mode.
- **Memory, three layers, no vector database yet**:
  1. Business facts live in our Postgres tables (brand kit, intake, growth brief, audience profile, strategy, learnings) and are loaded into the Account Manager's context when a chat opens. This is the main memory; every agent reads the same facts.
  2. Conversation memory is Mastra Memory on the same Postgres (`@mastra/pg`): message history, working memory keyed by the **brand id** (a client can own several brands), and observational memory to condense long chats.
  3. Semantic recall (vector search over old messages) only once there are months of chat history; then pgvector on Neon through `@mastra/pg`, no new service.
- **Write-back rule**: a business change the owner mentions in chat ("we started catering") is saved to the intake or brand kit through a tool after the owner confirms, because workflows read the database, never the chat.

</details>

<details>
<summary>Phase 5 — social accounts, publishing, analytics, 7 endpoints, 6 tasks</summary>

| ID      | Task                                                                        | Priority  | Progress   | Notes                   |
| ------- | --------------------------------------------------------------------------- | --------- | ---------- | ----------------------- |
| **5-1** | Social accounts: list, connect, OAuth callback (signed `state`), disconnect | ![P3][p3] | ![90%][pr90] | Instagram built 2026-09-23 (`packages/social-connect` + `src/social`, API_SPEC §5.1); 501 for the other three. Left: end-to-end run with a Meta app + tester account, then the web Connect button |
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
| **X-7** | Scan domain cache: before a new scan, reuse a `done` scan of the same domain (host without `www.`) from the last 24 h, copied into the new row; `ScansRepository.findRecentDone` + an index on domain and `finished_at` (one migration); a "Scan again" option skips it. Postgres only, no Redis | ![P3][p3] | ![0%][pr0] | agreed 2026-09-24 |
| **X-8** | Request and scan logging with AsyncLocalStorage, for log context only: `src/utils/request-context.ts` (store `{ requestId, userId?, scanId? }`), first middleware runs each request in its own store and sets `x-request-id`, `requireUser` adds `userId`, a `log()` helper stamps the store on every line, `errorMiddleware` logs `requestId` and returns it in the 500 body. Every background scan gets its own store (`requestContext.run({ scanId }, () => runScan(id))`) or it inherits the wrong request. Users and scopes stay explicit arguments, never read from the store | ![P2][p2] | ![0%][pr0] | agreed 2026-09-24; pairs with X-3 |
| **X-9** | Cut the cost and time of discovery (and later agents), measured: baseline run on 2-3 brands first; cheap model for the research loop, expert only for the final brief/profile; page notes instead of whole pages in the loop (and 6,000 to ~3,000 chars); save the scan's page text so discovery never re-reads the client's site; competitors from the intake read directly; cache competitor pages and searches across brands for 7-30 days; prompt caching for instructions + skills (check Mastra support); tighter budgets after measuring; discovery runs once per brand. Evaluate non-Claude models for the loop (Gemini Flash / Flash-Lite, GPT mini / nano, DeepSeek Flash, Grok non-reasoning) on the same brands: tool calling, structured output, Hindi/Hinglish, injection resistance, data policy, price | ![P2][p2] | ![0%][pr0] | agreed 2026-09-25; after migrations 0004/0005 |

<a id="done"></a>

## Done

<details>
<summary>Phase 1 — foundation, 12 endpoints, 13 tasks (1-13 is the one still open)</summary>

| ID       | Task                                                                                                  | Priority  | Progress       | Notes                                                        |
| -------- | ----------------------------------------------------------------------------------------------------- | --------- | -------------- | ------------------------------------------------------------ |
| **1-1**  | `packages/db`: Drizzle schema, 12 tables, migrations 0000–0003 applied to Neon                        | ![P0][p0] | ![100%][pr100] | 2026-09-20, spec `…/2026-09-20-database-schema-design.md`    |
| **1-14** | Migration 0004: `brands.status` enum (`active`/`archived`, queries filter on it, `archived_at` keeps the time) and `brand_scans.current_step` typed as the `brand_scan_steps` enum; `status` on the `Brand` API shape | ![P1][p1] | ![90%][pr90] | 2026-09-23, generated + type-checked; owner runs `db:migrate` |
| **1-2**  | `apps/api` Express 5 at `/api/v1`, Controller → Service → Repository, `{ success, data }`, `AppError` | ![P0][p0] | ![100%][pr100] | 2026-09-20, plan `…/2026-09-20-backend-foundation.md`        |
| **1-3**  | Clerk auth: `requireUser` + own `users` row, `requireAdmin`, `authorizedParties` in production only   | ![P0][p0] | ![100%][pr100] | 2026-09-20                                                   |
| **1-4**  | `GET /health` (503 when the DB is down), graceful shutdown                                            | ![P1][p1] | ![100%][pr100] | 2026-09-20                                                   |
| **1-5**  | `GET /me`, `GET /me/overview`                                                                         | ![P0][p0] | ![100%][pr100] | 2026-09-20                                                   |
| **1-6**  | Brands: list, create, get, patch, archive (never delete), `scopeFor` ownership                        | ![P0][p0] | ![100%][pr100] | 2026-09-20, plan `…/2026-09-20-brands-rename-and-admin.md`   |
| **W-1**  | `apps/web` on server components: `features/<area>` layout, Server Actions, server-side mock, TanStack Query removed; ESLint made real (typescript-eslint, TS 6 pin) | ![P1][p1] | ![100%][pr100] | 2026-09-22 |
| **W-2**  | Cache Components on in `apps/web` (`cacheComponents: true`, Next 16.3.4): build passes, every route `◐`, all 13 pages and layouts opted out with `instant = false` pending route-by-route adoption via `next-cache-components-adoption` | ![P2][p2] | ![100%][pr100] | 2026-09-24 |
| **W-3**  | One source of truth for shared types: `z.infer` types moved to `packages/shared/src/types`, `Role` and `BrandColor` added; `apps/web` depends on `@social-agent/shared` and imports its types from there, `lib/types.ts` keeps only web-only types; API `Role` and `ScanStepId` copies removed | ![P2][p2] | ![100%][pr100] | 2026-09-24 |
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
| **2A-f** | Scan endpoints (2A-1 … 2A-6)                                                                                 | ![P0][p0] | ![100%][pr100] | 2026-09-22; 8 of 8 live checks, 15 routes live                                    |

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
| **X-1** | Version control for the docs: `docs/*.md` tracked; `docs/superpowers` kept local by choice       | ![P1][p1] | ![100%][pr100] | 2026-09-22                                       |
| **X-2** | Keep the API reference current on every endpoint change (Postman removed 2026-09-22)            | ![P1][p1] | ![100%][pr100] | `docs/API_SPEC.md` now; OpenAPI registry after the merge |
| **X-6** | Project docs at the root (PRD, ARCHITECTURE, API_SPEC, SECURITY, TASKS, LESSION, MEMORY, DESIGN) | ![P1][p1] | ![100%][pr100] | 8 root docs written and styled 2026-09-22        |

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
| **D-1** | May content generation start on a *draft* strategy? (auto-activation after 30 min answers most of it) | ![P1][p1] | ![open][open]         |
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
- [API_SPEC.md](./API_SPEC.md) is the HTTP contract.
- [SECURITY.md](./SECURITY.md) holds the threat model and the controls.
- [DESIGN.md](./DESIGN.md) is the design system.
- [LESSION.md](./LESSION.md) collects the lessons learned.
- [MEMORY.md](./MEMORY.md) is the brief to load first every session.

<!-- Priority, progress and status badges. Progress renders as an uptime-style bar: green bars for the done share, grey for the rest. -->

[p0]: https://img.shields.io/badge/P0-critical-red
[p1]: https://img.shields.io/badge/P1-this_phase-orange
[p2]: https://img.shields.io/badge/P2-next_phase-yellow
[p3]: https://img.shields.io/badge/P3-later-lightgrey
[pr15]: https://img.shields.io/badge/%7C%7C-%7C%7C%7C%7C%7C%7C%7C%7C%2015%25-lightgrey?style=flat-square&labelColor=brightgreen
[pr0]: https://img.shields.io/badge/%20-%7C%7C%7C%7C%7C%7C%7C%7C%7C%7C%200%25-lightgrey?style=flat-square&labelColor=lightgrey
[pr50]: https://img.shields.io/badge/%7C%7C%7C%7C%7C-%7C%7C%7C%7C%7C%2050%25-lightgrey?style=flat-square&labelColor=brightgreen
[pr90]: https://img.shields.io/badge/%7C%7C%7C%7C%7C%7C%7C%7C%7C-%7C%2090%25-lightgrey?style=flat-square&labelColor=brightgreen
[pr95]: https://img.shields.io/badge/%7C%7C%7C%7C%7C%7C%7C%7C%7C-%7C%2095%25-lightgrey?style=flat-square&labelColor=brightgreen
[pr100]: https://img.shields.io/badge/%7C%7C%7C%7C%7C%7C%7C%7C%7C%7C-100%25-brightgreen?style=flat-square&labelColor=brightgreen
[deferred]: https://img.shields.io/badge/deferred-lightgrey
[open]: https://img.shields.io/badge/open-blue
[blocked]: https://img.shields.io/badge/blocked-red
[later]: https://img.shields.io/badge/later-lightgrey
