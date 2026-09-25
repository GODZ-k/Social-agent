import type { z } from "zod";
import type { pageFactsSchema, siteFactsSchema, styleFactsSchema } from "../schema/site-facts.schema.js";

export type PageFacts = z.infer<typeof pageFactsSchema>;
export type StyleFacts = z.infer<typeof styleFactsSchema>;
export type SiteFacts = z.infer<typeof siteFactsSchema>;
