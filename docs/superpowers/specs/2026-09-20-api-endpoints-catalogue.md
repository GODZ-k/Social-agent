# API endpoints catalogue

Date: 2026-09-20. Status: proposal, waiting for review.

This file answers one question: **how many API endpoints does the product need, and what goes in and comes out of each one?**

It is built from the database design (`2026-09-20-database-schema-design.md`), the phase 1 plan (`../plans/2026-09-20-brands-rename-and-admin.md`), the real tables (`packages/db/src/schema.ts`), the zod shapes (`packages/shared/src/schema`), and the web app's mock API (`apps/web/lib/api/client.ts`).

Words: a **client** is a person (a business owner). A **brand** is one website plus its social accounts. An **admin** is the agency owner.

---

## 1. Summary

**The product needs 39 endpoints.**

| Group | Endpoints | Phase |
|---|---|---|
| Health | 1 | 1 |
| Me | 2 | 1 |
| Brands | 5 | 1 |
| Admin | 4 | 1 |
| Onboarding and brand scans | 2 | 2 |
| Strategy | 5 | 2 |
| Posts | 10 | 3 |
| Chat | 3 | 4 |
| Social accounts | 4 | 5 |
| Publishing | 1 | 5 |
| Analytics | 2 | 5 |
| Webhooks / internal | 0 (up to 3 later, see section 14) | 5 |
| **Total** | **39** | |

| Phase | What | Endpoints | State |
|---|---|---|---|
| 1 | Foundation | 12 | `GET /health`, `GET /me`, `GET /me/overview` exist today. Brand endpoints exist under the old name `/clients` and are being renamed now. The 4 admin endpoints are being built now. |
| 2 | Scan and strategy | 7 | Not started |
| 3 | Posts | 10 | Not started |
| 4 | Chat | 3 | Not started |
| 5 | Accounts, publishing, analytics | 7 | Not started |

Notes on the count:

- `GET /health/test-error` exists in the code. It is a developer tool, so it is not counted. Remove it before production.
- Three more endpoints may be needed later. They depend on open questions 6 and 7 (section 16). They are not counted.
- Much work has **no endpoint** on purpose: publishing due posts, fetching metrics, refreshing tokens, writing learnings. These are background jobs. Section 12 and 14 explain.

---

## 2. Conventions

### Base path and auth

- Base path: `/api/v1`. Only `GET /health` is outside it.
- Every `/api/v1` request needs a signed-in user. The web app sends the Clerk session token: `Authorization: Bearer <token>`.
- One exception: the OAuth callback (section 11). The browser arrives there from Instagram/LinkedIn/etc., so it cannot carry our token. It is protected by a signed `state` value instead.
- `/api/v1/admin/*` also needs `role = "admin"`. Others get 403 `FORBIDDEN`.

### Who may call what

- A **client** reaches only brands where `owner_id` is their user id.
- An **admin** reaches every brand, and can do every brand action on the owner's behalf (approve posts, connect accounts, and so on).
- This rule applies to **everything nested under a brand**. The service first loads the brand with the caller's scope. If that fails, the answer is 404 `BRAND_NOT_FOUND`.
- "Missing", "archived" and "not yours" all answer **404**, never 403. So nobody can test which ids exist.

### Success envelope

Every success answer is:

```json
{ "success": true, "data": { } }
```

Lists with pages add `meta`:

```json
{ "success": true, "data": [ ], "meta": { "nextCursor": "b3f1..." } }
```

`DELETE` answers `204` with no body.

### Error envelope

Quoted from `apps/api/src/middlewares/error.middleware.ts`:

```ts
return res.status(err.statusCode).json({
    success: false,
    error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
    }
})
```

