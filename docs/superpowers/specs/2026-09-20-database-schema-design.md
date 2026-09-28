# Database schema design

Date: 2026-09-20. Status: design approved section by section in chat; awaiting review of this file.

This is the table design for the whole product, agreed before more backend work so later phases do not build on wrong names. It replaces the data-model part of `2026-09-20-backend-foundation-design.md`. Tables are built phase by phase (see "Build order"); this file is the target.

## Domain

- **Admin**: the agency owner. Sees every client and every brand, and can onboard a client on their behalf.
- **Client**: a person, a business owner who buys the service. Owns brands.
- **Brand**: one website plus the social accounts managed for it. A client can own several brands; each brand is its own workspace with its own strategy, posts, accounts and analytics.

In conversation and code, "client" means the person and "brand" means the website workspace. The existing `clients` table holds brands and is renamed.

```
users ─┬─< brands ─┬─< brand_scans
        │           ├─< social_accounts ─┬─< account_metrics
        │           │                    └─< audience_insights
        │           ├─< strategies ─< content_pillars
        │           ├─< learnings
        │           └─< posts ─┬─< post_media
        │                      └─< post_metrics
```

Twelve tables of ours. Chat has none: Mastra's storage is pointed at the same Postgres and creates its own tables; each thread is tagged with the brand id.

## Conventions

- Primary keys are `uuid` with `defaultRandom()`, except the metric tables, which use composite keys.
- Every timestamp is `timestamptz`. Publish times are stored in UTC and shown in the brand's timezone (`brands.preferences.timezone`).
- JSON columns are used only for data that is read and written as a whole and never filtered by field.
- Nothing with history under it is hard-deleted: brands are archived, strategies are superseded, social accounts are disconnected.
- Platform is one Postgres enum, `platform`: `instagram`, `facebook`, `linkedin`, `tiktok`. It is shared by `posts` and `social_accounts`. `brands.platforms` stays `text[]` typed as `Platform[]`.

## Tables

### 1. `users`

A person. Clerk authenticates; ownership points here so leaving Clerk later touches no other table.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `clerk_id` | text, unique, nullable | Null while the person is only invited |
| `email` | text, not null, unique, stored lowercase | How an invited row finds its Clerk account |
| `name` | text, nullable | From Clerk, or typed by the admin at invite time |
| `image_url` | text, nullable | |
| `phone` | text, nullable | The person's own contact number |
| `role` | enum `user_role`: `admin`, `client` | Default `client` |
| `status` | enum `user_status`: `invited`, `active` | |
| `invited_by` | uuid → `users`, nullable | Null for self sign-ups |
| `created_at`, `updated_at` | timestamptz | `updated_at` doubles as "last synced from Clerk" |

How a client enters the system (both routes are supported):

1. **Self sign-up.** The person signs up with Clerk. On their first API request no row matches, so an `active` row is created.
2. **Admin invite.** The admin enters name and email. An `invited` row is created with `clerk_id` null, and Clerk's invitation API sends the email. The admin can set up the brand straight away.

Resolving the caller on each request: look up by `clerk_id`; if none, look for an `invited` row whose email equals the caller's **verified** primary email, set its `clerk_id` and mark it `active`; if none, create a new `active` row. An unverified email never links to an invited row.

No invitations table: Clerk holds the invitation itself.

### 2. `brands` (renamed from `clients`)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `owner_id` | uuid → `users`, not null, indexed | The client who owns it |
| `created_by` | uuid → `users`, not null | Who set it up: the admin on the client's behalf, or the owner |
| `name`, `url`, `industry`, `accent` | text, not null | |
| `stage` | enum `loop_stage`: `onboarding`, `strategy`, `content`, `approval`, `publishing`, `learning` | This is the "brand progress" the admin sees |
| `brand` | jsonb `BrandKit` | Tagline, summary, audience, voice, colours, fonts, aesthetic, keywords |
| `business` | jsonb `BusinessInfo`, default `{}` | The brand's public phone, email, location, hours; all optional |
| `platforms` | text[] `Platform[]` | Where the strategy plans to post. Not the same as "connected" |
| `preferences` | jsonb | Timezone, approval emails |
| `archived_at` | timestamptz, nullable | Soft delete |
| `created_at`, `updated_at` | timestamptz | |

