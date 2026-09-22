# brand-scan

A website address in, a proposed brand kit and business info out.

**Status:** built. Run it with pnpm --filter api run scan -- <url>.

**Starts:** Onboarding, when the person enters the website. Later: a rescan when the site changes.

## Steps

| Step id | Done by | What happens |
|---|---|---|
| `discover` | code | Read the home page through Firecrawl, take its colours and fonts, and pick up to 6 useful internal pages. |
| `read-pages` | code | Read the picked pages through Firecrawl and extract the facts from every page. |
| `interpret` | **Brand Analyst** | Turn the facts into a `ScanResult`. Code then overwrites contact details, colour values and fonts with what it extracted. |
| `report` | code | Return the result, the pages read and the warnings. |

Step ids are stable: the UI shows progress by them.

## Result

`{ ok: true, result, pages, warnings }` or `{ ok: false, code, message }`. Phase 2 stores it in `brand_scans`.

## Notes

Full design: `docs/superpowers/specs/2026-09-20-brand-scan-agent-design.md`. The fetching and parsing code lives in `src/scan`, outside this folder, because it has no AI in it.

## Files when built

- `workflow.ts`: the workflow.
- `run.ts`: `runBrandScan`, the only thing the rest of the API calls; separate from `workflow.ts` to avoid a circular import with `mastra/index.ts`.
- `schemas.ts`: step inputs and outputs; a failure is returned in `failure`, never thrown.
- `steps/<step-id>.ts`: one file per step.