Example of a validation error (from `validate.middleware.ts`; `details` is a list of `{ path, message }`):

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields are invalid.",
    "details": [ { "path": "email", "message": "Invalid email address" } ]
  }
}
```

Error codes used everywhere (not repeated in each endpoint below):

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body or query does not match the zod schema |
| 400 | `INVALID_JSON` | Body is not valid JSON |
| 401 | `UNAUTHENTICATED` | No token, or a bad token |
| 403 | `FORBIDDEN` | Admin-only endpoint, caller is not admin |
| 404 | `BRAND_NOT_FOUND` | Brand missing, archived, or not yours |
| 409 | `EMAIL_IN_USE` | First sign-in, but the email belongs to another row |
| 500 | `INTERNAL_SERVER_ERROR` | Anything unexpected. Details stay in the server log |

New codes proposed in this file: `SCAN_NOT_FOUND`, `SCAN_NOT_DONE`, `STRATEGY_NOT_FOUND`, `STRATEGY_NOT_DRAFT`, `STRATEGY_DRAFT_EXISTS`, `NO_ACTIVE_STRATEGY`, `POST_NOT_FOUND`, `INVALID_POST_STATE`, `MEDIA_NOT_FOUND`, `MEDIA_TOO_LARGE`, `UNSUPPORTED_MEDIA`, `ACCOUNT_NOT_FOUND`, `ACCOUNT_NOT_CONNECTED`, `PLATFORM_NOT_AVAILABLE`, `THREAD_NOT_FOUND`, `AGENT_FAILED`.

### Ids and timestamps

- Ids are UUID strings. A malformed id answers 404 (same as "missing"), not 400. This is what `isUuid` does in phase 1.
- Timestamps are ISO 8601 strings in UTC, for example `"2026-09-22T12:30:00.000Z"`. The web app shows them in the brand's timezone (`preferences.timezone`).
- Dates without a time (analytics) are `"YYYY-MM-DD"`.
- Best times in a strategy are local to the brand: `{ "day": "tue", "time": "18:00" }`.

### Pagination

Keep it simple. Only two lists need pages:

| List | Pagination |
|---|---|
| `GET /brands/:brandId/posts` | `?limit=` (default 100, max 200) and `?cursor=`. Answer has `meta.nextCursor`, or `null` at the end. |
| `GET /brands/:brandId/chat/threads/:threadId/messages` | Same `limit` + `cursor`, newest first. |

All other lists are small and return everything: brands, admin clients, strategy versions, social accounts, threads. Add `limit`/`cursor` to them later if they grow; it does not break callers.

### Long agent work

Three endpoints make the agent think for a long time: generate a strategy, generate posts, and scan a website.

- The **scan** has its own table with `status` and `current_step`. So it answers at once with `202` and the web app polls it.
- **Generate strategy** and **generate posts** are proposed as **one long request** (10 to 60 seconds) that answers with the finished result. This matches the mock functions today (`regenerateStrategy` returns a `Strategy`, `generatePosts` returns `Post[]`), so the web app does not change. The other choice is open question 2.
- If the agent fails, the answer is 502 `AGENT_FAILED`. Nothing half-made is saved.

---

## 3. Health (1)

### `GET /health`

Purpose: is the API up, and can it reach the database. Who: anyone, no token. Phase 1, exists.

Input: none.

Output `200` (or `503` with `success: false` when the database is down):

```json
{ "success": true, "data": { "status": "healthy", "database": "up", "timestamp": "2026-09-20T10:00:00.000Z" } }
```

---

## 4. Me (2)

### `GET /api/v1/me`

Purpose: the signed-in person. Who: any signed-in user. Phase 1, exists.

Input: none. The first call ever also creates the `users` row, or links an invited row by verified email.

Output `200`, shape **`Me`**:

```json
{
  "id": "0b6f6a0e-4c1e-4d0a-9a53-1f2d3c4b5a69",
  "email": "asha@example.com",
  "name": "Asha Rao",
  "imageUrl": "https://img.clerk.com/abc",
  "role": "client",
  "createdAt": "2026-09-01T08:00:00.000Z"
}
```

Errors: 401 `UNAUTHENTICATED`, 409 `EMAIL_IN_USE`.

### `GET /api/v1/me/overview`

Purpose: everything the first screen needs in one request. Who: any signed-in user. Phase 1, exists (being changed from `clients` to `brands`).

Input: none.

Output `200`:

```json
{
  "user": { "...": "a Me" },
  "brands": [ { "...": "a Brand, see section 5" } ],
  "counts": { "brands": 2 }
}
```

`brands` holds only brands **this person owns**, even for an admin. An empty list means "not onboarded yet": the web app sends them to `/onboarding`.

---

## 5. Brands (5)

All phase 1. Decided in the phase 1 plan; listed here, not redesigned.

Shape **`Brand`**:

```json
{
  "id": "7d1c1d2e-8f7a-4a3b-9c11-2b8f0e6a1c55",
  "ownerId": "0b6f6a0e-4c1e-4d0a-9a53-1f2d3c4b5a69",
  "createdBy": "0b6f6a0e-4c1e-4d0a-9a53-1f2d3c4b5a69",
  "name": "Kiln Coffee",
  "url": "https://kilncoffee.in",
  "industry": "Cafe",
  "accent": "#3B2F2F",
  "stage": "approval",
  "brand": {
    "tagline": "Slow coffee, fast mornings",
    "summary": "A small-batch roaster in Pune.",
    "audience": "Locals, 25-45, who find cafes on Instagram",
    "voice": ["warm", "direct"],
    "colors": [ { "name": "Primary", "hex": "#3B2F2F" } ],
    "fonts": { "heading": "Poppins", "body": "Inter" },
    "aesthetic": "minimal, earthy",
    "keywords": ["single origin", "pour over"]
  },
  "business": {
    "phone": "+91 20 5550 1234",
    "email": "hello@kilncoffee.in",
    "location": { "city": "Pune", "country": "IN" },
    "hours": [ { "day": "mon", "open": "08:00", "close": "20:00" } ]
  },
  "platforms": ["instagram", "linkedin"],
  "accounts": [ { "platform": "instagram", "handle": "@kilncoffee", "status": "connected", "connectedAt": "2026-09-10T09:00:00.000Z" } ],
  "preferences": { "timezone": "Asia/Kolkata", "approvalEmails": true },
  "createdAt": "2026-09-05T08:00:00.000Z",
  "stats": { "followers": 4210, "followersDelta": 120, "engagementRate": 4.6, "engagementDelta": 0.4, "scheduled": 7, "pendingApprovals": 3 }
}
```

- `brand.aesthetic`, `brand.keywords` and every field in `business` are optional.
- `accounts` is `[]` and `stats` is all zeros until phase 3 (`scheduled`, `pendingApprovals`) and phase 5 (the rest). The shape does not change.
- `stage` is never set by a caller. The API moves it when things happen (brand created → `strategy`, strategy active → `content`, posts in review → `approval`, and so on).
- Account tokens are never in this shape.

### `GET /api/v1/brands`

Purpose: list brands the caller can reach, newest first. Who: client (own brands), admin (all brands).

Input: none. Output `200`: `Brand[]`. Archived brands are never listed.

### `POST /api/v1/brands`

Purpose: create a brand owned by the caller. Last step of onboarding. Who: any signed-in user.

Body, shape **`NewBrandInput`**:

```json
{
  "name": "Kiln Coffee",            // required
  "url": "kilncoffee.in",           // required; "https://" is added if missing
  "industry": "Cafe",               // required (may be "")
  "brand": { "...": "BrandKit" },   // required
  "platforms": ["instagram"],       // required (may be [])
  "business": { "...": "BusinessInfo" }, // optional
  "scanId": "c2a9..."               // optional, ADDED IN PHASE 2: the scan this brand came from
}
```

Output `201`: the new `Brand`. `accent` is the first brand colour. `createdBy` equals `ownerId`.

Phase 2 addition: when `scanId` is given, the API sets `brand_scans.brand_id` on that scan. The scan must be requested by the caller (or the caller is admin), else 404 `SCAN_NOT_FOUND`; if it has not finished yet, 409 `SCAN_NOT_DONE`.

### `GET /api/v1/brands/:id`

Purpose: one brand. Who: owner or admin. Output `200`: `Brand`. Errors: 404 `BRAND_NOT_FOUND`.

### `PATCH /api/v1/brands/:id`

Purpose: Settings screen. Change the brand kit, planned platforms, business info, preferences. Who: owner or admin.

Body, shape **`BrandPatch`** (all optional; unknown keys are dropped):

```json
{
  "name": "Kiln Coffee Roasters",
  "industry": "Cafe",
  "brand": { "...": "full BrandKit" },
  "business": { "...": "full BusinessInfo" },
  "platforms": ["instagram", "linkedin"],
  "preferences": { "timezone": "Asia/Kolkata", "approvalEmails": false }
}
```

Output `200`: the updated `Brand`. Errors: 404 `BRAND_NOT_FOUND`.

### `DELETE /api/v1/brands/:id`

Purpose: archive the brand (sets `archived_at`). Nothing is really deleted. Who: owner or admin.

Output `204`, no body. Errors: 404 `BRAND_NOT_FOUND` (also when already archived).

---

## 6. Admin (4)

All phase 1, all behind `requireAdmin`. "Clients" here are people. Decided in the phase 1 plan.

Shape **`AdminClient`**:

```json
{
  "id": "5e0d...", "email": "new.person@example.com", "name": "New Person",
  "imageUrl": null, "phone": "+91 98000 00000",
  "status": "invited", "brandCount": 0, "createdAt": "2026-09-20T10:00:00.000Z"
}
```

`status` is `invited` until the first sign-in, then `active`. `brandCount` ignores archived brands.

### `GET /api/v1/admin/clients`

Purpose: every client, newest first. Admins are not listed. Output `200`: `AdminClient[]`. Errors: 403 `FORBIDDEN`.

### `POST /api/v1/admin/clients`

Purpose: invite a client before they have an account. Creates an `invited` user row and makes Clerk send the email.

Body:

```json
{ "email": "New.Person@Example.com", "name": "New Person", "phone": "+91 98000 00000" }
```

`email` required (stored lowercase). `name`, `phone` optional.

Output `201`: `AdminClient`. Errors: 409 `CLIENT_EXISTS` (email already known), 502 `INVITE_FAILED` (Clerk could not send; the row is removed again).

### `GET /api/v1/admin/clients/:id`

Purpose: one client and their brands.

Output `200`:

```json
{ "client": { "...": "AdminClient" }, "brands": [ { "...": "Brand" } ] }
```

Errors: 404 `CLIENT_NOT_FOUND`.

### `POST /api/v1/admin/clients/:id/brands`

Purpose: the admin sets up a brand for a client. The client is `ownerId`; the admin is `createdBy`.

Body: `NewBrandInput` (same as `POST /brands`, including `scanId` from phase 2). Output `201`: `Brand`. Errors: 404 `CLIENT_NOT_FOUND`.

For all other brand work the admin uses the normal `/brands/...` endpoints. No admin copies are needed, because the ownership rule already lets an admin reach every brand.

---

## 7. Onboarding and brand scans (2)

Phase 2. Onboarding order: enter URL → scan → review the proposed brand kit → create the brand.

**Exception to "nest under the brand":** the scan runs **before** the brand exists (`brand_scans.brand_id` is null). So scans live at `/api/v1/scans`. A scan is reachable by the user who requested it, and by admins.

Shape **`Scan`**:

```json
{
  "id": "c2a9d0e1-...",
  "brandId": null,
  "url": "https://kilncoffee.in",
  "status": "running",
  "currentStep": "read-pages",
  "pages": [ { "url": "https://kilncoffee.in/about", "title": "About us" } ],
  "result": null,
  "error": null,
  "startedAt": "2026-09-20T10:00:02.000Z",
  "finishedAt": null,
  "createdAt": "2026-09-20T10:00:00.000Z"
}
```

- `status`: `queued`, `running`, `done`, `failed`.
- `currentStep`: the workflow's real step ids, in order: `discover`, `read-pages`, `interpret`, `report` (`SCAN_STEP_IDS` in `apps/api/src/scan/types.ts`). Null before the start and after the end. Colours and fonts arrive with `discover` (the home page), so there is no separate "visual" step.
- `result` is set when `status = "done"`. It is a **`ScanResult`**: `{ name?, industry?, brand: BrandKit, business?: BusinessInfo }`.
- `error` is a plain sentence when `status = "failed"`.

### `POST /api/v1/scans`

Purpose: start a website scan. Who: any signed-in user (an admin does this for a client too).

Body:

```json
{ "url": "kilncoffee.in" }   // required; same URL rule as NewBrandInput.url
```

Execution: an in-process queue owned by the API runs one scan at a time. **One active scan per user**: if the caller already has a scan `queued` or `running`, this returns that same scan with `200` instead of starting a second one (stops double-clicks and reloads from spending Firecrawl credits). Otherwise it inserts the row and answers `202` with `status: "queued"`.

If the API restarts while a scan is `queued` or `running`, that row is marked `failed` with `error: "The scan was interrupted. Please try again."` on the next start-up, so a scan never stays stuck.

Output `202` (new scan) or `200` (an active scan already existed): `Scan`.

Errors: 400 `VALIDATION_ERROR` (not a website address).

### `GET /api/v1/scans/:scanId`

Purpose: poll the scan. The web app calls this every 1 to 2 seconds until `status` is `done` or `failed`. Who: the requester, or admin.

Output `200`: `Scan`. When done:

```json
{
  "id": "c2a9d0e1-...", "status": "done", "currentStep": null,
  "result": {
    "name": "Kiln Coffee", "industry": "Cafe",
    "brand": { "...": "BrandKit" },
    "business": { "phone": "+91 20 5550 1234", "location": { "city": "Pune" } }
  }
}
```

When failed, `error` is one of the scan's own plain-language messages (for example `"We can only read public websites. Check the address and try again."`), or, for anything unexpected, `"Something went wrong on our side. Please try again."`.

Errors: 404 `SCAN_NOT_FOUND`.

**No third endpoint.** The person edits the proposed kit in the browser. Then the web app calls `POST /brands` (or the admin version) with the edited kit and `scanId`. That links the scan to the brand. The scan must be `done` and reachable by the caller (requester, or admin), else 409 `SCAN_NOT_DONE` or 404 `SCAN_NOT_FOUND`.

Left out: re-scanning an existing brand. The table supports it, but no screen asks for it. When wanted, add `POST /brands/:brandId/scans` and keep `GET /scans/:scanId` for polling.

---

## 8. Strategy (5)

Phase 2. A strategy has versions. A version is never edited. To change the strategy, the agent writes a new version.

Pillars and learnings have **no endpoints of their own**. Pillars are part of a strategy version. Learnings are written by the agent (phase 5) and are returned inside the current strategy, as the web app expects today.

Shape **`Strategy`**:

```json
{
  "id": "9a7b...",
  "brandId": "7d1c1d2e-...",
  "version": 3,
  "status": "active",
  "goal": "Turn cafe visitors into followers, and followers into regulars.",
  "pillars": [
    { "id": "p1...", "key": "behind-the-scenes", "name": "Behind the scenes",
      "description": "Roasting days, staff, the machine.", "share": 40, "position": 0 }
  ],
  "cadence": [
    { "platform": "instagram", "perWeek": 5,
      "bestTimes": [ { "day": "tue", "time": "18:00" }, { "day": "sat", "time": "08:30" } ] }
  ],
  "audience": [ { "segment": "Remote workers", "note": "Come on weekday mornings" } ],
  "changeNote": "Moved weekend product posts to weekdays: they got half the reach.",
  "learnings": [
    { "id": "l1...", "insight": "Short reels finish twice as often", "evidence": "62% vs 31% completion, 14 reels",
      "impact": "up", "applied": true, "createdAt": "2026-09-15T06:00:00.000Z" }
  ],
  "approvedBy": "0b6f6a0e-...",
  "approvedAt": "2026-09-16T09:00:00.000Z",
  "createdAt": "2026-09-16T08:55:00.000Z"
}
```

- `pillars[].share` adds up to 100.
- `learnings`: all learnings of the **brand**, newest first, at most 20. `applied` is true when a strategy version already used it (`applied_strategy_id` is set).
- Changes for the web app: `cadence[].bestTimes` becomes `{ day, time }` (was `string[]`); `clientId` becomes `brandId`; `generatedAt` becomes `createdAt`.

Shape **`StrategySummary`** (for the versions list): `{ id, version, status, goal, changeNote, approvedAt, createdAt }`.

### `GET /api/v1/brands/:brandId/strategy`

Purpose: the current strategy. Used by the Strategy, Content, Approvals and Analytics screens. Who: owner or admin.

Rule: returns the `active` version. If there is none yet, returns the newest `draft`.

Output `200`: `Strategy`. Errors: 404 `STRATEGY_NOT_FOUND` (nothing generated yet; the screen shows a "Generate strategy" button).

### `GET /api/v1/brands/:brandId/strategies`

Purpose: version history, newest first. Shows what changed and why (`changeNote`). Who: owner or admin.

Output `200`: `StrategySummary[]`.

### `GET /api/v1/brands/:brandId/strategies/:strategyId`

Purpose: one full version. Needed to read a draft that waits for approval, or the old version a post came from. Who: owner or admin.

Output `200`: `Strategy` (here `learnings` holds only the learnings that this version applied). Errors: 404 `STRATEGY_NOT_FOUND`.

### `POST /api/v1/brands/:brandId/strategies`

Purpose: ask the agent to write the next version. Version 1 when none exists (called by the web app right after the brand is created). Later: the "AI learns → new strategy" button. Who: owner or admin.

Body (all optional):

```json
{
  "instructions": "Post less on LinkedIn, more reels.",   // optional, a note from the person to the agent
  "replaceDraft": false                                   // optional; true throws away a waiting draft first
}
```

What happens: the agent reads the brand kit, the previous version, the learnings not applied yet, and audience insights if any. It saves a new version with `status: "draft"` and fresh pillar rows, and marks the learnings it used. If strategy approval is **not** required (open question 1), it activates the version in the same step.

Output `201`: the new `Strategy`. This is a long request (section 2, "Long agent work").

Errors: 502 `AGENT_FAILED`; 409 `STRATEGY_DRAFT_EXISTS` when a draft already waits (approve it first, or send `"replaceDraft": true` in the body to throw the old draft away).

### `POST /api/v1/brands/:brandId/strategies/:strategyId/activate`

Purpose: approve a draft. It becomes `active`; the previous active version becomes `superseded`, in one transaction. Sets `approvedBy` and `approvedAt`. Who: owner or admin.

Input: no body.

Output `200`: the `Strategy`, now `active`. Errors: 404 `STRATEGY_NOT_FOUND`, 409 `STRATEGY_NOT_DRAFT`.

Decided 2026-09-20: this endpoint stays. The owner (or the admin for them) has 15 minutes to approve a new version. If nobody does, a background job activates it and the agent continues. The `Strategy` output carries `approvalDeadline` (`createdAt` + 15 minutes) while it is a `draft`, so the screen can show a countdown. Calling this endpoint after the job already activated the version answers 409 `STRATEGY_NOT_DRAFT`.

---

## 9. Posts (10)

Phase 3. One post is one post on one platform.

Shape **`Post`**:

```json
{
  "id": "e41f...",
  "brandId": "7d1c1d2e-...",
  "strategyId": "9a7b...",
  "pillarId": "p1...",
  "createdBy": null,
  "platform": "instagram",
  "format": "reel",
  "hook": "How we roast on Mondays",
  "caption": "Every Monday at 6am the roaster goes on...",
  "hashtags": ["#punecoffee", "#smallbatch"],
  "aiNote": "Fits 'Behind the scenes' (40% of the mix) and fills the empty Tuesday slot.",
  "art": { "variant": 2, "colorIndex": 0 },
  "status": "in_review",
  "scheduledFor": "2026-09-22T12:30:00.000Z",
  "publishedAt": null,
  "reviewedBy": null,
  "reviewedAt": null,
  "rejectionReason": null,
  "externalUrl": null,
  "publishError": null,
  "mediaUrl": null,
  "durationSec": null,
  "metrics": null,
  "createdAt": "2026-09-20T10:00:00.000Z",
  "updatedAt": "2026-09-20T10:00:00.000Z"
}
```

- `createdBy: null` means the agent made it.
- `mediaUrl` and `durationSec` come from the first `post_media` row. While `mediaUrl` is null the UI draws artwork from `art`.
- `metrics` is the **latest** `post_metrics` row, or null: `{ reach, likes, comments, saves, shares, views, capturedAt }`. `views` may be null. Filled in phase 5.
- The single-post endpoint adds `media: PostMedia[]` (all files, in order).

Shape **`PostMedia`**: `{ id, type: "image"|"video", url, position, source: "uploaded"|"generated", width, height, durationSec, altText, createdAt }`. `storage_key` is never sent.

Status rules (the server enforces them; a wrong move answers 409 `INVALID_POST_STATE`):

| From | Action | To |
|---|---|---|
| (agent) | generate | `in_review` |
| `in_review` | approve, post has `scheduledFor` | `scheduled` |
| `in_review` | approve, no `scheduledFor` | `approved` |
| `in_review` | reject | `rejected` |
| `in_review` | request changes | `draft` (agent rewrites) → `in_review` |
| `approved` | PATCH sets `scheduledFor` | `scheduled` |
| `scheduled` | PATCH clears `scheduledFor` | `approved` |
| `approved`, `scheduled`, `rejected` | reopen (undo) | `in_review` |
| `scheduled` | publisher job, or publish now | `published` |

A `published` post cannot be changed.

Callers never set `status` directly. The mock does (`updatePost(id, { status })`); the real API uses the action endpoints below, so each action can check its own rules and record who did it.

### `GET /api/v1/brands/:brandId/posts`

Purpose: the brand's posts. Feeds the Content table, the Calendar, the Approvals queue and "top posts" in Analytics. Who: owner or admin.

Query (all optional):

| Param | Example | Meaning |
|---|---|---|
| `status` | `in_review` or `scheduled,published` | One or more statuses |
| `platform` | `instagram` | One platform |
| `from`, `to` | `2026-09-01`, `2026-09-30` | Range over `scheduledFor` (or `publishedAt` for published posts). For the calendar month |
| `sort` | `scheduledFor` (default), `-createdAt`, `-reach` | `-reach` is for "top posts" (phase 5) |
| `limit`, `cursor` | `100` | See pagination |

Output `200`: `Post[]` plus `meta.nextCursor`.

### `POST /api/v1/brands/:brandId/posts/generate`

Purpose: ask the agent to draft posts from the active strategy. They arrive as `in_review`, each with a proposed `scheduledFor` taken from the cadence. Who: owner or admin.

Body:

```json
{ "count": 6 }   // required, 1 to 20
```

Output `201`: `Post[]` (the new posts). Long request.

Errors: 409 `NO_ACTIVE_STRATEGY` ("Generate a strategy before creating content."), 502 `AGENT_FAILED`.

### `GET /api/v1/brands/:brandId/posts/:postId`

Purpose: one post with all its media. For the post sheet, and for a link in an approval email. Who: owner or admin.

Output `200`: `Post` plus `media: PostMedia[]`. Errors: 404 `POST_NOT_FOUND`.

### `PATCH /api/v1/brands/:brandId/posts/:postId`

Purpose: edit the text, or move the post to another time (calendar drag, post sheet). Who: owner or admin.

Body (all optional):

```json
{
  "hook": "How we roast on Mondays",
  "caption": "New caption...",
  "hashtags": ["#punecoffee"],
  "scheduledFor": "2026-09-23T03:30:00.000Z"   // or null to take it off the schedule
}
```

Output `200`: the updated `Post`. `scheduledFor` must be in the future.

Errors: 404 `POST_NOT_FOUND`, 409 `INVALID_POST_STATE` (the post is published).

There is no separate "schedule" endpoint. Scheduling is: approve a post that has a time, or set a time on an approved post.

### `POST /api/v1/brands/:brandId/posts/:postId/approve`

Purpose: approve a post in review. Sets `reviewedBy`, `reviewedAt`. Who: owner, or admin on their behalf.

Body (optional):

```json
{ "scheduledFor": "2026-09-23T03:30:00.000Z" }   // optional; overrides the proposed time
```

Output `200`: `Post` with status `scheduled` (has a time) or `approved` (no time).

Errors: 409 `INVALID_POST_STATE` (not `in_review`).

### `POST /api/v1/brands/:brandId/posts/:postId/reject`

Purpose: throw this post away. The reason is kept for the agent, so the next batch avoids the same mistake. Who: owner or admin.

Body:

```json
{ "reason": "We never discount. Remove the offer." }   // required, 1 to 500 characters
```

Output `200`: `Post` with `status: "rejected"` and `rejectionReason` set. Errors: 409 `INVALID_POST_STATE`.

### `POST /api/v1/brands/:brandId/posts/:postId/request-changes`

Purpose: keep the post, but ask the agent to rewrite it. Who: owner or admin.

Body:

```json
{ "reason": "Good idea, but make it shorter and less salesy." }   // required
```

What happens: the API stores the reason in `rejectionReason`, sets `status: "draft"`, and answers at once. The agent rewrites the same row in the background and sets it back to `in_review` (and clears `rejectionReason`). The web app sees it again on the next refresh of the Approvals queue.

Output `200`: `Post` with `status: "draft"`. Errors: 409 `INVALID_POST_STATE`.

### `POST /api/v1/brands/:brandId/posts/:postId/reopen`

Purpose: undo a decision. The Approvals screen has an "Undo" button after a swipe. Who: owner or admin.

Input: no body. Allowed from `approved`, `scheduled`, `rejected`. Clears `reviewedBy`, `reviewedAt`, `rejectionReason`.

Output `200`: `Post` with `status: "in_review"`. Errors: 409 `INVALID_POST_STATE` (published, or already in review).

### `POST /api/v1/brands/:brandId/posts/:postId/media`

Purpose: upload an image or video for the post. Replaces the mock's `mediaUrl` data URL. Who: owner or admin.

Input: `multipart/form-data` (not JSON):

| Field | Required | Meaning |
|---|---|---|
| `file` | yes | The image or video. Proposed limits: images 10 MB (jpeg, png, webp), video 200 MB (mp4, mov) |
| `altText` | no | Text for screen readers |
| `position` | no | Order in a carousel. Default: last |

The API stores the file in object storage, reads width/height/duration, and adds a `post_media` row with `source: "uploaded"`.

Output `201`: `PostMedia`:

```json
{ "id": "m1...", "type": "image", "url": "https://media.example.com/brands/7d1c/posts/e41f/m1.jpg",
  "position": 0, "source": "uploaded", "width": 1080, "height": 1350, "durationSec": null,
  "altText": "Barista pouring milk", "createdAt": "2026-09-20T10:05:00.000Z" }
