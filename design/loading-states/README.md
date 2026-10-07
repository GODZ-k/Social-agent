# Loading states

The thirteen routes that have a `page.tsx` and no `loading.tsx`. Design only: nothing under
`apps/web` was touched.

Build: `python build.py` from this folder (writes the three screens next to this file).
Review: open `review.html` — every screen at 1440, 768 and 390 side by side.

Today all thirteen fall back to `app/loading.tsx`, which draws three grey cards in a centred
`max-w-5xl` main. On an auth page or the brands grid that is the wrong shape, so the page jumps
when it resolves.

## One row per route

| Route | Gets | Reuses | Why |
| --- | --- | --- | --- |
| `app/(auth)/sign-in` | **LD-1** (`app/(auth)/loading.tsx`) | `AuthFrame` + the existing `components/auth/auth-form-skeleton.tsx` | Shares the auth shell with seven siblings. Its own shell prerenders and its form already streams behind `AuthFormSkeleton`, so LD-1 is a correct-shape guard for the group, not the usual sight |
| `app/(auth)/sign-up` | **LD-1** | same | Same shell, same two-field form |
| `app/(auth)/forgot-password` | **LD-1** | same | Same shell. The page is fully static, so this never fires; it inherits the right shape anyway |
| `app/(auth)/reset-password` | **LD-1** | same | Same shell. One field rather than two; the height difference is one row |
| `app/(auth)/verify` | **LD-1** | same | Same shell |
| `app/(auth)/two-factor` | **LD-1** | same | Same shell. Its panel is the two-factor one, which is why LD-1's panel is bones, not the approvals card |
| `app/(auth)/two-factor/lost-access` | **LD-1** | same | Same shell, fully static page |
| `app/(auth)/invite/[[...token]]` | **LD-1** | same | Same shell, two-field form |
| `app/(auth)/two-factor/setup` | **LD-2** (`app/(auth)/two-factor/setup/loading.tsx`) | `AuthFrame` + the real `TwoFactorPanel` steps card | **New, and the one that earns it.** The page is `async` and `await`s `getViewerRole()` at its top level, so it has no prerenderable shell — this is the route `MEMORY.md` lists as still open for Partial Prefetching. Its first step is always the method choice: two cards and a step bar, not a two-field form |
| `app/(auth)/sso-callback` | nothing | — | The page *is* a spinner (`SsoCallback`). A second loading state behind it adds nothing |
| `app/(main)` (the all-brands grid at `/`) | **LD-3** (`app/(main)/loading.tsx`) | `TopBarFrame` via `OnboardingHeaderSkeleton`'s shape, `PageHeader`, the `.bc` brand-tile box | **New.** `page.tsx` awaits `getViewer()` and `listActiveBrands()` at its top level, so the whole route waits. Today its stand-in is three generic cards that look nothing like the tiles |
| `app/(main)/admin` | nothing | — | A redirect stub: `redirect("/admin/clients")` and nothing else. It never renders, so it never loads |
| `app/(main)/onboarding/manual` | nothing | — | Its only request-time read is the top bar, already inside its own `<Suspense>` with `OnboardingHeaderSkeleton`. `ManualKitFlow` beside it is a client component with no reads, so it prerenders |

Three screens for thirteen routes. Ten of the thirteen share a shell, never render, or already hold
their own space.

## What is real and what is bones

The rule the 27 existing `loading.tsx` files follow: static chrome stays real, only the
request-dependent part is sketched. `app/(main)/admin/(agency)/clients/loading.tsx` renders the real
`PageHeader` with its real title and description and sketches only the rows.

- **LD-1** — real: the logo, the footer, the frame and the panel's tinted ground. Bones: the switch
  link, the form, the panel's card and copy, the small-screen promise line. Each of the eight routes
  fills those differently, and a shared `loading.tsx` receives no parameters (confirmed in
  `node_modules/next/dist/docs/.../loading.md`: "Loading UI components do not accept any
  parameters"), so it cannot pick.
- **LD-2** — real: the logo, the footer, "Step 1 of 3" (setup always starts at the method choice),
  the two method-card boxes, and the whole `TwoFactorPanel` steps card, whose three steps are
  hardcoded in the component. Bones: the heading, the lede and the card copy, which differ for an
  admin and a client. The client's "Not now" button is left out — whether it exists depends on the
  role this page is still fetching.
- **LD-3** — real: the bar frame, the wordmark, the title "Your brands" and the "Add a brand"
  button. Bones: the avatar, the count line under the title, and three tiles. The dashed "Add a
  brand" tile is left out of the grid: its place depends on the brand count, and putting it at a
  guessed position is the one thing that would shift.

## Skeleton language

The primitives are the ones S00a and S00b were approved with (`design/web-v2/onboarding_loading.py`):
one grey `#e8ecf2`, a paler `#eef1f5` for secondary copy, `border-radius: 0.5rem` (999px for pills
and circles), a 1.8s pulse, animation off under `prefers-reduced-motion`. The real app's `.skeleton`
utility in `packages/ui/src/styles/globals.css` pulses at 1.6s; these mockups keep 1.8s so the
reviewer sees one language across every approved loading screen, and the code should use `.skeleton`.

Nothing was restated: `build.py` imports the approved builders (`auth_screens.py`, `auth_2fa.py`,
`brands_account.py`, `header_design.py`) and adds one small stylesheet.

## Left open

`app/loading.tsx` at the root is still a generic three-card placeholder with a leftover
`ClientsLoading` function name. Once LD-1 and LD-3 are wired, every route still under it is one that
never shows it, so it could be reduced to a bare frame or deleted. That is a code change, not a
design, so it is not drawn here.
