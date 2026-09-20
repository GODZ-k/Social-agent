# brand-scan

A website address in, a proposed brand kit and business info out.

**Status:** not built yet.

**Starts:** Onboarding, when the person enters the website. Later: a rescan when the site changes.

## Steps

| Step id | Done by | What happens |
|---|---|---|
| `discover` | code | Fetch the home page safely and pick up to 6 useful internal pages. |
| `read-pages` | code | Extract facts from each page, and colours and fonts from the CSS. |
| `interpret` | **Brand Analyst** | Turn the facts into a `ScanResult`. Code then overwrites contact details, colour values and fonts with what it extracted. |
| `report` | code | Return the result, the pages read and the warnings. |

Step ids are stable: the UI shows progress by them.

## Result

`{ ok: true, result, pages, warnings }` or `{ ok: false, code, message }`. Phase 2 stores it in `brand_scans`.

## Notes

Full design: `docs/superpowers/specs/2026-09-20-brand-scan-agent-design.md`. The fetching and parsing code lives in `src/scan`, outside this folder, because it has no AI in it.

## Files when built

- `workflow.ts`: the Mastra workflow and one exported `run...` function, the only thing the rest of the API calls.
- `steps/<step-id>.ts`: one file per step.
