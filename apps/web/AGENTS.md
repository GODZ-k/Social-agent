# AGENTS.md

Guidance for any coding agent working in `apps/web`.

## Before any UI work, read `docs/DESIGN.md`

`docs/DESIGN.md` (shared with `apps/landing` and `packages/ui`) is the design system: colour tokens, typography, layout, components, motion, interaction rules, writing voice, and how to build a landing or marketing page so it matches the app. Follow it instead of asking about styling or layout. If something isn't covered, copy the closest existing screen and choose the quieter option.

Load the `vercel-react-best-practices`, `vercel-composition-patterns` and `web-design-guidelines` skills before writing components. They are the standard this app is held to.

## Where things live

| Path | What |
|---|---|
| `app/` | Route files only: `page`, `layout`, `loading`, `error`, `not-found`. A page reads data and composes pieces from `components/`; it holds no markup of its own beyond layout |
| `components/<area>/` | One folder per screen or product area (`content`, `observability`, `auth`, `onboarding`, ...), including the route body a client route and its admin mirror share. There is no `features/` tree; this is the only home for a product area |
| `components/shell/` | Chrome no single area owns: top bar, breadcrumb, workspace nav, the frames and skeletons they share |
| `components/filters/` | The one widget two areas share, so neither reaches into the other |
| `hooks/` | Every reusable client hook. Exceptions, which stay with what they belong to: `lib/api/use-server-action.ts` and `components/shell/use-active-segment.ts` |
| `lib/forms/` | Every zod form schema, its inferred `Values` type, and its `toValues`/`toPatch` mappers. Web-only: the API contract lives in `@social-agent/shared`, and a form schema is not it |
| `lib/api/server.ts` | Reads. Server-only, `React.cache`d, called from server components |
| `lib/api/actions.ts` | Writes. Server Actions returning `ActionResult<T>`, each ends with `revalidatePath` |
| `lib/api/use-server-action.ts` | The client hook that calls an action inside a transition and toasts failures |
| `lib/api/mock/` | The server-side mock behind both files above. Only they may import it |
| `lib/auth/viewer.ts` | `getViewer()`: the signed-in person from Clerk, resolved once per request |
| `packages/ui` | Reusable UI with no routing, auth or data fetching (`@repo/ui/components/...`). See DESIGN.md section 14 |

## Rules

- **Server first.** A file gets `"use client"` only when it needs state, effects, refs, browser APIs, event handlers with closures, motion, or a library that demands it (react-hook-form, TanStack Table, radix). Rendering lists, formatting dates and numbers, and choosing which piece to show are server work.
- **Small props across the boundary.** A client island receives the fields it uses, not whole records, unless it passes the record on to another component that needs it all.
- **One component, many uses, driven by props.** When two or more components do the same job with different content, make one that takes the varying parts as props — `components/observability/row-list.tsx` exports `ListPanel`, and the seven panels in `list-panels.tsx` are each only their columns and one number. Prefer this over near-duplicate components. A prop that supplies *content* (columns, rows, a title, a stat) is the point; a prop that switches *behaviour* between two unrelated modes still means two components. When a case needs extra chrome the shared one does not have, let it compose the pieces directly instead of growing a slot prop — the four observability panels with filters and footers do exactly that.
- **One component per file** where a component is big enough to look for by filename. Small pieces that are always used together belong in one file with one export each — `components/shell/frames.tsx` holds the bar, rail and tab-bar shells. Do not split a 3-line component into its own file, and do not inline a component inside a page.
- **Forms use react-hook-form with a zod schema** (`zodResolver` from `@hookform/resolvers`), including auth, dialogs and single-field forms. Never hand-rolled `useState` fields and manual checks. Errors show under their field. Pattern: `components/brand-kit/`. Not forms: one-button actions (Approve, Start now, Sign out) and chat inputs that send one message and clear.
- **Data:** reads come from `lib/api/server.ts` in server components; writes go through `lib/api/actions.ts` from client components via `useServerAction`. Keep the function signatures stable so the real API can replace the bodies.
- Types the API also uses (`Platform`, `BrandKit`, `PostStatus`, `Role`, ...) are imported from `@social-agent/shared`, never redefined. `lib/types.ts` holds only what the web adds on top, built from the shared types where the shapes match.
- Never hardcode colours or the product name. Use the tokens in `packages/ui/src/styles/globals.css` and `APP_NAME` from `lib/utils.ts`.
- Auth is Clerk. Every route is private unless listed in `proxy.ts`. Admins see all clients; everyone else sees only the clients they own. Access is checked on the server; the browser is never trusted.
- **Reach for a Radix primitive before hand-rolling interaction.** Anything with keyboard navigation, focus management or ARIA state — menus, dialogs, popovers, toggles, tabs — uses `radix-ui` (the unified package: `import { Dialog } from "radix-ui"`, not `@radix-ui/react-*`). New primitives live in `packages/ui`, styled from `docs/DESIGN.md` tokens, never installed into an app. shadcn is the reference for *how* to wire a primitive, not a thing to run: there is no `components.json` and no `components/ui` folder, because `npx shadcn add` would write a second copy of a component next to `@repo/ui` and a second set of tokens into `app/globals.css`.
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
