# Guided intake by the Account Manager (Phase 2B-7) — design

Date: 2026-09-25. Status: draft for the owner's review before the plan. Nothing is built.

Builds on: `docs/TASKS.md` (2B-7 and the intake notes under phase 2B, the phase 4 design notes), `agents/account-manager/README.md`, `2026-09-22-business-discovery-design.md` (the intake form it replaces), and the owner's rulings of 2026-09-24/25.

## Goal

After the owner saves the brand kit, the Account Manager asks the few things a website cannot tell, in the owner's language and in very simple words, and approves the answers before any research runs. Discovery never starts on a blind or half-empty intake.

## Decisions (owner, 2026-09-24/25)

1. The **Account Manager** runs the intake. It asks after the brand kit is saved and before any research.
2. **Language first.** Hindi, English and Hinglish (Hindi in English letters) now; others later. The chat language and the post language are separate.
3. **Very simple wording**: one question at a time, short, an everyday example, buttons where possible, a "Not sure" answer where allowed, 6-8 questions, about 3 minutes.
4. **Some questions are required** and cannot be skipped.
5. **Without the Account Manager's approval, discovery does not start.**
6. **Two steps**: a guided intake now (this spec), the same agent as a chat in phase 4.
7. Product images for product businesses: parked; `businessType` is recorded now.
8. **Questions differ per brand**: written from what the Brand Analyst found; only the required facts are fixed.
9. Owner answers A, A, A (2026-09-25): the chat language is stored on the **brand**; an **admin may answer and approve the intake for a client, through exactly the same flow** (same questions, same Account Manager review, no shortcut); the **Account Manager writes the money ranges in the brand's own currency**, stored with their numbers.

## How it works

```
owner saves brand kit (POST /brands)
  -> screen asks the chat language (buttons, no model)
  -> POST .../intake/questions      Account Manager call 1: writes the questions
  -> screen asks them one by one    answers saved as they come (PUT .../intake/answers)
  -> POST .../intake/approve        code checks required answers, then Account Manager call 2 reviews them
       approved      -> answers saved to brands.intake, discovery starts
       not approved  -> up to 3 follow-up questions, once; then approve again
```

Two model calls per brand. Both are one call with structured output, like the Brand Analyst, so the agent's skill is inlined with `loadSkill()`.

## The questions

**Every brand gets its own questions** (owner, 2026-09-25). The Account Manager reads what the Brand Analyst found (brand kit, business facts, industry, pages read) and writes the questions for this business: it confirms what the scan found, asks about what the scan left unclear or contradictory, and skips what the website already answers. Two bakeries get different questions; a bakery and a dentist get very different ones.

What stays fixed is **what must be known before research**, not the wording or the order. Five facts are required for every brand; the agent decides how to ask for them (one question can cover two, a confirmation can replace a question):

| Required fact | Why research needs it | Example for a bakery whose site lists cakes and a wholesale page |
|---|---|---|
| `offer` | What is sold and how people buy | "Your website shows cakes and wholesale bread. Which brings more money?" |
| `businessType` | Products, services or both | "You sell cakes you make yourself, right? (Products / Services / Both)" |
| `goal` | What social media must achieve | "What do you want most in the next 3 months?" with goal buttons |
| `postLanguage` | The language of every post | "Which language should your posts be in?" |
| `idealCustomer` | Who the research starts from | "Who buys your cakes most? For example: families for birthdays" |

Then **2 to 4 questions written for this brand only**, from the gaps the scan left. Examples of what the agent may ask:

- the site lists two locations: "Which shop should posts bring people to?";
- the site has no prices: "How much does one customer usually spend?" (range buttons written for this business, in its currency);
- reviews or pages mention events: "Do you do weddings or only walk-in orders?";
- the site is a portfolio with no offer: "How do new customers usually reach you?".

The optional facts (`bestSellers`, `capacity`, `orderValue`, `competitors`, `constraints`) are asked only when the scan did not answer them and they matter for this business. Total: 6-8 questions.

