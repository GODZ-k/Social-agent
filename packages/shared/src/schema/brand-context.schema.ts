import { z } from "zod";
import { brandSchema } from "./brand.schema.js";
import { questionnaireSchema } from "./questionnaire.schema.js";
import { audienceProfileSchema, growthBriefSchema } from "./research.schema.js";
import { siteFactsSchema } from "./site-facts.schema.js";

/**
 * Everything known about one client's business, in one shape any agent can take as input: the
 * brand kit, the approved questionnaire, what the website says, and the latest research. Loaded by the
 * app from its database; an agent never reads a database itself, which is what keeps agents reusable.
 */
export const brandContextSchema = z.object({
  brand: brandSchema.pick({ name: true, url: true, industry: true, brand: true, business: true, platforms: true }),
  questionnaire: questionnaireSchema,
  /** From the brand's linked scan, or null when the brand was set up by hand. */
  siteFacts: siteFactsSchema.nullable(),
  /** The latest versions, so a re-run can build on them instead of starting from nothing. */
  research: z.object({ brief: growthBriefSchema.nullable(), profile: audienceProfileSchema.nullable() }),
});
