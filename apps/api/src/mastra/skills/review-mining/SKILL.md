---
name: review-mining
description: Use when reading customer reviews and testimonials.
---

# review-mining

**Status:** outline only. The expert content is written when the first agent that uses this skill is built, and then improved from real results. Until then no agent loads it.

## Must cover

- Where to find them, and reading them through the safe fetcher only.
- Pulling out the exact words customers use for the problem, the result and the feeling.
- Recurring praise and recurring complaints, and what each means for content.
- Quoting: never publish a reviewer's words or name without the client's consent.

## Used by

- `agents/audience-researcher`

## Writing this skill

- Concrete rules, numbers and examples. "Keep it engaging" teaches nothing.
- Say when the advice applies and when it does not.
- Long material (spec tables, example libraries, industry notes) goes in `references/*.md`, which an agent reads only when it needs it.
- Date anything that changes (platform limits, algorithm behaviour) so it can be re-checked.
