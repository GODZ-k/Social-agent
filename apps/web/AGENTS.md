# AGENTS.md

Guidance for any coding agent working in `apps/web`.

## Before any UI work, read `DESIGN.md`

`DESIGN.md` is the design system: colour tokens, typography, layout, components, motion, interaction rules, writing voice, and how to build a landing or marketing page so it matches the app. Follow it instead of asking about styling or layout. If something isn't covered, copy the closest existing screen and choose the quieter option.

## Rules

- Never hardcode colours or the product name. Use the tokens in `packages/ui/src/styles/globals.css` and `APP_NAME` from `lib/utils.ts`.
- Reusable UI lives in `packages/ui` (`@repo/ui/components/...`). Put a component there when it has no routing, auth or data fetching; otherwise keep it in this app. See DESIGN.md section 14.
- All data goes through `lib/api/client.ts` and the hooks in `lib/api/queries.ts`. The API layer is currently an in-browser mock; keep its function signatures stable so the real API can replace the bodies.
- Auth is Clerk. Every route is private unless listed in `proxy.ts`. Admins see all clients; everyone else sees only the clients they own.
- Read the installed types or bundled docs before using TanStack Table v9, TanStack Charts or TanStack AI. Their APIs differ from older versions.
- A page file in `app/` may export only its default component.

## Done means

`pnpm check-types`, `pnpm lint` and `pnpm build` pass, and the change has been looked at in a browser at 1440px and 390px, in light and dark.
