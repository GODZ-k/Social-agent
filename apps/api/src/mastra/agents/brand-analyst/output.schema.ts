import { z } from "zod";

/**
 * Judgement only. There is deliberately no field for a phone, email, address, hours, colour value
 * or font, so the model cannot write one — code adds those from what it extracted.
 */
export const brandAnalysisSchema = z.object({
  name: z.string().describe("The business name, as the business writes it."),
  industry: z.string().describe('A short common label, e.g. "Bakery", "Family dentist", "B2B accounting software".'),
  tagline: z.string().describe("The site's own tagline copied exactly, or a new one of at most 8 words in its voice."),
  summary: z.string().describe("2-3 sentences: what the business does, for whom, and what sets it apart."),
  audience: z.string().describe('One sentence on who they sell to, from evidence. "Not clear from the website" when it is not.'),
  voice: z.array(z.string()).min(3).max(5).describe("3-5 plain adjectives a writer can act on."),
  aesthetic: z.string().describe("One line on the visual feel."),
  keywords: z.array(z.string()).min(5).max(10).describe("Terms a customer would type to find this business."),
  colorNames: z.array(z.string()).describe('One short human name per colour given, in the same order, e.g. "Espresso", "Butter".'),
});

export type BrandAnalysis = z.infer<typeof brandAnalysisSchema>;
