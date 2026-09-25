# business-discovery

Understand the business and its customers before any strategy is written.

**Status:** built on 2026-09-22 (workflow, queue and endpoints). Run it with `pnpm --filter api run discovery -- <brandId>`, or `POST /api/v1/brands/:brandId/research`. Live verification waits for migration `0004` and the two agents.

**Starts:** Once per brand, after the scan and the questionnaire. Again when the business changes, or every few months.

## Steps

| Step id | Done by | What happens |
|---|---|---|
| `gather` | code | Check the brand kit, the questionnaire answers, the site facts and any previous research. The database reads happen in `run.ts` before the workflow starts, so no step touches a repository. |
| `diagnose` | **Growth Consultant** | Research competitors and the market; write the growth brief. |
| `profile` | **Audience Researcher** | Read the brief, research the customers; write the audience profile. |
| `save` | code | Return the brief, the profile and the pages read. The research queue stores them as the next `brand_research` versions. |

Step ids are stable: the UI shows progress by them (`researchStepIdSchema` in `packages/shared`).

## Result

`{ ok: true, brief, profile, sources }` or `{ ok: false, code, message }` with `code` one of `QUESTIONNAIRE_REQUIRED`, `RESEARCH_FAILED`. Infrastructure failures throw.

## Notes

Needs the questionnaire answers (`brands.questionnaire`): a website cannot tell us margins, capacity, best sellers or what the owner wants. Site facts come from the brand's linked scan (`brand_scans.result` and `pages`), which keeps no page text, so they are thin; there is no re-scan in this phase. Each run gets one `ResearchBudget` (8 searches, 12 reads, 6 minutes) in the `RequestContext`; the tools count against it and collect the sources.

Design: `docs/superpowers/specs/2026-09-22-business-discovery-design.md`.

## Files

- `workflow.ts`: the workflow.
- `run.ts`: `runBusinessDiscovery(brandId, { onStep })`, the only thing the rest of the API calls; separate from `workflow.ts` to avoid a circular import with `mastra/index.ts`.
- `schemas.ts`: step inputs and outputs, the failure codes and their messages; a failure is returned in `failure`, never thrown.
- `steps/<step-id>.ts`: one file per step.
- `src/research-queue`: runs it one brand at a time behind `POST /brands/:brandId/research`.
