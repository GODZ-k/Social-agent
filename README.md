# social_agent

An AI agent that runs a business's social media.

The user pastes their website URL. The agent reads the site, builds a brand kit, plans a strategy, drafts posts,
waits for a human to approve them, publishes, measures the results, and rewrites the strategy from what it learned.
Nothing goes out without approval.

> The product name and logo are undecided. The code uses the `APP_NAME` placeholder (`apps/web/lib/utils.ts`);
> `social_agent` is only the repo name.

## Who it is for

Built for a social media agency and its clients.

- **Clients** (business owners) sign in, onboard themselves, and see only their own brand. Often not technical,
  often on a phone.
- **Admins** (the agency) can onboard clients and see every client's workspace.

## The agent loop

Every client sits at one stage of this loop (`LoopStage` in `apps/web/lib/types.ts`):

1. **Onboarding**: scan the website, extract the brand kit (colours, voice, logo), connect social accounts.
2. **Strategy**: content pillars, posting cadence and best times per network.
3. **Content**: the agent drafts posts (image, carousel, reel, story) for Instagram, Facebook, LinkedIn and TikTok.
4. **Approval**: a human approves, edits or rejects each post.
5. **Publishing**: approved posts are scheduled and published.
6. **Learning**: analytics feed back into the strategy.

Posts move through `draft → in_review → approved → scheduled → published` (or `rejected`).

## Current status

| Part | State |
|---|---|
| `apps/web` | The product UI is built: onboarding, workspace overview, strategy, content, calendar, approvals, analytics, settings, and an "Ask the agent" chat panel. Auth works (Clerk). **All data comes from an in-browser mock** (`lib/api/client.ts`, `lib/api/mock-db.ts`). |
| `apps/api` | Express 5 + [Mastra](https://mastra.ai) skeleton. Only `/health` and the Mastra starter weather agent exist. `auth.middleware.ts` is empty. **No real agents, routes or database yet.** |
| `apps/landing` | Fresh `create-next-app` scaffold. The marketing page is not started. |
| `packages/ui` | The design system, in use by `web`. |
| `packages/shared` | Set up for shared zod schemas and types, nearly empty. |
| `packages/db` | Empty placeholder. |

What is left, roughly in order:

1. Build the real agents in `apps/api` (brand scan, strategy, post generation, chat) and the REST routes the web
   client already expects. The function signatures in `apps/web/lib/api/client.ts` are the contract.
2. Verify the Clerk token and enforce roles in the API. The role check in the UI is cosmetic.
3. Add the database (`packages/db`) and move the shared types out of `apps/web/lib/types.ts` into `packages/shared`.
4. Real social account connections, publishing and analytics.
5. Build the landing page on `packages/ui`, following `docs/DESIGN.md`.

## What's inside

```
apps/
  web/        Next.js 16 app, the product (port 3000)
  api/        Express 5 + Mastra API (port 8080)
  landing/    Next.js marketing site (scaffold)
packages/
  ui/         @repo/ui, shared design system (Tailwind 4 tokens, components, motion)
  shared/     @social-agent/shared, zod schemas / types / constants, built with tsc
  db/         placeholder
  config/     @repo/eslint-config, @repo/typescript-config
```

Stack: pnpm 11 + Turborepo 2, Node 24, TypeScript 7, Next.js 16, Tailwind 4, TanStack (Query, Table, Charts, AI),
Clerk, Express 5, Mastra, zod.

### Auth and roles

Auth is Clerk for now; the plan is to replace it with our own later, so Clerk usage is kept to a few files.

- `admin`: Clerk public metadata `{ "role": "admin" }`, or an email in `NEXT_PUBLIC_ADMIN_EMAILS` (dev shortcut only).
- Everyone else is a `client` and sees only the clients where `ownerId` is their user id.
- Ownership lives in our own data, not Clerk Organizations, so it survives moving off Clerk.

## Getting started

Requires Node >= 24 and pnpm 11. The repo is pnpm-only.

```sh
pnpm install
cp apps/web/.env.example apps/web/.env.local   # Clerk keys, admin emails, API URL
cp apps/api/.env.example apps/api/.env         # ANTHROPIC_API_KEY etc.
pnpm dev
```

```sh
pnpm dev                     # all dev servers
pnpm dev --filter=web        # just the web app (works on its own, data is mocked)
pnpm dev --filter=api        # just the API (builds @social-agent/shared first)
pnpm build                   # build everything, topologically
pnpm check-types             # tsc --noEmit everywhere
pnpm lint
pnpm format
```

Notes:

- If Clerk fails with "Missing publishableKey", run
  `npx clerk init --accountless --framework next --pm pnpm -y` in `apps/web` to get dev keys.
- The API listens on **8080**, but `apps/web/.env.example` points `NEXT_PUBLIC_API_URL` at `:4000`. Set it to
  `http://localhost:8080` when wiring the real API.
- `landing` and `web` both default to port 3000; run `landing` with `--port 3001` if both are up.
- **Windows:** if `turbo` fails with "An Application Control policy has blocked this file", Smart App Control is
  rejecting the unsigned `turbo.exe`. It is usually transient: retry after a minute or bump `turbo` to a newer
  patch. `pnpm -r run <script>` works as a turbo-free fallback.

## Where to read more

- `docs/DESIGN.md`: the design system and product intent. Read before any UI work, including the landing page.
- `apps/web/AGENTS.md`: rules for working in the web app.
- `apps/api/AGENTS.md`: rules for Mastra work in the API.
