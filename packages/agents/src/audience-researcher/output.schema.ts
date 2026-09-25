import { platformSchema, type AudienceProfile } from "@social-agent/shared";
import { z } from "zod";

/**
 * The shared `audienceProfileSchema` with a description on every field. The descriptions are the
 * only place the model learns what "basis", "triggers" or "followerGap" mean. The shape is pinned
 * to the shared type; the workflow parses with the shared schema.
 */
const segmentOutputSchema = z.object({
  name: z
    .string()
    .describe('A short name a writer can use: "Morning regulars from the neighbourhood", "Remote workers who need a table".'),
  summary: z.string().describe("2-3 sentences: who they are, why they come to this business, how they buy."),
  pains: z.array(z.string()).describe("What frustrates them about getting this need met today, in their terms."),
  desires: z.array(z.string()).describe("What they hope for when they buy: the outcome, not the product."),
  objections: z.array(z.string()).describe("What stops them buying or coming back: price, distance, doubt, habit."),
  language: z
    .array(
      z.object({
        phrase: z.string().describe("A customer's own words, copied exactly from a review or testimonial."),
        source: z.string().describe("The page address or the site the phrase was read on."),
      }),
    )
    .describe("Verbatim customer phrases with where each was read. Empty when nothing was read; never paraphrased or invented."),
  platforms: z.array(platformSchema).describe("Where this segment spends time, among the platforms the product supports."),
  contentThatLands: z.array(z.string()).describe("Kinds of posts this segment responds to, each tied to a pain, desire or trigger above."),
  triggers: z
    .array(z.string())
    .describe("The moments that tip this segment into buying: an event, a season, a routine, a recommendation."),
  basis: z
    .enum(["evidence", "hypothesis"])
    .describe(
      '"evidence": built from reviews, pages or intake answers you can point to. "hypothesis": a reasoned guess with no direct evidence; say so in the summary.',
    ),
});

export const audienceProfileOutputSchema = z.object({
  segments: z
    .array(segmentOutputSchema)
    .min(2)
    .max(4)
    .describe("2-4 segments, primary first. Different wants and triggers, not just different ages."),
  followerGap: z
    .string()
    .describe(
      'Who follows the brand today versus who the business wants. "Unknown until social accounts are connected" when no account data is available.',
    ),
  competitorAudienceNotes: z
    .array(z.string())
    .describe("What was seen about who engages with the competitors in the brief and what they respond to; one note per competitor read."),
}) satisfies z.ZodType<AudienceProfile>;