```

Errors: 413 `MEDIA_TOO_LARGE`, 415 `UNSUPPORTED_MEDIA`, 409 `INVALID_POST_STATE` (published).

Which storage, and whether the browser uploads directly to it, is open question 3. Direct upload would turn this into two endpoints ("give me an upload URL", then "confirm").

### `DELETE /api/v1/brands/:brandId/posts/:postId/media/:mediaId`

Purpose: remove a file ("go back to the generated artwork" in the post sheet). Deletes the row and the stored file. Who: owner or admin.

Output `204`. Errors: 404 `MEDIA_NOT_FOUND`, 409 `INVALID_POST_STATE` (published).

Left out on purpose (no screen needs them): writing a post by hand (`POST /posts`; the table supports it with `created_by`), deleting a post (reject it instead), reordering a carousel, editing alt text after upload. Images made by the agent are saved by the agent itself as `source: "generated"`; no endpoint.

---

## 10. Chat (3)

Phase 4. One chat per brand. Mastra stores threads and messages in its own tables in the same Postgres. We add no table. Each thread is saved with `resourceId = brandId`, so the brand ownership rule protects it.

The web app uses TanStack AI `useChat` with `fetchServerSentEvents(url)`. The exact request body that adapter sends, and the AG-UI event names, are **to verify** against the installed package when phase 4 starts.

### `POST /api/v1/brands/:brandId/chat`

Purpose: send one message and stream the agent's answer. Who: owner or admin.

Body:

```json
{
  "threadId": "t-2f6c...",        // optional; when missing, a new thread is created
  "messages": [ { "role": "user", "parts": [ { "type": "text", "content": "What is working best?" } ] } ]
}
```

Only the **last user message** is used. Older messages come from Mastra memory, not from the browser, so a caller cannot invent history.

Output `200`, `Content-Type: text/event-stream`. **This is the one answer without the `{ success, data }` envelope.** It is a stream of AG-UI events, the same ones the mock sends today:

```
data: {"type":"RUN_STARTED","threadId":"t-2f6c...","runId":"r-91..."}
data: {"type":"TEXT_MESSAGE_START","messageId":"m-1","role":"assistant"}
data: {"type":"TEXT_MESSAGE_CONTENT","messageId":"m-1","delta":"Short reels "}
data: {"type":"TEXT_MESSAGE_END","messageId":"m-1"}
data: {"type":"RUN_FINISHED","threadId":"t-2f6c...","runId":"r-91...","finishReason":"stop"}
```

Errors before the stream starts use the normal JSON envelope: 404 `BRAND_NOT_FOUND`, 404 `THREAD_NOT_FOUND` (the thread belongs to another brand). An error in the middle of the stream is sent as a `RUN_ERROR` event.

The agent can read the brand's strategy, posts and analytics through its own tools (direct database reads). It does **not** call these HTTP endpoints.

### `GET /api/v1/brands/:brandId/chat/threads`

Purpose: list the brand's conversations, newest first, so the person can continue one or start a new one. Who: owner or admin.

Output `200`:

```json
[ { "id": "t-2f6c...", "title": "What is working best?", "createdAt": "2026-09-19T10:00:00.000Z", "updatedAt": "2026-09-19T10:04:00.000Z" } ]
```

### `GET /api/v1/brands/:brandId/chat/threads/:threadId/messages`

Purpose: load the history when the chat panel opens. Who: owner or admin.

Query: `limit` (default 50), `cursor`. Newest first.

Output `200`:

```json
[
  { "id": "m-1", "role": "assistant", "parts": [ { "type": "text", "content": "Short reels are doing the most work..." } ], "createdAt": "2026-09-19T10:00:05.000Z" },
  { "id": "m-0", "role": "user", "parts": [ { "type": "text", "content": "What is working best?" } ], "createdAt": "2026-09-19T10:00:00.000Z" }
]
```

Errors: 404 `THREAD_NOT_FOUND`.

Left out: rename or delete a thread. Also: the mock lets the person chat from the home screen with no brand open ("all clients"). There is no endpoint for that here; see open question 8.

Note: Mastra's own built-in routes (its dev server and playground) must not be open in production. The phase 1 plan already flags "auth on the Mastra routes" for phase 2.

---

## 11. Social accounts (4)

Phase 5. One account per platform per brand. Because of that, the platform name is the key in the URL (the web app already works this way).

Shape **`SocialAccountDetail`**:

```json
{
  "id": "a1...", "platform": "instagram", "handle": "@kilncoffee",
  "avatarUrl": "https://cdn.example/avatar.jpg",
  "status": "connected",
  "scopes": ["instagram_business_basic", "instagram_business_content_publish"],
  "tokenExpiresAt": "2026-11-19T09:00:00.000Z",
  "connectedBy": "0b6f6a0e-...",
  "connectedAt": "2026-09-10T09:00:00.000Z",
  "lastSyncedAt": "2026-09-20T06:00:00.000Z"
}
```

**Never in any output:** `access_token_enc`, `refresh_token_enc`, `meta`, `external_account_id`. `tokenExpiresAt` is only a date, so the UI can warn "reconnect soon". The scope names above are examples, to verify.

The short form inside `Brand.accounts` stays `{ platform, handle, status, connectedAt }` and lists only `connected` and `expired` accounts.

### `GET /api/v1/brands/:brandId/social-accounts`

Purpose: the Settings screen's account list, with sync and expiry details. Includes `disconnected` rows. Who: owner or admin.

Output `200`: `SocialAccountDetail[]`.

### `POST /api/v1/brands/:brandId/social-accounts/connect`

Purpose: start connecting **or reconnecting** an account. It is a redirect flow, not a normal request. Who: owner or admin.

Body:

```json
{ "platform": "instagram" }   // required
```

What happens: the API builds the network's consent URL with a signed `state` (brand id, user id, platform, random value, 10 minute expiry).

Output `200`:

```json
{ "authorizeUrl": "https://www.instagram.com/oauth/authorize?client_id=...&state=..." }
```

The web app then sets `window.location = authorizeUrl`.

Reconnect uses this same endpoint. If the brand already has a row for the platform (`expired` or `disconnected`), the callback updates that row. No separate reconnect endpoint is needed.

Errors: 400 `VALIDATION_ERROR` (unknown platform), 501 `PLATFORM_NOT_AVAILABLE` (we have no OAuth app for it yet).

### `GET /api/v1/oauth/:platform/callback`

Purpose: the network sends the browser back here after the person agrees. Who: the browser, **without our token**.

Two exceptions, both needed:

- **Not under the brand:** an OAuth app needs one fixed redirect URL registered in advance. It cannot contain a brand id. The brand id travels inside `state`.
- **No Bearer token:** a browser redirect cannot carry headers. The signed `state` proves which user and brand started the flow. A bad or expired `state` is refused.

Query (set by the network): `code`, `state`, or `error`.

What happens: exchange `code` for tokens, read the account's id and handle, encrypt the tokens (AES-256-GCM), insert or update the `social_accounts` row with `status: "connected"`.

Output: `302` redirect to the web app, never JSON:

- Success: `https://<web>/c/<brandId>/settings?connected=instagram`
- Failure: `https://<web>/c/<brandId>/settings?connect_error=<code>`

