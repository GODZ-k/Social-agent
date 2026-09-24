# AGENTS.md

Guidance for any coding agent working in `apps/web`.

## Before any UI work, read `docs/DESIGN.md`

`docs/DESIGN.md` (shared with `apps/landing` and `packages/ui`) is the design system: colour tokens, typography, layout, components, motion, interaction rules, writing voice, and how to build a landing or marketing page so it matches the app. Follow it instead of asking about styling or layout. If something isn't covered, copy the closest existing screen and choose the quieter option.

Load the `vercel-react-best-practices`, `vercel-composition-patterns` and `web-design-guidelines` skills before writing components. They are the standard this app is held to.

## Where things live

| Path | What |
|---|---|
| `app/` | Route files only: `page`, `layout`, `loading`, `error`, `not-found`. A page reads data and composes pieces from `features/`; it holds no markup of its own beyond layout |
| `features/<area>/` | One folder per screen or product area. Each piece is one small named component in its own file |
| `components/shell`, `components/auth` | Chrome shared across screens: top bar, workspace nav, auth frame |
| `lib/api/server.ts` | Reads. Server-only, `React.cache`d, called from server components |
| `lib/api/actions.ts` | Writes. Server Actions returning `ActionResult<T>`, each ends with `revalidatePath` |
| `lib/api/use-server-action.ts` | The client hook that calls an action inside a transition and toasts failures |
| `lib/api/mock/` | The server-side mock behind both files above. Only they may import it |
| `lib/auth/viewer.ts` | `getViewer()`: the signed-in person from Clerk, resolved once per request |
| `packages/ui` | Reusable UI with no routing, auth or data fetching (`@repo/ui/components/...`). See DESIGN.md section 14 |

## Rules

- **Server first.** A file gets `"use client"` only when it needs state, effects, refs, browser APIs, event handlers with closures, motion, or a library that demands it (react-hook-form, TanStack Table, radix). Rendering lists, formatting dates and numbers, and choosing which piece to show are server work.
- **Small props across the boundary.** A client island receives the fields it uses, not whole records, unless it passes the record on to another component that needs it all.
- **Compose, don't configure.** No boolean or "variant" props that switch a component's behaviour. Make two explicit components that share the same inner pieces.
- **One component per file**, named after what it shows. A page composes them; it does not define them inline.
- **Data:** reads come from `lib/api/server.ts` in server components; writes go through `lib/api/actions.ts` from client components via `useServerAction`. Keep the function signatures stable so the real API can replace the bodies.
- Types the API also uses (`Platform`, `BrandKit`, `PostStatus`, `Role`, ...) are imported from `@social-agent/shared`, never redefined. `lib/types.ts` holds only what the web adds on top, built from the shared types where the shapes match.
- Never hardcode colours or the product name. Use the tokens in `packages/ui/src/styles/globals.css` and `APP_NAME` from `lib/utils.ts`.
- Auth is Clerk. Every route is private unless listed in `proxy.ts`. Admins see all clients; everyone else sees only the clients they own. Access is checked on the server; the browser is never trusted.
- Read the installed types or bundled docs before using TanStack Table v9, TanStack Charts or TanStack AI. Their APIs differ from older versions.
- A page file in `app/` may export only its default component (plus `metadata`, and `instant` while Cache Components adoption is in progress; each `instant = false` carries a `// TODO: Cache Components adoption` comment until its route is adopted).
- Comments say why, not what, and only where the code cannot say it.

## Done means

`pnpm check-types`, `pnpm lint` and `pnpm build` pass, and the change has been looked at in a browser at 1440px and 390px, in light and dark.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
