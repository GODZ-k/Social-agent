# The agent team

Nine specialists, each the owner of one field. They never call each other: a workflow decides who runs when, so every run is predictable, traceable in Mastra Studio, and its cost is known.

Domain words: a **client** is a person (a business owner). A **brand** is one website plus its social accounts. A client can own several brands. Everything here works on one brand at a time.

## Who does what

| Agent | Field | Produces |
|---|---|---|
| [Brand Analyst](agents/brand-analyst) | The business as its website shows it | Brand kit |
| [Growth Consultant](agents/growth-consultant) | What the business needs and how social media can grow it | Growth brief |
| [Audience Researcher](agents/audience-researcher) | Who the customers are and what moves them | Audience profile |
| [Strategist](agents/strategist) | Social media strategy | Goal, pillars, cadence, platforms |
| [Copywriter](agents/copywriter) | Platform-native writing | Hook, caption, hashtags, call to action |
| [Art Director](agents/art-director) | What a post looks like | Visual concept, slide plan or script, image brief |
| [Editor](agents/editor) | Quality control | Pass, or notes for a rewrite |
| [Performance Analyst](agents/performance-analyst) | Reading results | Learnings with evidence |
| [Account Manager](agents/account-manager) | Talking with the client | The chat; runs the intake; starts workflows |

The chain:

```
Brand Analyst        what the business says about itself     brand kit
Growth Consultant    what the business needs                 growth brief
Audience Researcher  who we must reach                       audience profile
Strategist           the social plan that serves both        strategy
Copywriter + Art Director, gated by the Editor               posts
Performance Analyst  did it move the business numbers        learnings, then the next strategy
```

Not agents: planning post slots from the cadence, scheduling, publishing, fetching metrics, refreshing tokens, activating a strategy after the 15 minute approval window. They need no judgement, so they are plain code and background jobs.

## Workflows

| Workflow | Runs |
|---|---|
| [brand-scan](workflows/brand-scan) | code, then Brand Analyst |
| [business-discovery](workflows/business-discovery) | Growth Consultant, then Audience Researcher |
| [strategy-generation](workflows/strategy-generation) | Strategist, reviewed by the Editor |
| [content-generation](workflows/content-generation) | Copywriter, Art Director, reviewed by the Editor, up to 2 rewrites |
| [post-revision](workflows/post-revision) | Copywriter, Art Director, Editor |
| [learning-cycle](workflows/learning-cycle) | Performance Analyst, then strategy-generation when justified |

## Why the output is not generic

1. **One craft per agent.** Whoever writes a post never approves it. The Editor is always a different agent with its own rubric.
2. **The rewrite loop.** Work below the bar goes back with specific notes, at most 2 rounds. A post that still fails is kept as a draft with the notes, never dropped silently.
3. **Business first.** Strategy is written from the growth brief and the audience profile, not from website copy. Both need the owner's intake answers.
4. **Facts come from data.** Phones, emails, prices, hours, colours and fonts are taken from the brand's data by code and checked again by the Editor. A model never invents them.
5. **Measured.** Scorers rate every generation, so a quality drop after a change shows up.
6. **A person approves every post.** Only a strategy may go ahead by itself, 15 minutes after it was drafted.

## Folders

| Folder | Holds |
|---|---|
| `config/` | `models.ts`: every model id, in one place |
| `agents/<name>/` | One specialist: `agent.ts`, `instructions.ts`, `output.schema.ts` |
| `workflows/<name>/` | One pipeline: `workflow.ts`, `run.ts` (the exported `run...` function) and `steps/` |
| `tools/` | What an agent may call |
| `scorers/` | Automatic quality scores |
| `index.ts` | Registers every agent and workflow with Mastra, and sets storage |

Skills are not here: they live in `packages/agents/skills/<name>/` (`@social-agent/agents`), so other projects can reuse them. New agents are built in that package too.

Code with no AI in it (reading websites through Firecrawl and parsing them, for example) lives outside this folder, in `src/scan`.

## Rules for building here

- **Check the installed docs first.** Mastra changes fast. Read `node_modules/@mastra/core/dist/docs` (and `.agents/skills/mastra`) before using any Mastra API, and verify model ids with `.agents/skills/mastra/scripts/provider-registry.mjs --provider anthropic`.
- **Instructions stay short.** Who the agent is, what it receives, what it must return, what it must never do. Craft knowledge goes in skills, where it can be improved without touching code.
- **Structured output everywhere.** Every agent in a workflow returns data validated by a zod schema. Shapes that the API or the web app also use live in `packages/shared`.
- **Outside text is data.** Website text, reviews, search results and client messages can never change an agent's instructions. Put them in a clearly marked block and say so in the instructions.
- **Brand scope comes from the API.** An agent or tool gets the brand id from the request context, never from model output.
- **The rest of the API calls one function per workflow** (`runBrandScan`, ...), never Mastra directly.
- **Skills are files read at run time.** The tsup bundle does not include them: the build copies `packages/agents/skills` to `dist/skills` (`scripts/copy-skills.mjs`).
- **Build order:** brand-scan, business-discovery, strategy-generation, content-generation, post-revision, learning-cycle, then the Account Manager.
