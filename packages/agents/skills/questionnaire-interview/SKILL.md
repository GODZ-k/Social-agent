---
name: questionnaire-interview
description: Use when writing interview questions for a small-business owner, or reviewing their answers.
---

# questionnaire-interview

**Status:** written 2026-09-25 for the Account Manager's guided questionnaire. Languages: English, Hindi, Hinglish.

## Who you are talking to

A busy small-business owner: a baker, a tailor, a clinic, a café. Many read English as a second language; some read slowly in any language. They do not know marketing words and should never need to. If a question makes them think "what does that mean?", it failed.

## Words

- Everyday words only. One idea per question. At most 14 words in `text`: count them. Context the owner needs ("You have two shops and a share in The Mill") goes in `example` or `prefill`, never in front of the question.
- Never use: margin, conversion, KPI, target audience, funnel, engagement, brand awareness, USP, demographic, niche, value proposition, ROI, leads. Say what they mean in plain words instead ("people who buy", "what you earn most from").
- Talk like a friendly shop assistant, not a form. "You", not "the business".

## Per language

**English**: short sentences a 10-year-old could read. "What do you sell the most?"

**Hindi**: Devanagari script, the Hindi people speak, not formal or Sanskritised words.
- Good: "आप सबसे ज़्यादा क्या बेचते हैं?" Bad: "आपका सर्वाधिक विक्रय होने वाला उत्पाद कौन सा है?"
- Good: "आपके ज़्यादातर ग्राहक कौन हैं?" Bad: "आपका लक्षित उपभोक्ता वर्ग कौन सा है?"
- English words people use every day in Hindi are fine: "ऑर्डर", "ऑनलाइन", "पोस्ट", "कस्टमर".

**Hinglish**: Hindi in English letters, the way people type on WhatsApp, with common spellings.
- "Aap sabse zyada kya bechte ho?" "Aapke customer zyada kaun hain?" "Posts kis language mein chahiye?"
- Keep English words that everyone uses in English: order, online, cake, delivery, weekend.

Button labels follow the same rules: two to five words each.

## Confirm, don't ask

When the website already shows something, turn it into a yes-or-fix question with `kind: "confirm"`. The statement goes in `prefill` and the question in `text` stays tiny: `prefill: "You sell cakes and bread in two shops."`, `text: "Is this right?"` (Hindi: "क्या यह सही है?", Hinglish: "Kya yeh sahi hai?"). The screen shows the prefill above the question. The owner taps Yes or types the fix. Never ask an open question about something the site states clearly.

## The five required facts

`offer`, `businessType`, `goal`, `postLanguage`, `idealCustomer` must each be covered by at least one question (list the fact in `covers`). One question may cover two ("You sell cakes you make yourself, right?" covers `offer` and `businessType`). Questions that cover a required fact have `required: true`.

- `businessType`: a choice with the values `product`, `service`, `both`.
- `goal`: a choice with the values `more_customers`, `repeat_customers`, `bigger_orders`, `launch`, `awareness`, labelled in plain words ("More new customers", "Old customers come back more", "People spend more per visit", "Launch something new", "More people know us").
- `postLanguage`: a choice with the values `en`, `hi`, `hinglish`.

## Tailor to this business

Two bakeries get different questions. Add 2-4 questions written for this business only, each from a gap the scan left; write the gap in `why`. Examples:

- two locations on the site: "Which shop should posts bring people to?"
- no prices on the site: the money question below
- reviews or pages mention events: "Do you also do weddings, or only shop orders?"
- a portfolio site with no clear offer: "How do new customers usually find you?"
- many products: "Which one item do you want to sell more of?"

A brand-only question has `covers: []`, `required: false`. Total questions: 5 to 8. Fewer is better when the site already said a lot.

## Money

Ask money only as a range, never an open number: `kind: "range"`, `currency` set to the ISO code of the brand's country (INR for India, USD for the United States), 4-5 options that fit this business, each with `min` and/or `max`. A tea stall: under ₹50, ₹50-150, ₹150-300, over ₹300. A wedding caterer: under ₹50,000, ₹50,000-2,00,000, and so on. The label shows the currency sign; the numbers carry no sign.

## Examples

Every text question carries one `example` taken from this business: "For example: chocolate truffle cake", never "For example: product A".

## Ids and "Not sure"

Ids are short and stable: `q1`, `q2`, ... Required questions have no "Not sure" (the screen hides it). Optional questions allow it; the answer is stored as `not_sure`.

## The review

You get every question with its answer. Read the facts into `questionnaire`:

- a "yes" to a confirm question means its `prefill` is the answer; a typed fix replaces it;
- a choice answer is its option `value`;
- a range answer becomes `orderValue: { min, max, currency }` from the chosen option;
- answers to brand-only questions go to `notes` as `{ question, answer }`, in the owner's words;
- "Not sure" answers are left out.

Approve (`approved: true`, `followUps: []`) when the five required facts are known, even if answers are short, misspelt or in a mix of languages. That is normal.

Do not approve only when a required answer is empty, meaningless ("abc", "idk", "...") or contradicts another answer ("we only sell online" and "customers visit our shop"). Then ask at most 3 `followUps`: one short, kind question each, in the chat language, with new ids (`f1`, `f2`, ...). Never scold. "Sorry, I did not understand. Who buys from you most? For example: office workers."

In the final round, approve unless a required fact is truly missing. Write `reason` in one plain English sentence for the team's log.
