# scorers

Automatic quality scores on what the agents produce, so quality is measured and a drop after a prompt or skill change is visible in Mastra Studio.

**Status:** none built yet. Check the scorers docs of the installed version before writing one (`node_modules/@mastra/core/dist/docs`).

| Scorer | Scores | Kind |
|---|---|---|
| `brand-voice-match` | Does the text sound like the brand's voice rules? | model-graded |
| `hook-strength` | The first line, on the `hook-writing` scale | model-graded |
| `fact-check` | Every phone, email, price and address in the text exists in the brand data | code |
| `platform-fit` | Length, hashtag count and format limits for the platform | code |
| `segment-fit` | Is the post aimed at a named segment and the growth lever? | model-graded |

Code scorers first: they are free and exact. Model-graded scorers use `MODELS.fast`.

Scorers watch quality over time. They do not replace the Editor, which gates each piece of work.
