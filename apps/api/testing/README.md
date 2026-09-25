# Testing tools

Terminal tools for trying parts of the API by hand during development. They are not part of the
product: the server never imports them and the build leaves them out. The repo has no automated
test suite on purpose. A change is verified with a real run of one of these, and its output is
recorded in the task.

Run every command from the repo root. Each file opens with a full description: what it does, how
to use it, which keys it needs, and what the output should look like.

| File | Tests | Command | Needs | Costs money |
|---|---|---|---|---|
| [`scan.ts`](scan.ts) | The brand scan (Firecrawl, then the Brand Analyst) | `pnpm --filter api run scan -- tartinebakery.com [--facts \| --fetch]` | Firecrawl key; for the full scan also Anthropic and the database | Full scan yes; `--facts` and `--fetch` use Firecrawl only |
| [`discovery.ts`](discovery.ts) | Business discovery on a real brand from the database | `pnpm --filter api run discovery -- <brandId>` | Database, Anthropic, Firecrawl; the brand's questionnaire approved | Yes, about 3 to 5 min per run |
| [`discovery-probe.ts`](discovery-probe.ts) | The Growth Consultant and Audience Researcher alone, on a made-up café | `pnpm --filter api run discovery-probe -- growth \| audience \| both` | Anthropic, Firecrawl | Yes |
| [`research-tools.ts`](research-tools.ts) | The `webSearch` and `readPage` tools, no model | `pnpm --filter api run research-tools -- search "<query>"` or `read <url>` | Firecrawl | Firecrawl only |
| [`dev-token.ts`](dev-token.ts) | A Clerk sign-in token for calling the API with curl or Scalar | `pnpm --filter api run --silent dev-token -- <user_... or email>` | Clerk secret key | No |

Every tool exits with code 0 when all went well, 1 when the thing under test failed, and 2 for a
usage mistake or a missing key. Keys go in `apps/api/.env`.

## Rules

- Deleting this whole folder must never break the app: nothing outside `testing/` imports from it, and check-types, lint and build pass without it (checked 2026-09-25).
- Throwaway files (before/after snapshots, one-off checks) go in `testing/temp/`, which lint skips. Delete them when the work is done.
- Imports use the `@/` alias (`@/scan/index`, `@/mastra/agents/team`), never `../src/...`.
- A second API server for tests (while `pnpm dev` runs on its own port) must start from another folder, for example `cd testing/temp && PORT=8091 node --env-file=../../.env ../../dist/server.js`: Mastra opens `mastra.duckdb` in the folder the server starts in, and the dev server holds that file locked, so every agent call would fail with a 500.
- A new testing tool goes in this folder, opens with the same kind of description, and gets a script in
  `apps/api/package.json` and a row in the table above.
