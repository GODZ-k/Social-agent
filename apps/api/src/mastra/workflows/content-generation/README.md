# content-generation

Fill the coming period with posts that are ready for the client's approval.

**Status:** not built yet.

**Starts:** When a strategy becomes active, then on a schedule (for example weekly).

## Steps

| Step id | Done by | What happens |
|---|---|---|
| `plan-slots` | code | From the cadence and the pillar shares, decide each post's platform, format, pillar and `scheduled_for`. No model needed. |
| `write` | **Copywriter** | One post per slot. |
| `direct` | **Art Director** | The visual concept and brief for that post. |
| `review` | **Editor** | `pass`, or `revise` with notes. A revise goes back to `write` and `direct`, at most 2 rounds. |
| `save` | code | Store each passed post as `in_review`. A post that still fails after 2 rounds is stored as `draft` with the Editor's notes, never silently dropped. |

Step ids are stable: the UI shows progress by them.

## Result

`posts` rows in `in_review`, each with its `ai_note`.

## Notes

Posts are independent, so slots run in parallel with a concurrency limit.

## Files when built

- `workflow.ts`: the Mastra workflow and one exported `run...` function, the only thing the rest of the API calls.
- `steps/<step-id>.ts`: one file per step.