- A client can own any number of brands: `owner_id` is a plain one-to-many foreign key with no unique constraint and no limit in the service. A brand is created by its owner, or by an admin for that owner. If a cap is ever wanted it belongs with billing plans (brands allowed per plan), not in this table.
- Nothing is shared between two brands of the same client: strategies, posts, social accounts, metrics and chat threads all hang off the brand, never off the user. The ownership rule stays as it is: a client reaches every brand where `owner_id` is their id, an admin reaches all.
- A client with no brand yet is "not onboarded"; with one or more they land in a workspace and can switch between brands or add another. `/me/overview` returns all of their brands.
- The rename is `ALTER TABLE clients RENAME TO brands` (plus the index), so existing rows are kept. For existing rows `created_by` is back-filled with `owner_id`.

### 3. `brand_scans`

One row per website scan.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `brand_id` | uuid → `brands`, nullable, indexed | Null for the onboarding scan, see below |
| `requested_by` | uuid → `users`, not null | |
| `url` | text, not null | |
| `status` | enum `scan_status`: `queued`, `running`, `done`, `failed` | The UI polls this |
| `current_step` | text, nullable | Drives the step list on the scan screen |
| `pages` | jsonb, default `[]` | Pages read: url and title |
| `result` | jsonb, nullable | The proposed brand kit and business info |
| `error` | text, nullable | |
| `started_at`, `finished_at` | timestamptz, nullable | |
| `created_at` | timestamptz | |

Onboarding order is: enter URL → scan → review the brand kit → create the brand. The first scan therefore has no brand; `brand_id` is set when the brand is created from it. Re-scans have it from the start.

### 4. `strategies`

One row per version per brand. Versions are never edited in place and never deleted, because posts point at the version they came from.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `brand_id` | uuid → `brands`, not null | |
| `version` | int, not null | Unique with `brand_id` |
| `status` | enum `strategy_status`: `draft`, `active`, `superseded` | Partial unique index: one `active` per brand |
| `goal` | text, not null | |
| `cadence` | jsonb | See shape below |
| `audience` | jsonb | `[{ segment, note }]` |
| `change_note` | text, nullable | The agent's explanation of what changed from the previous version and why |
| `approved_by` | uuid → `users`, nullable | |
| `approved_at` | timestamptz, nullable | |
| `created_at` | timestamptz | |

`cadence` holds one entry per planned platform. Best times carry the day as well as the clock time, read in the brand's timezone:

```json
[
  { "platform": "instagram", "perWeek": 5,
    "bestTimes": [ { "day": "tue", "time": "18:00" }, { "day": "sat", "time": "08:30" } ] },
  { "platform": "linkedin", "perWeek": 2,
    "bestTimes": [ { "day": "tue", "time": "09:15" }, { "day": "thu", "time": "09:15" } ] }
]
```

`day` is one of `mon`…`sun`; `time` is `HH:mm`. The web type `Strategy.cadence[].bestTimes` changes from `string[]` to this shape.

A new version starts as `draft`. Activating it turns the previous `active` version `superseded` in the same transaction. Approval has a 15 minute window (decided 2026-09-20). A new version waits in `draft`. If the owner, or an admin for them, approves in time, `approved_by` and `approved_at` are set and it becomes `active`. If nobody does within 15 minutes of `created_at`, a background job activates it and the agent continues; `approved_by` stays null, which is how an automatic activation is told apart from a human one. The window is one constant in the service (`STRATEGY_APPROVAL_WINDOW_MINUTES = 15`); the deadline is calculated from `created_at`, not stored. This rule is for strategies only: a post is never published without a human approval.

### 5. `content_pillars`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `strategy_id` | uuid → `strategies`, not null, cascade delete | |
| `key` | text, not null | Stable slug such as `behind-the-scenes`; unique with `strategy_id` |
| `name`, `description` | text, not null | |
| `share` | int, 0–100 (check constraint) | Share of the content mix |
| `position` | int, not null | Display order |

A table rather than JSON because posts reference `pillar_id` and analytics groups by pillar. Each strategy version gets fresh rows; `key` lets analytics follow one pillar across versions.

### 6. `learnings`

The agent's memory of what worked. Survives strategy rewrites.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `brand_id` | uuid → `brands`, not null, indexed | |
| `observed_strategy_id` | uuid → `strategies`, not null | The version that was active when this was learned |
| `applied_strategy_id` | uuid → `strategies`, nullable | The version that used it; null = not applied yet |
| `insight` | text, not null | |
| `evidence` | text, not null | The numbers behind it |
| `impact` | enum `learning_impact`: `up`, `down`, `neutral` | |
| `created_at` | timestamptz | |

When the agent writes the next strategy version it reads the learnings with `applied_strategy_id` null and stamps them.

### 7. `posts`

