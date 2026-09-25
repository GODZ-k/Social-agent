# strategy-generation

Write the next strategy version for a brand.

**Status:** not built yet.

**Starts:** After business discovery, and whenever the learning cycle recommends a new version.

## Steps

| Step id | Done by | What happens |
|---|---|---|
| `gather` | code | Load the brand kit, growth brief, audience profile, unapplied learnings, audience insights and the previous version. |
| `draft` | **Strategist** | Write the strategy and its pillars. |
| `review` | **Editor** | Check it against the growth brief. `revise` sends it back with notes, at most 2 rounds. |
| `save` | code | Store it as a `draft` strategy with its pillars, and stamp the learnings it used. |

Step ids are stable: the UI shows progress by them.

## Result

A `draft` row in `strategies` plus `content_pillars`. The owner has 30 minutes to approve; after that a background job activates it.

## Files when built

- `workflow.ts`: the Mastra workflow and one exported `run...` function, the only thing the rest of the API calls.
- `steps/<step-id>.ts`: one file per step.
