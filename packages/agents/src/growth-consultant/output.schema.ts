import { bottleneckKindSchema, confidenceLevelSchema, type GrowthBrief } from "@social-agent/shared";
import { z } from "zod";

/**
 * The shared `growthBriefSchema` with a description on every field. The descriptions are the only
 * place the model learns what "bottleneck", "opening" or "openQuestions" mean, so they carry the
 * definitions. The shape is pinned to the shared type; the workflow parses with the shared schema.
 */
export const growthBriefOutputSchema = z.object({
  businessModel: z.object({
    sells: z.string().describe("What is sold, in the business's own terms: products, services, packages."),
    toWhom: z.string().describe("Who buys it, from evidence: locals, tourists, other businesses, a niche."),
    howMoneyIsMade: z
      .string()
      .describe("How revenue actually arrives: footfall, bookings, online orders, leads, subscriptions, repeat customers."),
  }),
  bottleneck: z.object({
    kind: bottleneckKindSchema.describe(
      'The one stage that holds growth back most. "awareness": not enough people know it exists. "trust": people know but do not believe it is for them or worth it. "conversion": interested people do not buy or book. "repeat": customers come once and do not return. "orderValue": customers return but spend too little each time.',
    ),
    why: z
      .string()
      .describe("2-3 sentences of evidence for choosing this stage over the other four, citing the intake, the site or what was read."),
  }),
  growthLever: z
    .string()
    .describe("One sentence: the single thing social media should do for this business in the next 3 months, tied to the bottleneck and the owner's goal."),
  priorityOffers: z
    .array(
      z.object({
        name: z.string().describe("The offer as the business names it."),
        why: z.string().describe("Why this one: best seller, high margin, seasonal, spare capacity, or the owner's stated wish."),
      }),
    )
    .max(5)
    .describe("Up to 5 offers worth pushing on social media, most important first. Only offers the business actually sells."),
  kpis: z
    .array(
      z.object({
        name: z
          .string()
          .describe('A business result, not a vanity metric: "bookings per week", "repeat orders", "walk-ins mentioning Instagram".'),
        target: z.string().optional().describe("A number and a period only when the intake supports one; otherwise omit."),
        why: z.string().describe("How this measure proves the growth lever is working."),
      }),
    )
    .min(1)
    .max(5)
    .describe("1-5 measures of success tied to money or customers, never follower counts."),
  competitors: z
    .array(
      z.object({
        name: z.string().describe("The competitor's name."),
        url: z.string().optional().describe("Its website or profile address, only when one was actually read or returned by search."),
        note: z.string().describe("One or two sentences: what it does well, what it does not, and what that means for this brand."),
      }),
    )
    .max(6)
    .describe("Up to 6 competitors: the ones the owner named plus what search found. Empty when none could be verified."),
  opening: z
    .string()
    .describe("2-4 sentences: where this brand can win against those competitors, specific to this business, not to its industry."),
  constraints: z
    .array(z.string())
    .describe("What the strategy must respect: the owner's constraints from the intake, capacity limits, seasonality, legal or platform limits found in research."),
  openQuestions: z
    .array(z.string())
    .describe("Questions the owner must still answer because the answer cannot be researched: margins, capacity, order value, seasonality, budget. Every guess you were tempted to make becomes a question here."),
  confidence: z.object({
    level: confidenceLevelSchema.describe(
      '"high": intake was full and research confirmed it. "medium": some gaps or unverified claims. "low": thin intake, little found, or site facts missing.',
    ),
    why: z.string().describe("One or two sentences on what would raise the confidence."),
  }),
}) satisfies z.ZodType<GrowthBrief>;
