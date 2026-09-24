# @social-agent/agents

The product's agent know-how, kept apart from any one app so it can be reused in other projects (client SEO work, website rebuilds). Cadence's API is its first user.

| Path | What |
|---|---|
| `skills/<name>/SKILL.md` | One playbook per field (brand voice, content pillars, hashtags, ...), in the portable Agent Skills format |
| `src/index.ts` | `loadSkill(name)`: a skill's body, to inline into an agent's instructions |

New agents are built here; existing ones, starting with the Brand Analyst, move in once they no longer import app code.

## Rules

- Nothing in this package imports app code (Express, repositories, the database, an app's config). An agent depends only on its own input and output schemas, its skills and its model choice.
- Skills are written for the field, not for Cadence's screens.
- An app that bundles this package (the API's tsup build) must copy `skills/` next to its bundle; `apps/api/scripts/copy-skills.mjs` does that.

These are not the Claude Code skills in the repo root's `.agents/skills/`. Those are tools for whoever builds the repo; these are what the product's agents know at run time.
