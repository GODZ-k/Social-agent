---
name: brand-voice
description: Use when deriving a brand's voice from its material, writing in it, or checking that a text matches it.
---

# brand-voice

**Status:** outline only. The expert content is written when the first agent that uses this skill is built, and then improved from real results. Until then no agent loads it.

## Must cover

- Turning adjectives ("warm, direct") into rules a writer can follow: sentence length, vocabulary, humour, emoji, formality.
- Do and do not examples per voice trait.
- Keeping the voice while adapting to each platform.
- How to test a text against the voice.

## Used by

- `agents/brand-analyst`
- `agents/copywriter`
- `agents/editor`
- `agents/account-manager`

## Writing this skill

- Concrete rules, numbers and examples. "Keep it engaging" teaches nothing.
- Say when the advice applies and when it does not.
- Long material (spec tables, example libraries, industry notes) goes in `references/*.md`, which an agent reads only when it needs it.
- Date anything that changes (platform limits, algorithm behaviour) so it can be re-checked.
