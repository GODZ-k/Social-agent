# business-discovery

Understand the business and its customers before any strategy is written.

**Status:** not built yet.

**Starts:** Once per brand, after the scan and the intake questions. Again when the business changes, or every few months.

## Steps

| Step id | Done by | What happens |
|---|---|---|
| `gather` | code | Load the brand kit, the intake answers and the site facts. |
| `diagnose` | **Growth Consultant** | Research competitors and the market; write the growth brief. |
| `profile` | **Audience Researcher** | Research the customers; write the audience profile. |
| `save` | code | Store both as new `brand_research` versions. |

Step ids are stable: the UI shows progress by them.

## Result

A `growth_brief` and an `audience_profile` row in `brand_research`.

## Notes

Needs the intake answers: a website cannot tell us margins, capacity, best sellers or what the owner wants. Needs a web search tool.

## Files when built

- `workflow.ts`: the Mastra workflow and one exported `run...` function, the only thing the rest of the API calls.
- `steps/<step-id>.ts`: one file per step.
