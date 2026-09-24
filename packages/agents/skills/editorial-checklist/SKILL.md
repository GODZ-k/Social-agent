---
name: editorial-checklist
description: Use when reviewing a post or a strategy before a human sees it.
---

# editorial-checklist

**Status:** outline only. The expert content is written when the first agent that uses this skill is built, and then improved from real results. Until then no agent loads it.

## Must cover

- The rubric, with a score per line: brand voice, platform fit, hook strength, clarity, serves the growth lever, speaks to a named segment, facts correct, action clear.
- The pass bar, and what makes an automatic fail (an invented fact, a wrong contact detail, off-brand tone).
- Writing notes a specialist can act on: specific, tied to a rubric line, never a rewrite.
- The strategy rubric: pillars serve the brief, shares total 100, cadence is realistic.

## Used by

- `agents/editor`

## Writing this skill

- Concrete rules, numbers and examples. "Keep it engaging" teaches nothing.
- Say when the advice applies and when it does not.
- Long material (spec tables, example libraries, industry notes) goes in `references/*.md`, which an agent reads only when it needs it.
- Date anything that changes (platform limits, algorithm behaviour) so it can be re-checked.
