# Web app on server components

*2026-09-22. Decided with the owner: server components for reads, Server Actions for writes, TanStack Query removed. Mock stays until the API seam swap, but runs on the server.*

## Why

Every screen in `apps/web` is a client component. The mock API lives in the browser and persists to localStorage, so nothing could render on the server. Pages are single 150–330 line files that fetch, derive, and render everything in one component. The owner asked for: server components by default, client only where a browser action needs it, component composition, a designed folder structure, and the Vercel skills (react best practices, composition patterns, web design guidelines) applied.

## Decisions

| Decision | Why |
|---|---|
| Reads are async server components calling `lib/api/server.ts` | No client cache, no hydration bridge; the same shape the real API needs |
| Writes are Server Actions in `lib/api/actions.ts`, returning `ActionResult<T>` and calling `revalidatePath` | Thrown errors lose their message in production; a result object keeps it. Revalidation replaces cache invalidation |
| TanStack Query, the session gate, `useViewer`, `useWorkspace` are removed | Nothing left for them to do |
| The mock moves to the server, held on `globalThis` | Survives HMR in dev; no localStorage. Access rules run against Clerk's `currentUser()` |
| The viewer is resolved once per request with `React.cache` and passed as props | No module-level request state (vercel `server-no-shared-module-state`) |
| Optimistic UI uses `useOptimistic` + `useTransition` | Only the approvals swipe needs it |
| The onboarding scan is `startScan` + polled `readScan` | Mirrors the real API's `POST /scans` then `GET /scans/:id` |
| `app/` holds only route files; `features/<area>/` holds each screen's pieces; `components/` keeps cross-feature chrome | Ownership per screen is obvious; route files stay thin |
| Boolean "variant" props are replaced by explicit components sharing fields | vercel `patterns-explicit-variants` |

## Folder structure

```
apps/web/
  app/                         thin route files only: page, layout, loading, error, not-found
    layout.tsx                 server: fonts, Clerk, theme script, <Providers>
    providers.tsx              client: MotionConfig + Toaster only
    page.tsx                   server: home
    loading.tsx
    onboarding/page.tsx
    sign-in/, sign-up/
    c/[clientId]/
      layout.tsx               server: client + clients in parallel; notFound() when missing
      error.tsx  not-found.tsx  loading.tsx
      page.tsx  strategy/  content/  approvals/  calendar/  analytics/  settings/
  components/
    shell/                     top-bar (server) + its client islands, workspace-nav (client), logo
    auth/                      auth-shell
  features/
    clients/                   home: hero, client-list, client-row, client-stat
    onboarding/                onboarding-flow (client), url-form, scan-progress, use-scan
    brand-kit/                 brand-kit-fields (shared), onboarding-brand-kit-form, settings-brand-kit-form, schema, voice-picker, color-list, platform-picker
    overview/                  workspace-header, next-step, metrics, upcoming-posts, brand-kit-summary
    strategy/                  goal-panel, pillars-panel, pillar-share (client), cadence-panel, audience-panel, learnings-panel, learning-item, regenerate-button (client)
    content/                   content-view (client), columns, use-post-rows, content-toolbar, posts-table, posts-cards, pagination, generate-posts-button
    approvals/                 approval-stack (client), approval-actions, post-reader-sheet, use-approval-shortcuts, empty-queue
    calendar/                  calendar-view (client), month-nav, month-grid, agenda-list, calendar-model
    analytics/                 trend-panel (client), ranked-panels, top-posts, learned-panel
    settings/                  settings-tabs (client), tab-transition, social-accounts (client), preferences (client), delete-client (client)
    post/                      post-sheet (client), post-form, media-picker, schedule-fields, post-metrics, schema
    agent/                     agent-chat (client), agent-connection (mock transport)
  lib/
    api/
      server.ts                server-only reads, React.cache
      actions.ts               "use server" writes
      result.ts                ActionResult type + ok/fail helpers
      use-server-action.ts     client hook: useTransition + toast on failure
      mock/db.ts  mock/seed.ts  mock/scan.ts
    auth/viewer.ts             server-only: currentUser() → Viewer
    types.ts  utils.ts  image.ts  best-times.ts
```

## Client boundary rule

A file gets `"use client"` only when it uses state, effects, refs, browser APIs, event handlers that need closures over state, motion, or a library that requires it (react-hook-form, TanStack Table, radix). Everything else is a server component, including list rendering and formatting. A client island receives the smallest props it needs (vercel `server-serialization`).

## Data contracts

Reads (`lib/api/server.ts`, all `cache()`d):

```ts
getViewer(): Promise<Viewer>                       // redirects to /sign-in when signed out
listClients(): Promise<Client[]>
getClient(id: string): Promise<Client | null>      // null for missing or not yours
getStrategy(clientId: string): Promise<Strategy | null>
listPosts(clientId: string): Promise<Post[]>
getAnalytics(clientId: string): Promise<Analytics | null>
```

Writes (`lib/api/actions.ts`, all return `ActionResult<T>`):

```ts
createClient(input: NewClientInput): Promise<ActionResult<Client>>
updateClient(id: string, patch: ClientPatch): Promise<ActionResult<Client>>
connectAccount(clientId: string, platform: Platform): Promise<ActionResult<Client>>
disconnectAccount(clientId: string, platform: Platform): Promise<ActionResult<Client>>
deleteClient(id: string): Promise<ActionResult<null>>
regenerateStrategy(clientId: string): Promise<ActionResult<Strategy>>
generatePosts(clientId: string, count: number): Promise<ActionResult<Post[]>>
updatePost(postId: string, patch: PostPatch): Promise<ActionResult<Post>>
startScan(url: string): Promise<ActionResult<{ scanId: string }>>
readScan(scanId: string): Promise<ActionResult<Scan>>
```

`ActionResult<T> = { ok: true; data: T } | { ok: false; message: string }`.

## Done means

`pnpm --filter web run check-types`, `lint` and `build` pass; every screen looked at in a browser at 1440px and 390px, light and dark; the approvals swipe still moves the card before the action resolves; signing in as admin and as a client still shows the right clients.