`connect_error` codes: `denied` (the person said no), `invalid_state`, `account_in_use` (this real account already belongs to another brand; unique index `(platform, external_account_id)`), `account_mismatch` (a reconnect chose a different account), `missing_scopes`, `failed`.

To verify per network: whether the person must pick one Page or organization after login (open question 5).

### `DELETE /api/v1/brands/:brandId/social-accounts/:platform`

Purpose: disconnect. Sets both token columns to null and `status: "disconnected"`. The row stays, because metric history hangs off it. Who: owner or admin.

Output `204`. Errors: 404 `ACCOUNT_NOT_FOUND`.

Scheduled posts for that platform stay `scheduled`. The publisher will fail them with a clear `publishError` until the account is connected again. Also revoking the token on the network's side: to verify per network.

---

## 12. Publishing (1)

Phase 5. Publishing is mostly **not an API**. It is a background job:

- **Publisher job** (every minute): finds posts with `status = 'scheduled' AND scheduled_for <= now()`, checks the account is connected, has the right scopes and the media fits the network's rules, publishes, then sets `published`, `publishedAt`, `externalPostId`, `externalUrl`. On failure it writes `publishError` and leaves the post `scheduled`.
- **Token refresh job**: refreshes tokens before `token_expires_at`. If that fails, the account becomes `expired`.

