# Session brief

![read](https://img.shields.io/badge/read-first_every_session-red)
![branch](https://img.shields.io/badge/branch-backend-blue)
![phase](https://img.shields.io/badge/phase-2B_strategy_next-orange)
![decisions in force](https://img.shields.io/badge/decisions_in_force-15-blue)
![updated](https://img.shields.io/badge/updated-2026--09--22-lightgrey)

*The short brief that gets an agent or a new session up to speed. Load it before anything else.*

<a id="contents"></a>

## Contents

- [1. What the product is](#1-what-the-product-is)
- [2. Decisions in force](#2-decisions-in-force)
- [3. How to work here](#3-how-to-work-here)
- [4. Where things are](#4-where-things-are)
- [5. Current state](#5-current-state)
- [6. Before you start](#6-before-you-start)
- [Related](#related)

<a id="1-what-the-product-is"></a>

## 1. What the product is

Working name **Cadence**: a social-media agent for small businesses, built by The Scale Agency.
The agency owner is the **admin**; a **client** is a business owner who buys the service; a
**brand** is one website plus the social accounts managed for it, and a client can own any
number of brands.

The loop: paste a URL → brand scan → proposed brand kit the owner edits → strategy (pillars,
cadence, best times) → posts → human approval → publish → analytics → learnings → better
strategy. Nine specialist agents and six workflows do the thinking
(`apps/api/src/mastra/README.md`); scheduling, publishing and metrics are plain code.

> [!IMPORTANT]
> The owner's bar: "masters of their field, no compromise on results".

<a id="2-decisions-in-force"></a>

## 2. Decisions in force

Fifteen rulings every session inherits. Reopen one only on evidence, and record it in the plan.

| Decision                                                                                                                | Since              | Why it stands                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Firecrawl reads every website**                                                                                       | ![2026-09-22][d22] | It renders JS-only sites and removed ~400 lines of our hardest code; reverses the 2026-09-20 "own fetch" decision |
| **Code owns every verifiable fact**                                                                                     | ![2026-09-20][d20] | Phone, email, address, hours, colours, fonts; the model's schema has no field for them, so it cannot invent one   |
| **One LLM call per scan**, retried once and only on a bad model answer                                                  | ![2026-09-21][d21] | Predictable cost and latency                                                                                      |
| **No automated test suite**, removed on purpose                                                                         | ![2026-09-20][d20] | Verification is a real run with its output recorded in the task                                                   |
| **Only the owner commits**                                                                                              | ![2026-09-20][d20] | They stage in their editor while agents work; no agent touches the git index                                      |
| **Clean code is plain small named functions**, one level of abstraction, no nested ternaries, comments only for the why | ![2026-09-22][d22] | Explicitly not a class restructuring of `src/scan`                                                                |
| **Shared skills live at the repo root** `.agents/skills`                                                                | ![2026-09-22][d22] | `npx skills add` only from the root, or a shared skill lands in one app                                           |
| **"Brand" not "client" for a workspace**                                                                                | ![2026-09-20][d20] | A client is a person (`users.role`), a brand is a website workspace                                               |
| **Multiple brands per client, no limit**                                                                                | ![2026-09-20][d20] | No cap in the database or the service                                                                             |
| **A draft strategy auto-activates 15 minutes after it is drafted**                                                      | ![2026-09-20][d20] | `approved_by` stays null, which is how automatic is told from human                                               |
| **A post is never published without a human approval**                                                                  | ![2026-09-20][d20] | The one hard rule of the product                                                                                  |
| **Billing comes later and stays provider-agnostic**                                                                     | ![2026-09-20][d20] | Razorpay, Stripe, Polar; not Clerk Billing; no tables yet                                                         |
| **Scan step ids are the workflow's**: `discover \| read-pages \| interpret \| report`                                   | ![2026-09-22][d22] | One source of truth in `scanStepIdSchema`                                                                         |
| **In-process FIFO scan queue, one at a time**                                                                           | ![2026-09-22][d22] | The free Firecrawl key allows 10 requests a minute; a Postgres queue only if we run more than one API process     |
| **One active scan per user**                                                                                            | ![2026-09-22][d22] | A second `POST /scans` returns the running one with 200, which is also our only rate limit                        |

<a id="3-how-to-work-here"></a>

## 3. How to work here

> [!CAUTION]
> Never commit, stage, push, or touch the git index. The owner does that.

1. Load the `caveman` skill first and reply in that style all session. Then load the skills
   that match the work (root [`AGENTS.md`](../AGENTS.md) lists them) and run the
   `code-simplifier` agent over changed code before reporting done. Installed skills and
   plugins are there to be used, every session, by every agent.
2. Read the app's `AGENTS.md` before touching that app; the repo-root [`AGENTS.md`](../AGENTS.md)
   says where everything is.
3. Load the `mastra` skill and read `node_modules/@mastra/core/dist/docs` before any Mastra API.
   Never trust memory.
4. No tests. Finish every task with a real run and record the output against what the task
   expected.
5. API layering is strict: Route → Controller → Service → Repository, static classes; only
   repositories import Drizzle, only `src/auth/clerk.ts` imports Clerk.
6. Only `src/scan/firecrawl.ts` may send a user-typed address anywhere, and it vets the address
   first.
7. Every endpoint change updates `docs/API_SPEC.md` in the same change (the OpenAPI registry
   on `feature/openapi` replaces this once merged).
8. Long work is split across parallel agents by file ownership, with time estimates up front and
   rulings written to the ledger.

Fuller rules live in [`AGENTS.md`](../AGENTS.md) and [`apps/api/AGENTS.md`](../apps/api/AGENTS.md).

<a id="4-where-things-are"></a>

## 4. Where things are

| Thing                              | Where                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Specs and plans**                | `docs/superpowers/specs/` and `docs/superpowers/plans/`, versioned since 2026-09-22                                                |
| **Ledgers**                        | `.superpowers/sdd/<date>-<name>/progress.md` holds progress, briefs, reports and reviews                                           |
| **Shared skills**                  | `.agents/skills/<name>`, linked from `.claude/skills`, recorded in `skills-lock.json`                                              |
| **API reference**                  | `docs/API_SPEC.md` (hand-maintained until OpenAPI merges); `scripts/dev-token.ts` mints a Clerk token for trying endpoints |
| **Apps**                           | `apps/web` (product), `apps/landing` (marketing), `apps/api` (Express + Mastra)                                                    |
| **Packages**                       | `packages/ui`, `packages/db`, `packages/shared`, `packages/social-connect` (network OAuth providers, since 2026-09-23), `packages/config/*` |
| **The agent team and build order** | `apps/api/src/mastra/README.md`                                                                                                    |
| **Design system**                  | [`DESIGN.md`](./DESIGN.md)                                                                                                         |
| **Scan test sites**                | fourbarrelcoffee.com, meowmeowtweet.com, donangie.com, tartinebakery.com, with expected values in the `brand-scan-firecrawl` skill |

<a id="5-current-state"></a>

## 5. Current state

As of 2026-09-22. Phase 1 foundation ![100%][pr100] and phase 2A brand scan ![100%][pr100] are
complete; phase 2B strategy ![0%][pr0] has not started.

| What               | Where it stands                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Branch**         | `backend`. Last commit `e019e6c "done scan"` carries phase 1 foundation, brands and admin endpoints, the brand scan on Firecrawl, and the scan clean-up pass                                                                                                  |
| **Uncommitted**    | The scan endpoints (`scans.controller.ts`, `scans.repository.ts`, `scans.route.ts`, `scans.service.ts`, `src/scan-queue/`), the edits to `v1.route.ts`, `server.ts`, `brands.service.ts`, `scan/types.ts` and the two shared schemas, and the eight root docs |
| **Phase 2A**       | Built and verified: all five tasks done and reviewed, 8 of 8 live HTTP checks passed, 15 routes live. Nothing is committed, because the owner commits. Ledger: `.superpowers/sdd/2026-09-22-scan-endpoints/progress.md`           |
| **Live endpoints** | `/health`, `/me`, `/me/overview`, `/brands` (5), `/admin/clients*` (4), `/scans` (2). Planned total is 39                                                                                                                                                     |
| **`apps/web`**     | Restructured 2026-09-22 onto server components: `app/` route files, `features/<area>/` pieces, reads in `lib/api/server.ts`, Server Actions in `lib/api/actions.ts`, mock on the server. Still on the mock seam; it comes off for onboarding in phase 2B and for the rest in phase 3. Cache Components on since 2026-09-24: build passes, every route `◐`, all 13 pages and layouts carry `instant = false` with a `// TODO: Cache Components adoption` comment; adopt route by route with `next-cache-components-adoption`, root layout first. Spec `docs/superpowers/specs/2026-09-22-web-server-components.md` |
| **Next**           | The Strategist agent spec (2B-1), then the strategy endpoints                                                                                                                                                                                                 |
| **Docs**           | `CLAUDE.md` now auto-loads this file, since 2026-09-22; Postman was removed in favour of OpenAPI + Scalar (branch `feature/openapi`, not merged)                                                                                                                                            |

<a id="6-before-you-start"></a>

## 6. Before you start

- [ ] Load the `caveman` skill, then the skills for the work (root `AGENTS.md`, "Agent skills").
- [ ] Read the root `AGENTS.md` and the `AGENTS.md` of the app you are touching.
- [ ] Load the `mastra` skill if any Mastra file is in scope.
- [ ] Run `git status` to see what the owner already has in flight, and leave it alone.
- [ ] Run `pnpm --filter api run check-types`, rebuilding `packages/shared` or `packages/db`
      first if you changed them.
- [ ] Open the ledger for the plan you are joining before writing any code.

<a id="related"></a>

## Related

- [PRD.md](./PRD.md) sets out what the product must do.
- [ARCHITECTURE.md](./ARCHITECTURE.md) describes how the system is built.
- [API_SPEC.md](./API_SPEC.md) is the HTTP contract.
- [SECURITY.md](./SECURITY.md) holds the threat model and the controls.
- [DESIGN.md](./DESIGN.md) is the design system.
- [TASKS.md](./TASKS.md) is the board.
- [LESSION.md](./LESSION.md) collects the lessons learned.

<!-- Decision dates, and progress as an uptime-style bar: green bars for the done share, grey for the rest. -->

[d20]: https://img.shields.io/badge/2026--09--20-lightgrey?style=flat-square
[d21]: https://img.shields.io/badge/2026--09--21-lightgrey?style=flat-square
[d22]: https://img.shields.io/badge/2026--09--22-lightgrey?style=flat-square
[pr0]: https://img.shields.io/badge/%20-%7C%7C%7C%7C%7C%7C%7C%7C%7C%7C%200%25-lightgrey?style=flat-square&labelColor=lightgrey
[pr100]: https://img.shields.io/badge/%7C%7C%7C%7C%7C%7C%7C%7C%7C%7C-100%25-brightgreen?style=flat-square&labelColor=brightgreen