**Code checks the questions before the owner sees them** (through `generateStructured`'s `checkFirstAnswer`, one retry): every required fact is covered by at least one question, there are at most 8, each is short, and every choice or range question has options. A question list that misses a required fact is sent back to the agent, never shown.

Required questions have no "Not sure". The brand-specific ones do, and "Not sure" is stored as such; the Growth Consultant turns it into an open question.

Question object (shared schema `intakeQuestionSchema`):

```ts
{
  id: string,                           // "q1", "q2", ... stable within the session
  covers: IntakeKey[],                  // the required or optional facts it answers; empty for a brand-only question
  why: string,                          // one line for the log and the review: what the scan left unclear
  kind: "confirm" | "choice" | "text" | "range",
  text: string,                         // at most ~12 words, in the chat language
  example?: string,                     // "For example: chocolate cake"
  options?: { value: string; label: string; min?: number; max?: number }[],  // choice and range; a range keeps its numbers
  prefill?: string,                     // confirm: what the website says
  required: boolean,
}
```

Answers map back to data in two ways: answers to questions that cover an `IntakeKey` fill `intakeSchema`; answers to brand-only questions are kept as `notes: { question, answer }[]` on the intake and given to the Growth Consultant with the rest, as data.

## Wording rules (the new skill `intake-interview`)

In `packages/agents/skills/intake-interview/SKILL.md`, written for all three languages:

- Short everyday words; no marketing or business terms ("margin", "conversion", "KPI", "target audience" are banned). One idea per question.
- Hindi in Devanagari; Hinglish in English letters with common spelling ("aapka", "kya"); English at a primary-school reading level.
- Every text question carries one everyday example taken from this business ("For example: chocolate cake", not "For example: product A").
- Money questions are ranges in the brand's currency, never an open number.
- Confirm what the scan found instead of asking it again.
- The review (call 2): an answer is rejected only when it is empty, meaningless ("abc", "idk" on a required question) or contradicts another answer; a follow-up is one short question, asked kindly.

## Data

- `intakeSchema` (shared): add `businessType` (enum, required), `postLanguage` (enum, required) and `notes` (brand-only questions and answers); `idealCustomer` becomes required; `orderValue` may hold a range `{ min, max, currency }`. Existing `brands.intake` rows are dev data only.
- New column `brands.intake_session` jsonb, nullable: `{ chatLanguage, questions, answers, followUps?, updatedAt }`. The draft while the owner answers; kept after approval so Settings can show what was asked.
- New column `brands.intake_approved_at` timestamptz, nullable. Research requires it.
- `chatLanguage` is stored in the session and on `brands.preferences` (`en` · `hi` · `hinglish`) so later chats open in it.
- One migration, `0006`, applied by the owner.

## API (all under `/api/v1/brands/:brandId`, owner or admin)

| Method | Path | Does | Answers |
|---|---|---|---|
| POST | `/intake/questions` | Body `{ chatLanguage }`. Account Manager call 1; stores the questions. Calling again with the same language returns the stored ones (no second model call) | 200 `{ questions }` |
| GET | `/intake` | The session and status: `not_started` · `in_progress` · `approved` | 200 |
| PUT | `/intake/answers` | Body `{ answers: { key: value } }`, partial; validates each value against its question | 200 |
| POST | `/intake/approve` | Code checks every required answer (400 `INTAKE_INCOMPLETE` with the missing keys); then Account Manager call 2 | 200 `{ approved: true, research }` or 200 `{ approved: false, followUps }` |

On approval: answers go to `brands.intake`, `intake_approved_at` is set, and discovery is queued (the research endpoint's logic, called from the service). `POST /research` stays for re-runs and now requires `intake_approved_at` (409 `INTAKE_REQUIRED` otherwise). Editing the intake in Settings later clears the approval until the Account Manager approves again.

Calls 1 and 2 run inside the request (one model call each, about 5-15 s); the screen shows "Preparing your questions" / "Checking your answers". No queue.

## The agent, in the reusable package

Built in `packages/agents`, per the owner's rule that agents are reused outside Cadence:

- `packages/agents/src/account-manager/`: `createAccountManager({ model })` (the app passes `AGENT_MODELS["account-manager"]`), `instructions.ts`, `intake.schema.ts` (the two output schemas and the input contract `IntakeContext`: brand kit, business facts, industry, chat language), `prompt.ts`.
- The package gains `@mastra/core` and `zod` as dependencies. It imports nothing from `apps/api`.
- `apps/api` owns the glue: loading the brand, calling the agent through `generateStructured`, saving, queuing research.
- Model: the `standard` tier (the owner's wording in Hindi matters more than cost here); revisit under X-9.
- Owner text is data in prompts, never instructions, like website text.

## Screens (in 2B-6, described here so the API fits)

Language buttons, then one question per screen with a progress count ("3 of 7"), big buttons, "Not sure" where allowed, Back, answers saved on every step; a final "Checking your answers" screen, then follow-ups if any, then "We are researching your business" (the discovery poll).

## Verification

Live, on the four test sites x three languages (12 runs of call 1):
- the four brands get visibly different questions; every required fact is covered; questions confirm what the scan found, skip what the site answered, stay under ~12 words, carry an example, and read naturally to a Hindi / Hinglish speaker (the owner judges these);
- call 2 rejects "abc" on a required answer and a contradiction, approves normal answers, and asks at most 3 follow-ups once;
- approval starts discovery; `POST /research` before approval answers 409.

## Open questions for the owner

None. Answered on 2026-09-25 (decisions 8 and 9).