One row is one post on one platform. The same idea on three platforms is three rows: caption, format and time differ, and each is approved, published and measured on its own.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `brand_id` | uuid → `brands`, not null | |
| `strategy_id` | uuid → `strategies`, nullable | Null for a post the client wrote |
| `pillar_id` | uuid → `content_pillars`, nullable | |
| `created_by` | uuid → `users`, nullable | Null = made by the agent |
| `platform` | enum `platform` | |
| `format` | enum `post_format`: `image`, `carousel`, `reel`, `story` | |
| `hook` | text, not null | Short on-image headline |
| `caption` | text, not null | |
| `hashtags` | text[], default `{}` | |
| `ai_note` | text, not null, default `''` | Why the agent made this post; shown to the approver |
| `art` | jsonb | Seed for the placeholder artwork the UI draws while there is no media |
| `status` | enum `post_status`: `draft`, `in_review`, `approved`, `scheduled`, `published`, `rejected` | |
| `scheduled_for` | timestamptz, nullable | |
| `published_at` | timestamptz, nullable | |
| `reviewed_by` | uuid → `users`, nullable | The client, or the admin on their behalf |
| `reviewed_at` | timestamptz, nullable | |
| `rejection_reason` | text, nullable | Passed back to the agent for the rewrite |
| `external_post_id` | text, nullable | The post's id on the network; needed to fetch metrics |
| `external_url` | text, nullable | Permalink |
| `publish_error` | text, nullable | Why the last publish attempt failed |
| `created_at`, `updated_at` | timestamptz | |

Indexes: `(brand_id, status)` for the calendar and approval queue; `(status, scheduled_for)` so the publisher finds due posts with `status = 'scheduled' AND scheduled_for <= now()`.

The strategy holds the rule ("Instagram, Tuesday 18:00"); the post holds the decision (`scheduled_for`). Moving a post changes only the post.

### 8. `post_media`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `post_id` | uuid → `posts`, not null, cascade delete, indexed | |
| `type` | enum `media_type`: `image`, `video` | |
| `url` | text, not null | Public URL the UI shows and the network fetches |
| `storage_key` | text, not null | Path in object storage, to delete or replace the file |
| `position` | int, not null | Order within a carousel |
| `source` | enum `media_source`: `uploaded`, `generated` | |
| `width`, `height` | int, nullable | Checked against the network's aspect-ratio rules before publishing |
| `duration_sec` | int, nullable | |
| `alt_text` | text, nullable | |
| `created_at` | timestamptz | |

Files live in object storage; the provider is chosen in phase 3 and does not change the table. The API fills the web `Post.mediaUrl` and `durationSec` from the first media row.

### 9. `social_accounts`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `brand_id` | uuid → `brands`, not null | |
| `platform` | enum `platform` | |
| `external_account_id` | text, not null | |
| `handle` | text, not null | |
| `avatar_url` | text, nullable | |
| `access_token_enc` | text, nullable | AES-256-GCM; the key is in the API env, never in the database |
| `refresh_token_enc` | text, nullable | |
| `token_expires_at` | timestamptz, nullable | |
| `scopes` | text[], default `{}` | Checked before publishing |
| `meta` | jsonb, default `{}` | Platform-specific extras, such as the Facebook Page id behind an Instagram account |
| `status` | enum `social_account_status`: `connected`, `expired`, `disconnected` | |
| `connected_by` | uuid → `users`, not null | |
| `connected_at`, `last_synced_at`, `updated_at` | timestamptz | `last_synced_at` nullable |

Unique: `(brand_id, platform)`, one account per platform per brand; `(platform, external_account_id)`, one brand per real account.

Disconnecting sets both token columns to null and the status to `disconnected`; the row stays because metric history hangs off it. Reconnecting the same account updates that row. The token columns are never selected by any query whose result goes to a client.

### 10. `post_metrics`

Snapshots of a post over time. Primary key `(post_id, captured_at)`.

| Column | Type | Notes |
|---|---|---|
| `post_id` | uuid → `posts`, cascade delete | |
| `captured_at` | timestamptz | |
| `reach`, `likes`, `comments`, `saves`, `shares` | int, not null, default 0 | |
| `views` | int, nullable | Reels and TikTok |

Each fetch adds a row: often in the first 48 hours, daily after. The UI shows the latest row as `Post.metrics`; the learning agent reads the curve.

### 11. `account_metrics`

One row per social account per day. Primary key `(social_account_id, date)`; a refetch on the same day updates the row.

| Column | Type | Notes |
|---|---|---|
| `social_account_id` | uuid → `social_accounts` | |
| `date` | date | |
| `followers` | int, not null | Total on that day |
| `reach` | int, not null, default 0 | |
| `engagement` | int, not null, default 0 | Interactions that day |

Feeds the analytics series and the brand card's follower delta. Engagement rate is calculated (engagement ÷ reach), never stored. "By format" and "by pillar" are queries over `posts` joined to their latest `post_metrics` row.

