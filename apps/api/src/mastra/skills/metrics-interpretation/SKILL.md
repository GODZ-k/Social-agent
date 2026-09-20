---
name: metrics-interpretation
description: Use when reading social media results.
---

# metrics-interpretation

**Status:** outline only. The expert content is written when the first agent that uses this skill is built, and then improved from real results. Until then no agent loads it.

## Must cover

- What each metric means and which ones matter for which goal.
- Engagement rate done properly. Comparing like with like: format, platform, age of post.
- Sample size: when a pattern is evidence and when it is noise.
- The shape of a post's growth curve and what it says.
- Writing a learning: insight, evidence, impact. Explaining results to a client in plain words.

## Used by

- `agents/performance-analyst`
- `agents/account-manager`

## Writing this skill

- Concrete rules, numbers and examples. "Keep it engaging" teaches nothing.
- Say when the advice applies and when it does not.
- Long material (spec tables, example libraries, industry notes) goes in `references/*.md`, which an agent reads only when it needs it.
- Date anything that changes (platform limits, algorithm behaviour) so it can be re-checked.
