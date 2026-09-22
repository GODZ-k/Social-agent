# post-revision

Rewrite one post after a person rejected it or asked for changes.

**Status:** not built yet.

**Starts:** `POST .../posts/:postId/request-changes` (phase 3).

## Steps

| Step id | Done by | What happens |
|---|---|---|
| `gather` | code | Load the post, the person's reason, and the context the post was written with. |
| `rewrite` | **Copywriter** | Fix the actual complaint. |
| `redirect` | **Art Director** | Update the visual plan only if the text change requires it. |
| `review` | **Editor** | Same bar as new posts. |
| `save` | code | Back to `in_review`. |

Step ids are stable: the UI shows progress by them.

## Result

The same `posts` row, updated.

## Files when built

- `workflow.ts`: the Mastra workflow and one exported `run...` function, the only thing the rest of the API calls.
- `steps/<step-id>.ts`: one file per step.