### 12. `audience_insights`

What the platform says about the brand's followers. Primary key `(social_account_id, captured_on)`; one snapshot a week is enough.

| Column | Type | Notes |
|---|---|---|
| `social_account_id` | uuid → `social_accounts` | |
| `captured_on` | date | |
| `active_hours` | jsonb, nullable | Day × hour grid of followers online; null where the platform does not offer it |
| `demographics` | jsonb, nullable | Countries, cities, age and gender, industries |

JSON because each network returns a different shape and the agent reads it whole.

How the agent learns the best time to post, in order of trust:

1. **General benchmarks** from the model's own knowledge and the agent prompt. Used for strategy version 1, when there is no data. Not stored. No platform exposes worldwide activity.
2. **The brand's follower activity**, from this table, once an account is connected. Which networks expose what must be verified against each API in phase 5 (expected: Instagram and TikTok give online hours and demographics; LinkedIn gives demographics only; Facebook is uncertain).
3. **The brand's own results**: `posts.scheduled_for` against `post_metrics`. Works on every platform and overrides the other two. The conclusion becomes a `learnings` row, and the next strategy version changes `cadence.bestTimes`.

### 13. `brand_research` (added 2026-09-20 with the agent team; NOT in the schema or a migration yet)

What the Growth Consultant and the Audience Researcher learn about a business, before any strategy is written (see `apps/api/src/mastra/README.md`). Versioned, because a business changes and a strategy must show which research it was built on.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `brand_id` | uuid → `brands`, not null | |
| `kind` | enum `research_kind`: `growth_brief`, `audience_profile`, `competitor_scan` | |
| `version` | int, not null | Unique with `brand_id` and `kind` |
| `data` | jsonb, not null | The brief or profile. Shapes are zod schemas in `packages/shared`, written when the agents are built |
| `created_at` | timestamptz | |

Never edited in place: a rerun writes the next version. The latest version of each kind is the current one.

Two more additions that come with it, also not in the schema yet:

- `brands.intake` jsonb, default `{}`: the owner's answers to the onboarding questions (main goal, top products, ideal customer, area served, busy and slow seasons, rough monthly customers, what worked before, known competitors). A website cannot tell us these, and the Growth Consultant cannot diagnose a business without them.
- `strategies.growth_brief_id` and `strategies.audience_profile_id`, uuid → `brand_research`, nullable: which research a strategy version was written from.

These are added in one migration when the `business-discovery` workflow is built.

## Left out on purpose

- **Billing.** No subscriptions yet. Later the product will take payments through Razorpay, Stripe and Polar, so when it comes it is provider-agnostic: `plans`, and `subscriptions` with a `provider` column plus that provider's customer and subscription ids, hanging off `users`. Nothing above changes.
- **`post_reviews`** (full approval history): the review columns on `posts` are enough for now.
- **`publish_attempts`** (retry log): `publish_error` is enough for now.
- **`notifications`, `audit_log`, `invitations`**: not needed yet; Clerk holds invitations.
- A column grouping sibling posts across platforms.

## Build order

| Phase | Tables |
|---|---|
| 1, foundation (now) | `users` changes, `clients` → `brands` rename and its new columns |
| 2, brand scan and strategy | `brand_scans`, `strategies`, `content_pillars`, `learnings` |
| 3, posts | `posts`, `post_media` |
| 4, chat | none; point Mastra storage at Postgres |
| 5, accounts, publishing, analytics | `social_accounts`, `post_metrics`, `account_metrics`, `audience_insights` |

Each phase adds its tables in its own migration. `learnings` is created in phase 2 with the strategy tables because `strategies` reads it, though rows only appear once phase 5 produces metrics.

## What phase 1 changes in code

- `packages/db`: schema and one migration for the `users` columns (`phone`, `status`, `invited_by`, nullable `clerk_id`, unique `email`) and the rename with `created_by` and `archived_at`.
- `packages/shared`: `clientSchema` and friends become brand schemas; `Strategy.cadence` best-time shape is noted for phase 2.
- `apps/api`: `clients` controller, service, repository and routes become `brands`; `/me/overview` returns `brands` and `counts.brands` (`/me/clients` was dropped, overview covers it); user resolution gains the invited-row link; no limit on brands per client; admin endpoints `GET /admin/clients`, `GET /admin/clients/:id`, `POST /admin/clients` (invite), `POST /admin/clients/:id/brands`.
- `apps/web`: the `Client` type and mock are renamed when the web app is wired to the API (phase 3), not now.

Existing emails must be lowercased and checked for duplicates before the unique index is added.