Scheduling itself is already covered by the posts endpoints (approve, PATCH `scheduledFor`). Only one endpoint is added.

### `POST /api/v1/brands/:brandId/posts/:postId/publish`

Purpose: "Publish now", and also "Try again" after a failed publish. Who: owner or admin.

Input: no body. Allowed from `approved` or `scheduled`.

What happens: sets `scheduledFor` to now, clears `publishError`, sets `status: "scheduled"`. The publisher job picks it up within a minute. There is only one code path that talks to the networks.

Output `202`: the `Post`. The web app refreshes the post until it is `published` or has a `publishError`.

Errors: 409 `INVALID_POST_STATE`, 409 `ACCOUNT_NOT_CONNECTED` (no connected account for this post's platform).

To verify per network before promising anything in the UI: which formats can be published by API (stories and carousels differ between Instagram, Facebook, LinkedIn and TikTok), whether the network pulls media from a public URL or needs an upload, and how long video processing takes.

---

## 13. Analytics (2)

Phase 5. All numbers come from tables filled by background jobs (section 14). The API only reads.

Already covered without new endpoints:

- **Brand card numbers** (followers, deltas, engagement rate, scheduled, pending approvals): in `Brand.stats`.
- **Per-post metrics**: the latest snapshot is in `Post.metrics`. "Top posts" is `GET /posts?status=published&sort=-reach&limit=5`. The full curve over time (`post_metrics` rows) is read by the learning agent directly from the database. No screen draws it, so there is no endpoint for it.
- **Learnings**: inside `GET /strategy`.

### `GET /api/v1/brands/:brandId/analytics`

Purpose: the Analytics screen in one request: the series chart, results by format, results by pillar. Who: owner or admin.

Query (optional):

| Param | Default | Meaning |
|---|---|---|
| `range` | `30d` | `7d`, `30d` or `90d` |
| `platform` | all | One platform |

Output `200`:

```json
{
  "brandId": "7d1c1d2e-...",
  "range": { "from": "2026-08-22", "to": "2026-09-20" },
  "series": [ { "date": "2026-09-19", "reach": 1840, "engagement": 96, "followers": 4198 } ],
  "byFormat": [ { "format": "reel", "engagementRate": 6.1, "posts": 9 } ],
  "byPillar": [ { "key": "behind-the-scenes", "name": "Behind the scenes", "reach": 12400, "posts": 11 } ]
}
```

- `series`: one point per day, summed over the brand's accounts (`account_metrics`).
- `byFormat` and `byPillar`: published posts in the range, joined to their latest `post_metrics` row. `engagementRate` is calculated (interactions ÷ reach × 100), never stored.
- `byPillar` groups by the pillar **`key`**, not the id, because every strategy version has new pillar rows. (The mock uses `pillarId`; the web type changes.)
- With no data yet, the answer is `200` with empty arrays, not 404. The screen shows its empty state.

### `GET /api/v1/brands/:brandId/audience`

Purpose: what each network says about the followers: when they are online, and who they are. Shows the owner why the agent picked its posting times. Who: owner or admin.

Output `200`: the newest snapshot per connected account:

```json
[
  {
    "platform": "instagram",
    "capturedOn": "2026-09-14",
    "activeHours": { "mon": [12, 8, 5, "... 24 numbers, hour 0 first"], "tue": ["..."] },
    "demographics": {
      "countries": [ { "label": "IN", "share": 0.82 } ],
      "cities": [ { "label": "Pune", "share": 0.31 } ],
      "ageGender": [ { "label": "F 25-34", "share": 0.28 } ]
    }
  }
]
```

`activeHours` and each demographics group can be null or missing: networks report different things. Which network gives what is **to verify** in phase 5 (expected: Instagram and TikTok give online hours and demographics; LinkedIn gives demographics only; Facebook unsure).

No screen shows this yet. Build this endpoint together with its card on the Analytics screen; skip it until then. The agent does not need it (it reads the table directly).

---

## 14. Webhooks and internal (0 now, up to 3 later)

These are background jobs, **not endpoints**:

| Job | How often | Writes |
|---|---|---|
| Publisher | every minute | `posts` status, `published_at`, `external_*`, `publish_error` |
| Post metrics sync | often in the first 48 hours after publishing, then daily | `post_metrics` |
| Account metrics sync | daily | `account_metrics`, `social_accounts.last_synced_at` |
| Audience insights sync | weekly | `audience_insights` |
| Token refresh | daily | token columns, or `status = 'expired'` |
| Learning agent | weekly, or after enough new metrics | `learnings` |
| Clerk profile sync | hourly (already described in `apps/api/AGENTS.md`) | `users.name`, `users.image_url` |
| Approval emails | when posts enter `in_review` and `preferences.approvalEmails` is true | nothing (sends email) |

Endpoints that **may** be needed, each only under a condition:

1. `POST /api/v1/internal/jobs/:job` (`publish-due`, `sync-metrics`, ...), protected by a secret header, no user. Needed **only if** the API runs on hosting that sleeps or has no always-on process, so an outside cron service must wake it. If the API is one always-on Node process, run the jobs inside it and do not build this. Open question 6.
2. `POST /api/v1/webhooks/meta/deauthorize` and 3. `POST /api/v1/webhooks/meta/data-deletion`. Meta may require these callback URLs before an app with Facebook/Instagram login can go live. **To verify** in Meta's app review rules. They would mark the account `disconnected` and delete its tokens. Open question 7.

Not needed: a Clerk webhook. Users are created on their first API request and profiles are synced hourly, so nothing waits for a webhook.

---

## 15. Mapping: mock function → real endpoint

Every function in `apps/web/lib/api/client.ts`:

| Mock function | Replaced by | Notes |
|---|---|---|
| `listClients()` | `GET /brands` | For the first paint the web app can use `GET /me/overview` instead |
| `getClient(id)` | `GET /brands/:id` | |
| `scanWebsite(url, onStep)` | `POST /scans`, then poll `GET /scans/:scanId` | `onStep` is driven by `currentStep`; the result is `scan.result` |
| `BRAND_SCAN_STEPS` (constant) | stays in the web app | The API sends only the step id in `currentStep` |
| `createClient(input)` | `POST /brands` (with `scanId`), then `POST /brands/:brandId/strategies` | The mock also makes strategy v1; the real app asks for it in a second call. An admin uses `POST /admin/clients/:id/brands` |
| `updateClient(id, patch)` | `PATCH /brands/:id` | |
| `deleteClient(id)` | `DELETE /brands/:id` | Archives |
| `connectAccount(brandId, platform)` | `POST /brands/:brandId/social-accounts/connect`, browser redirect, `GET /oauth/:platform/callback` | Returns a URL, not a `Brand`. After the redirect back, refetch the brand |
| `disconnectAccount(brandId, platform)` | `DELETE /brands/:brandId/social-accounts/:platform` | Returns 204. Refetch the brand |
| `getStrategy(brandId)` | `GET /brands/:brandId/strategy` | `bestTimes` shape changes |
| `regenerateStrategy(brandId)` | `POST /brands/:brandId/strategies` | Plus `.../activate` if approval is required |
| `listPosts(brandId)` | `GET /brands/:brandId/posts` | |
| `generatePosts(brandId, count)` | `POST /brands/:brandId/posts/generate` | |
| `updatePost(postId, { hook, caption, hashtags, scheduledFor })` | `PATCH /brands/:brandId/posts/:postId` | The URL now needs the brand id; `useUpdatePost(brandId)` already has it |
| `updatePost(postId, { status: "approved" })` | `POST .../posts/:postId/approve` | |
| `updatePost(postId, { status: "rejected" })` | `POST .../posts/:postId/reject` | Now needs a `reason`; the UI must ask for one |
| `updatePost(postId, { status: "in_review" })` (Undo) | `POST .../posts/:postId/reopen` | |
| `updatePost(postId, { mediaUrl })` | `POST .../posts/:postId/media` (upload) or `DELETE .../media/:mediaId` (`mediaUrl: null`) | |
| `getAnalytics(brandId)` | `GET /brands/:brandId/analytics` | Empty arrays instead of 404 |
| `http()` helper | stays | Must read `error.message` from the envelope: today it reads `body.message`, the real body is `body.error.message`. It must also unwrap `body.data` |
| `mockAgentConnection` (`agent-connection.ts`) | `POST /brands/:brandId/chat` | Plus the two thread endpoints for history |

New in the real API with no mock function: `request-changes`, `publish`, single post, strategy versions, social account list, `audience`, all `/admin` endpoints, `/me`.

---

## 16. Open questions

Each one changes the API. Please decide before the phase that needs it.

1. **DECIDED (2026-09-20): strategy approval has a 15 minute window.** New versions wait as `draft`. The owner, or the admin for them, can approve with `POST .../strategies/:strategyId/activate`. If nobody approves within 15 minutes, the agent continues: a background job activates the version (`approved_by` stays null, which is how an automatic activation is told apart from a human one). The total stays 39. The rule is for strategies only (confirmed by the owner): a **post** is never published without a human approval.
2. **Long agent work: one long request, or "start and poll"?** (phase 2) This file proposes one long request for strategy and post generation (simple, matches the web app). If the hosting cuts requests at 30 seconds, or you want progress on screen, they must become `202` + polling like the scan, which needs a place to store the job state.
3. **Which object storage for media, and who uploads?** (phase 3) S3, Cloudflare R2, or another. If the browser uploads straight to storage (better for big videos), media upload becomes two endpoints: get an upload URL, then confirm. Also decide the size limits.
4. **What exactly does "reject" do, against "request changes"?** (phase 3) This file assumes: reject = the post is dead and the reason becomes a lesson; request changes = the agent rewrites the same post. If you want only one button, one endpoint is dropped. Should a reason be required?
5. **Which OAuth apps, and which account types?** (phase 5) Instagram through Instagram login or through a Facebook Page? LinkedIn personal profile or company page? TikTok? If a login can return several Pages or organizations, the flow needs a "pick one" step: about 2 more endpoints. All network abilities are to verify.
6. **Where does the API run?** (phase 5, but decide early) Always-on Node process → background jobs run inside it, no internal endpoint. Sleeping or serverless hosting → add `POST /internal/jobs/:job` called by an outside cron.
7. **Meta deauthorize and data-deletion callbacks**: required for app review or not? To verify. If yes, 2 webhook endpoints.
8. **Chat scope.** One shared conversation history per brand (admin and owner see the same threads), or private per user? And is the home-screen chat with no brand open ("all clients" in the mock) wanted? This file assumes: shared per brand, and no chat without a brand.
