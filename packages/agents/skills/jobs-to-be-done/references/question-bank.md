# Jobs-to-be-done: question bank, forces and the objection-to-content table

Companion to `../SKILL.md`. Read the section you need.

## 1. Questions that surface the job

The agent does not interview customers in this phase. The bank has two uses: to read reviews and forum threads with the right questions in mind, and to turn what is unknown into `openQuestions` in the growth brief, worded so the owner can answer in a sentence.

### For reading evidence (ask the text, not a person)

| Question | Where the answer hides |
|---|---|
| What happened just before they went looking? | Time markers in reviews: "after", "the night", "when the old one" |
| What did they try first? | "I'd tried", "the other place", "used to go to", "did it myself" |
| What would have made them not buy? | "was nervous", "almost didn't", "worth it in the end" |
| How did they judge it went well? | Comparatives: "faster than", "cheaper than I expected", "first time" |
| Who else was involved? | Second people: partner, boss, kids, guests, "my mum" |
| What did the purchase let them do next? | The sentence after the praise: "so we could", "in time for" |

### For the owner (write them as open questions when intake is thin)

- Think of the last three customers. What was going on in their life the day they got in touch?
- What do people say when they explain why they chose you over the last place?
- What do people almost never ask about, that you expected them to?
- Which customers are the easiest to serve, and which pay the most? Are they the same people?
- What do people ask on the phone that the website does not answer?
- When does the phone go quiet, and what would have to happen in someone's week for it to ring then?

Never ask the owner to estimate margins or demographics they have not measured. Ask what they observe.

## 2. The four forces

For each segment, weigh the two forces for the purchase against the two against it. The profile does not store the forces as fields; they are how you decide which `objections[]` matter and what the trigger really is.

| Force | Direction | Field it feeds | Example |
|---|---|---|---|
| Push of the situation | for | `triggers[]`, `pains[]` | the boiler died; the wedding is booked |
| Pull of the new solution | for | `desires[]` | a price up front; same-day |
| Anxiety about the new | against | `objections[]` | will it hurt; will they upsell me |
| Habit of the present | against | `objections[]` | I have always used the chain; doing nothing is free |

Rules: a purchase happens when push plus pull is stronger than anxiety plus habit. Content can raise pull and lower anxiety; it can rarely create push (an emergency) and it takes repetition to erode habit. So for a goal of `more_customers` in a category with strong habit (the customer already has a dentist, a hairdresser, a regular café), plan for repeated presence over months, not one converting post.

## 3. Anxiety types and the content that answers them

| Anxiety (write it as a worry) | Typical categories | Content that answers it |
|---|---|---|
| "Will they turn up when they said?" | trades, deliveries, cleaners | time-stamped job stories; the booking confirmation on screen; "same day" with the day named |
| "Will they sell me something I do not need?" | dentists, mechanics, opticians, financial advice | "we said no" stories; a plain price list; the first visit described start to finish |
| "Will it hurt / be awkward / embarrassing?" | dental, hair, tattoo, fitness, therapy | the room and the people; what the first ten minutes are like; a client describing the fear, then the visit |
| "How much, and are there hidden costs?" | everyone | the number, on the post, with what it includes; "from" prices only when the range is honest |
| "Will it arrive / be ready in time?" | gifts, cakes, printing, e-commerce | cut-off dates; the packing bench; a delivery unboxed with the date |
| "Will I fit in there?" | gyms, cafés, studios, restaurants | who is actually in the room on a Tuesday; the range of people, unstaged |
| "Is it worth it over the cheaper option?" | premium anything | the difference shown side by side, not claimed; what the extra buys |
| "Will they judge me for the state of it?" | dental, cleaning, decluttering, repairs | "we have seen worse" said kindly; the before, not only the after |
| "What if it goes wrong?" | anything with a long tail: building, aligners, tattoos | the guarantee, the follow-up visit, the fix-it story |

Only write the content idea when the anxiety appears in the evidence. A list of every anxiety for every business is the bad output the SKILL.md warns against.

## 4. Job statement patterns

Base form: When [situation], I want to [motivation], so I can [outcome]. At most 30 words. Written in the first person of the customer.

Variants that keep the discipline:

- Routine job: "Every [interval], I want to [motivation] without [friction], so I can [outcome]." Good for cafés, cleaners, groomers.
- Event job: "With [event] [n] weeks away, I want to [motivation], so I can [outcome]." Good for dental, fitness, tailoring, catering.
- Emergency job: "When [failure] happens at [inconvenient time], I want [motivation] today, so I can [outcome]." Good for trades and repairs.
- Gift job: "When [occasion] is coming, I want to give [person] [motivation], so I can [social outcome]." The buyer and the user differ; profile the buyer.

Reject any statement where the situation could be any day, the motivation names a product, or the outcome is "be happy".
