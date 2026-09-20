# learning-cycle

Turn results into learnings, and learnings into a better strategy.

**Status:** not built yet.

**Starts:** On a schedule (for example every 2 weeks per brand), once enough posts have metrics.

## Steps

| Step id | Done by | What happens |
|---|---|---|
| `collect` | code | Load metrics, posts, the active strategy and the KPIs. Stop early when there is too little data to say anything. |
| `analyse` | **Performance Analyst** | Write learnings with evidence, and recommend whether a new strategy version is justified. |
| `save` | code | Store the `learnings` rows. |
| `next-version` | code | If recommended, start `strategy-generation`. |

Step ids are stable: the UI shows progress by them.

## Result

`learnings` rows, and sometimes a new strategy draft.

## Files when built

- `workflow.ts`: the Mastra workflow and one exported `run...` function, the only thing the rest of the API calls.
- `steps/<step-id>.ts`: one file per step.
