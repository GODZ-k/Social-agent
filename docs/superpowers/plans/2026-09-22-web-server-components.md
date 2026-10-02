# Web app on server components: implementation plan

> **For agentic workers:** Tasks A–E are independent and run in parallel, each owned by one agent with exclusive file ownership. Task 0 is done. Task F is the single verification pass at the end. This repo has no test suite by decision; "done" for a task is `check-types` clean in the task's own files and the screen working in the browser.

**Goal:** Every screen in `apps/web` renders on the server, with client islands only where the browser is needed, composed from small named components in `features/<area>/`.

**Architecture:** Server components call `lib/api/server.ts` (React.cache'd reads over a server-side mock). Client islands call Server Actions from `lib/api/actions.ts` through `useServerAction`, which wraps `useTransition` and toasts failures; actions end with `revalidatePath`, which refreshes the route. No client cache.

**Tech stack:** Next.js 16.3 App Router, React 19.2, Clerk 7, Tailwind 4, `@repo/ui`, motion, react-hook-form + zod, TanStack Table v9 (content only), TanStack AI (chat only).

**Spec:** `docs/superpowers/specs/2026-09-22-web-server-components.md`

## Global constraints

- Read `apps/web/AGENTS.md` (rewritten today) and `docs/DESIGN.md` before writing a component. Load the `vercel-react-best-practices` and `vercel-composition-patterns` skills.
- No git commands of any kind. The owner commits.
- Keep every visible string, class name, layout and interaction exactly as the current screen has them. This is a restructure, not a redesign. Copy markup from the old file; do not rewrite it from memory.
- `"use client"` only where the spec's client boundary rule requires it. When in doubt, split the file so the server part stays server.
- Delete the old file you replaced. When you finish, nothing in `components/` remains except `shell/` and `auth/`.
- Imports: `@/features/...`, `@/components/...`, `@/lib/...`, `@repo/ui/...`. Never import `lib/api/mock/*` or `lib/auth/viewer.ts` from a client file (they carry `server-only` and will fail the build).
- Next 16: `params` and `searchParams` in pages and layouts are Promises; `await` them.
- Run `pnpm --filter web exec tsc --noEmit 2>&1 | grep -E "^(app|features|components)/<your paths>"` before reporting. Other agents' folders may still be red while they work; yours must not be.

## Task 0: data layer (done)

Read these before starting; they are the contract:

- `lib/api/server.ts` — `listClients()`, `getClient(id)`, `getStrategy(clientId)`, `listPosts(clientId)`, `getAnalytics(clientId)`. Missing → `null` (or `[]`).
- `lib/api/actions.ts` — `startScan`, `readScan`, `createClient`, `updateClient`, `connectAccount`, `disconnectAccount`, `deleteClient`, `regenerateStrategy`, `generatePosts`, `updatePost`. All return `ActionResult<T>` from `lib/api/result.ts`.
- `lib/api/use-server-action.ts` — `const { run, isPending } = useServerAction(action, { onSuccess?, success?, failure? })`.
- `lib/auth/viewer.ts` — `getViewer(): Promise<Viewer>` (server only). `isAdmin` is `viewer.role === "admin"`.
- `lib/types.ts` — now also `Viewer`, `Scan`, `ScanResult`, `PostPatch`.
- `lib/scan-steps.ts` — `BRAND_SCAN_STEPS`, safe to import from client files.
- `app/providers.tsx` — MotionConfig + Toaster only. `app/layout.tsx` unchanged.

Removed: `lib/api/client.ts`, `session.ts`, `queries.ts`, `mock-db.ts`, `hooks/`, `components/auth/session-gate.tsx`, `@tanstack/react-query`.

## Shared interfaces (every task codes against these)

```ts
// components/shell/top-bar.tsx (server)          — owner: Task A
export function TopBar(props: { viewer: Viewer; client?: Client; clients?: Client[] }): JSX.Element
// components/shell/workspace-nav.tsx (client)    — owner: Task A, unchanged API
export function WorkspaceNav(props: { clientId: string; pendingApprovals: number }): JSX.Element
// components/shell/logo.tsx (server)             — owner: Task A
export function Logo(): JSX.Element

// features/post/post-sheet.tsx (client)          — owner: Task D
export function PostSheet(props: { post: Post | null; brand: BrandKit; strategy: Strategy | null; onClose: () => void }): JSX.Element

// features/strategy/learning-item.tsx (server)   — owner: Task C
export function LearningItem(props: { learning: Learning }): JSX.Element

// features/strategy/regenerate-button.tsx (client) — owner: Task C
export function RegenerateStrategyButton(props: { clientId: string; disabled?: boolean; idleLabel: string; busyLabel: string; variant?: "outline" | "default" }): JSX.Element

// features/brand-kit/settings-brand-kit-form.tsx (client) — owner: Task B
export function SettingsBrandKitForm(props: { client: Client }): JSX.Element
```

The workspace layout (Task A) fetches `client` and `clients` in parallel and renders `<TopBar viewer client clients />`, `<WorkspaceNav />` and `{children}`. Pages under `/c/[clientId]` call `getClient(clientId)` again; React.cache makes it free. A page that gets `null` from `getClient` calls `notFound()`.

---

### Task A: shell, home, workspace layout

**Owns:** `components/shell/*`, `components/auth/auth-shell.tsx`, `features/clients/*`, `features/agent/*`, `app/page.tsx`, `app/loading.tsx`, `app/c/[clientId]/layout.tsx`, `app/c/[clientId]/loading.tsx`, `app/c/[clientId]/error.tsx`, `app/c/[clientId]/not-found.tsx`. Deletes `components/agent/`.

**Estimate:** 60 minutes.

Files to create or rewrite:

- `components/shell/logo.tsx` (server): the `Logo` from the old top bar.
- `components/shell/top-bar.tsx` (server): header markup. Composes `<Logo />`, `<BrandSwitcher />` when `client` is set, `<AgentChatButton client={client} />`, the settings link, `<ThemeMenu />`, the Admin badge (`viewer.role === "admin"`), `<UserButton />` (Clerk, already a client component).
- `components/shell/client-switcher.tsx` (client): the dropdown. Props `{ current: Client; clients: Client[]; isAdmin: boolean }`. Uses `useRouter` for navigation as today.
- `components/shell/agent-chat-button.tsx` (client): the Sparkles button plus the `chatMounted`/`chatOpen` state and the `next/dynamic` import of `AgentChat` (`ssr: false`). Props `{ client?: Client }`.
- `components/shell/workspace-nav.tsx` (client): unchanged content.
- `features/agent/agent-chat.tsx` and `features/agent/agent-connection.ts`: moved from `components/agent/` and `lib/api/agent-connection.ts`, imports updated. No other change.
- `components/auth/auth-shell.tsx`: import `Logo` from `@/components/shell/logo`.
- `app/page.tsx` (server):
  ```tsx
  export default async function ClientsPage() {
    const [viewer, clients] = await Promise.all([getViewer(), listClients()]);
    const isAdmin = viewer.role === "admin";
    // Someone with a single brand has nothing to choose between: take them straight to it.
    if (!isAdmin && clients.length === 1) redirect(`/c/${clients[0]!.id}`);
    return (
      <div className="min-h-dvh">
        <TopBar viewer={viewer} />
        <main ...>
          <ClientsHero isAdmin={isAdmin} />
          {(isAdmin || clients.length > 0) && <ClientList clients={clients} isAdmin={isAdmin} />}
        </main>
      </div>
    );
  }
  ```
- `features/clients/clients-hero.tsx` (server): the h1, paragraph and `<UrlForm />`. `UrlForm` is a client component owned by Task B at `features/onboarding/url-form.tsx`; the hero passes no `onSubmit`, because the form navigates itself (see Task B). Until Task B lands, import it anyway; the type-check will go green when both are in.
- `features/clients/client-list.tsx` (server): heading, count, the `<ul>` of `<ClientRow />`.
- `features/clients/client-row.tsx` (server): the `Link` row. Uses `ClientStat` for the two numbers.
- `features/clients/client-stat.tsx` (server): the `Stat` dt/dd.
- `app/loading.tsx`: the skeleton the old page showed while pending (TopBar cannot be rendered here without the viewer; render only the `<main>` skeleton).
- `app/c/[clientId]/layout.tsx` (server):
  ```tsx
  export default async function WorkspaceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ clientId: string }> }) {
    const { clientId } = await params;
    const [viewer, client, clients] = await Promise.all([getViewer(), getClient(clientId), listClients()]);
    if (!client) notFound();
    return (
      <div className="min-h-dvh">
        <BrandTheme color={client.accent} />
        <TopBar viewer={viewer} client={client} clients={clients} />
        <WorkspaceNav clientId={clientId} pendingApprovals={client.stats.pendingApprovals} />
        <main className="mx-auto max-w-[88rem] px-4 pt-7 pb-32 md:px-6 lg:pr-8 lg:pb-16 lg:pl-64">{children}</main>
      </div>
    );
  }
  ```
- `app/c/[clientId]/not-found.tsx` (server): the old error branch's copy ("This client doesn't exist, or you don't have access to it.") with the "Back to all clients" button. Use `ErrorState` from `@repo/ui/components/states` with a constructed `Error`, or plain markup with the same classes.
- `app/c/[clientId]/error.tsx` (client, required by Next): `ErrorState` with `onRetry={reset}` and the back button.
- `app/c/[clientId]/loading.tsx`: a generic `SkeletonRows rows={3}` inside the same `<main>` padding is not possible (main is in the layout), so just `<SkeletonRows rows={3} className="[&>*]:h-40" />`.

Check in the browser: `/` as admin lists four clients; `/c/kiln-and-clay` shows the tinted top bar, the switcher lists all clients, the chat opens; `/c/nope` shows not-found.

### Task B: onboarding, brand kit, settings

**Owns:** `features/onboarding/*`, `features/brand-kit/*`, `features/settings/*`, `app/onboarding/page.tsx`, `app/onboarding/loading.tsx`, `app/c/[clientId]/settings/page.tsx`. Deletes `components/onboarding/`, `components/settings/`.

**Estimate:** 75 minutes.

- `features/onboarding/url-form.tsx` (client): the existing form. New behaviour: `onSubmit` is optional; when absent the form does `router.push(`/onboarding?url=${encodeURIComponent(url)}`)`. The home hero (Task A) renders it without `onSubmit`; the onboarding flow passes one.
- `features/onboarding/scan-progress.tsx` (client, motion): unchanged, import `BRAND_SCAN_STEPS` from `@/lib/scan-steps`.
- `features/onboarding/use-scan.ts` (client hook): replaces the TanStack query.
  ```ts
  export function useScan(url: string | null): { status: "idle" | "scanning" | "done" | "error"; step: number; result: ScanResult | null; error: string | null; restart: () => void }
  ```
  On a non-null `url`: call `startScan(url)`; then poll `readScan(scanId)` every 700 ms with `setTimeout` inside an effect until `status === "done"`; clean up on unmount and on url change. A failed result sets `error`. `restart` clears and starts again.
- `features/onboarding/onboarding-flow.tsx` (client): the old `Onboarding` component. Props `{ initialUrl: string | null }`. Steps: `url` → `scanning` → `error` → `review`, with the same `AnimatePresence` transition. On review it renders `<OnboardingBrandKitForm url scan={result} />`.
- `app/onboarding/page.tsx` (server):
  ```tsx
  export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
    const [viewer, { url }] = await Promise.all([getViewer(), searchParams]);
    return (<div className="min-h-dvh"><TopBar viewer={viewer} /><main ...><OnboardingFlow initialUrl={normalizeUrl(url ?? "")} /></main></div>);
  }
  ```
- `features/brand-kit/schema.ts`: the zod schema, `Values`, `PLATFORMS`, `VOICE_SUGGESTIONS`, and `toValues(scan, platforms)` / `toInput(values, url)` helpers.
- `features/brand-kit/brand-kit-fields.tsx` (client): the four `Group`s of fields, given `form` (the `UseFormReturn<Values>`) and `platformsHint: string`. No heading, no submit button, no variant prop.
- `features/brand-kit/color-list.tsx`, `voice-picker.tsx`, `platform-picker.tsx`, `field-group.tsx` (client): the pieces `brand-kit-fields` composes. `Group` becomes `FieldGroup`.
- `features/brand-kit/brand-preview.tsx` (client): the sticky aside with `PostArt`; props `{ brand: BrandKit; hook: string; children }` where children is the submit button and note.
- `features/brand-kit/onboarding-brand-kit-form.tsx` (client): heading "Here's what the agent found", the form, `useServerAction(createClient, { success: (c) => `${c.name} added`, failure: "Couldn't save the client.", onSuccess: (c) => router.push(`/c/${c.id}/strategy`) })`. Button copy: "Save and plan the strategy" / "Saving the brand kit".
- `features/brand-kit/settings-brand-kit-form.tsx` (client): props `{ client: Client }`. `useServerAction(updateClient, { success: "Changes saved", failure: "Couldn't save those changes.", onSuccess: () => form.reset(values) })`. Button disabled until dirty. Copy: "Save changes" / "Saving changes" and the "New posts use the updated kit" note.
- `features/settings/settings-tabs.tsx` (client): the `Segmented` bound to `?tab=` via `router.replace`. Props `{ tab: Tab; needsConnection: number }`. Export `TABS`, `Tab`, and `resolveTab(param: string | undefined): Tab` from `features/settings/tabs.ts` (plain module).
- `features/settings/tab-transition.tsx` (client): the `AnimatePresence`/`motion.div` keyed by `tab`, wrapping `children`.
- `features/settings/social-accounts.tsx` (client): today's component, with two `useServerAction`s (`connectAccount`, `disconnectAccount`); pending per platform is tracked with a `useState<Platform | null>` set before `run` and cleared in `onSuccess`, since `isPending` is per hook, not per row. Success toasts as today.
- `features/settings/preferences-form.tsx` (client): the timezone + approval-emails form with `useServerAction(updateClient, ...)`.
- `features/settings/delete-client.tsx` (client): the danger panel plus the confirming `Sheet`; `useServerAction(deleteClient, { success: `${client.name} deleted`, onSuccess: () => router.replace("/") })`.
- `app/c/[clientId]/settings/page.tsx` (server):
  ```tsx
  export default async function SettingsPage({ params, searchParams }) {
    const [{ clientId }, { tab: tabParam }] = await Promise.all([params, searchParams]);
    const [client, viewer] = await Promise.all([getClient(clientId), getViewer()]);
    if (!client) notFound();
    const tab = resolveTab(tabParam);
    const needsConnection = client.platforms.filter((p) => client.accounts.find((a) => a.platform === p)?.status !== "connected").length;
    return (<>
      <PageHeader title="Settings" description="..." />
      <SettingsTabs tab={tab} needsConnection={needsConnection} />
      <TabTransition tab={tab}>
        {tab === "brand" && <SettingsBrandKitForm client={client} />}
        {tab === "accounts" && <SocialAccounts client={client} />}
        {tab === "preferences" && <><PreferencesForm client={client} /><DeleteClient client={client} isAdmin={viewer.role === "admin"} /></>}
      </TabTransition>
    </>);
  }
  ```

Check in the browser: `/onboarding?url=acme.com` runs the four steps then shows the form; saving lands on `/c/acme/strategy`; Settings tabs switch via the URL; connect/disconnect and delete work.

### Task C: overview, strategy, analytics

**Owns:** `features/overview/*`, `features/strategy/*`, `features/analytics/*`, `app/c/[clientId]/page.tsx`, `strategy/page.tsx`, `strategy/loading.tsx`, `analytics/page.tsx`, `analytics/loading.tsx`. Deletes `components/strategy/`.

**Estimate:** 60 minutes.

- Overview page (server): `const [client, posts] = await Promise.all([getClient(clientId), listPosts(clientId)])`. Composes `WorkspaceHeader`, `NextStep`, the loop `Panel`, `Metrics`, `UpcomingPosts`, `BrandKitSummary`. All server components in `features/overview/`. `UpcomingPosts` receives `{ clientId, posts: Post[], brand: BrandKit }` and does the filter/sort/slice itself. `Metric` becomes `features/overview/metric.tsx`.
- Strategy page (server): `getStrategy(clientId)`; when `null`, render the `EmptyState` copy "No strategy has been generated for this client yet." with a link to `/c/[id]`. Pieces in `features/strategy/`: `goal-panel.tsx`, `pillars-panel.tsx` (server) with `pillar-share.tsx` (client: the motion bar and percentage), `cadence-panel.tsx`, `audience-panel.tsx`, `learnings-panel.tsx`, `learning-item.tsx` (moved from `components/strategy/`), `regenerate-button.tsx` (client) — `useServerAction(regenerateStrategy, { success: (s) => `Strategy updated to version ${s.version}` })`. The old page dimmed the whole strategy while regenerating (`opacity-55`, `aria-busy`); keep that by putting the button and the content inside one client wrapper `strategy-refresh.tsx` that owns the pending state and passes `disabled`/`isPending` down, rendering `children` (the server-rendered panels) inside the dimmed div. Children stay server components.
- Analytics page (server): `Promise.all([getClient, getAnalytics, listPosts, getStrategy])`. `noData` is `!analytics || analytics.series.length === 0` → `EmptyState`. Pieces in `features/analytics/`: `trend-panel.tsx` (client: metric `Segmented` + `TrendChart`; receives `series: AnalyticsPoint[]`), `format-panel.tsx` and `pillar-panel.tsx` (server: `RankedBars` is a client component from ui, fine to render from server), `top-posts.tsx` (server), `learned-panel.tsx` (server, renders `LearningItem`s and `RegenerateStrategyButton` with `variant="default"`).
- `loading.tsx` for strategy (`SkeletonRows rows={3} className="[&>*]:h-40"`) and analytics (`rows={2} className="[&>*]:h-72"`), each under a `PageHeader` with the page's title and description so the header does not flash.

Check in the browser: `/c/kiln-and-clay`, `/strategy` (rewrite bumps the version and dims while pending), `/analytics` (metric switcher, learned panel), `/c/harbour-dental/analytics` shows the empty state.

### Task D: content, calendar, post sheet

**Owns:** `features/content/*`, `features/calendar/*`, `features/post/*`, `app/c/[clientId]/content/page.tsx`, `content/loading.tsx`, `calendar/page.tsx`, `calendar/loading.tsx`. Deletes `components/post/`.

**Estimate:** 90 minutes.

- `features/post/post-sheet.tsx` (client): the interface in "Shared interfaces". It no longer fetches the strategy; `bestTimesFor(strategy, post.platform)` uses the prop. Saving: `useServerAction(updatePost, { success: ... })`, then `onClose()`. Split the body: `post-form.tsx` (the react-hook-form fields), `media-picker.tsx` (file input, replace/reset buttons, `readImage`), `schedule-fields.tsx` (date + time), `post-metrics.tsx` (the dl), `post-summary.tsx` (thumbnail button, status, platform, aiNote), `schema.ts` (zod + `toValues`).
- Content page (server): `Promise.all([getClient, listPosts, getStrategy])`; renders `PageHeader` with `<GeneratePostsButton clientId />` (client, `useServerAction(generatePosts, { success: (p) => `${p.length} posts drafted and sent for approval` })`) and `<ContentView posts strategy brand clientId />`.
- `features/content/content-view.tsx` (client): owns `useTable`, status filter, `openId`. Composes `content-toolbar.tsx` (Segmented + search; props are values and callbacks), `posts-table.tsx` (the `<table>`; props `{ table, onOpen }`), `posts-cards.tsx` (phone list), `pagination.tsx`, `post-sheet`. `columns.tsx` exports `features`, `helper`, and `buildColumns(brand)`. `use-post-rows.ts` exports `Row` and `usePostRows(posts, strategy)`. The empty state stays in `content-view` and receives the generate button as `children` from the page so the button stays one component.
- Calendar page (server): `Promise.all([getClient, listPosts, getStrategy])` → `<CalendarView posts brand strategy />`.
- `features/calendar/calendar-view.tsx` (client): month, direction, openId state; `PageHeader` with `month-nav.tsx` (client, Today/prev/next) in `actions`; the `AnimatePresence` wrapper; `month-grid.tsx` and `agenda-list.tsx` (plain components given `days`, `byDay`, `month`, `onOpen`, `brand`); `calendar-model.ts` exports `WEEK`, `dayKey`, `postDate`, `CHIP`, `groupByDay(posts)`, `monthDays(month)`.
- `loading.tsx` for both: `PageHeader` + `SkeletonRows rows={6}` (content) and the four-card skeleton (calendar).

Check in the browser: Content filters, sorts, paginates, opens the sheet, saves an edit and the row updates; Draft 6 posts adds rows; Calendar moves months, opens a chip, agenda on phone width.

### Task E: approvals

**Owns:** `features/approvals/*`, `app/c/[clientId]/approvals/page.tsx`, `approvals/loading.tsx`.

**Estimate:** 60 minutes.

- Page (server): `Promise.all([getClient, listPosts, getStrategy])`; `queue = posts.filter(in_review).sort(...)`; renders `PageHeader` and `<ApprovalStack clientId queue brand strategy />`.
- `features/approvals/approval-stack.tsx` (client): the old page body. Optimistic removal:
  ```ts
  const [visibleQueue, removeOptimistically] = useOptimistic(queue, (state, postId: string) => state.filter((p) => p.id !== postId));
  const [, startTransition] = useTransition();
  function decide(postId: string, decision: Decision) {
    startTransition(async () => {
      removeOptimistically(postId);
      const result = await updatePost(postId, { status: decision });
      if (!result.ok) { toast.error(`Couldn't save that change. ${result.message}`); return; }
      toast(decision === "approved" ? "Approved and scheduled" : "Rejected", { action: { label: "Undo", onClick: () => startTransition(async () => { await updatePost(postId, { status: "in_review" }); }) } });
    });
  }
  ```
  `sessionTotal`, `top`, `lead`, `editingId`, `reading`, `viewingImage` stay here.
- `features/approvals/use-approval-shortcuts.ts` (client hook): the keydown effect, given `{ enabled, onApprove, onReject, onEdit, onRead }`.
- `features/approvals/approval-actions.tsx` (client): the three `RoundAction`s and the hint line; `round-action.tsx` the button.
- `features/approvals/post-reader-sheet.tsx` (client): the phone `Sheet` with decide/edit footer.
- `features/approvals/post-side-panel.tsx` (client, motion): the wide-screen aside.
- `features/approvals/empty-queue.tsx` (server-safe component, rendered by the stack): the `EmptyState` with `done`.
- `loading.tsx`: `PageHeader` + the tall card skeleton.
- Imports `PostSheet` from `@/features/post/post-sheet` (Task D) with `{ post: editing, brand, strategy, onClose }`.

Check in the browser: swipe right moves the card immediately; Undo brings it back; arrow keys, E and Space work; the phone sheet decides; the edit sheet saves.

### Task F: verification (lead, after A–E)

1. `pnpm --filter web run check-types`, `pnpm --filter web run lint`, `pnpm --filter web run build`: all clean.
2. `grep -rl "use client" apps/web/app apps/web/features apps/web/components`: only files the spec's boundary rule allows.
3. `ls apps/web/components`: only `shell` and `auth`.
4. Browser at 1440 and 390, light and dark, every route, as admin and as a client user.
5. Record results in the ledger; update `docs/TASKS.md`, `docs/LESSION.md`, `docs/ARCHITECTURE.md` (web section).
