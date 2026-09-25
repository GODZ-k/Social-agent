import { z } from "zod";
import { businessInfoSchema } from "./brand.schema.js";

/*
 * What a website says about a business, as the scanner extracts it and the agents read it.
 * Shared so the agents package never imports the scanner.
 */

export const pageFactsSchema = z.object({
  url: z.string(),
  title: z.string(),
  description: z.string().optional(),
  og: z.object({
    siteName: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
  /** Names from schema.org business nodes on the page. */
  schemaNames: z.array(z.string()),
  headings: z.array(z.string()),
  text: z.string(),
  wordCount: z.number(),
  logo: z.string().optional(),
  phones: z.array(z.string()),
  emails: z.array(z.string()),
  location: businessInfoSchema.shape.location,
  hours: businessInfoSchema.shape.hours,
  socialLinks: z.array(z.string()),
});

export const styleFactsSchema = z.object({
  /** 6-digit upper-case hex, most important first, at most 5. */
  colors: z.array(z.string()),
  fonts: z.object({ heading: z.string(), body: z.string() }),
});

export const siteFactsSchema = z.object({
  url: z.string(),
  nameCandidates: z.array(z.string()),
  pages: z.array(pageFactsSchema),
  style: styleFactsSchema,
  business: businessInfoSchema.optional(),
  socialLinks: z.array(z.string()),
  logo: z.string().optional(),
});
