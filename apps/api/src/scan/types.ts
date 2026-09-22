import { z } from "zod";
import {
  businessInfoSchema,
  scanPageSchema,
  scanResultSchema,
  scanStepIdSchema,
} from "@social-agent/shared";

/** Stable ids: the progress screen shows a scan by them. One source of truth: the shared schema. */
export const SCAN_STEP_IDS = scanStepIdSchema.options;
export type ScanStepId = (typeof SCAN_STEP_IDS)[number];

export const scanErrorCodeSchema = z.enum([
  "INVALID_URL",
  "BLOCKED_ADDRESS",
  "SITE_UNREACHABLE",
  "NOT_A_WEBSITE",
  "NO_CONTENT",
  "INTERPRETATION_FAILED",
]);
export type ScanErrorCode = z.infer<typeof scanErrorCodeSchema>;

/** Shown to the business owner on the onboarding screen, so: plain words. */
export const SCAN_MESSAGES: Record<ScanErrorCode, string> = {
  INVALID_URL: "That does not look like a website address. Try something like yourbusiness.com.",
  BLOCKED_ADDRESS: "We can only read public websites. Check the address and try again.",
  SITE_UNREACHABLE: "We could not open that website. Check the address, or try again in a minute.",
  NOT_A_WEBSITE: "That address is a file, not a website. Enter your home page instead.",
  NO_CONTENT: "We could not find any text to read on that website. You can enter your brand details by hand instead.",
  INTERPRETATION_FAILED: "We read your website but could not finish the brand draft. Please try again.",
};

/** Thrown inside src/scan. Never crosses runBrandScan: it is turned into a ScanFailure. */
export class ScanError extends Error {
  constructor(
    public readonly code: ScanErrorCode,
    message: string = SCAN_MESSAGES[code],
  ) {
    super(message);
    this.name = "ScanError";
  }
}

export const scanFailureSchema = z.object({
  ok: z.literal(false),
  code: scanErrorCodeSchema,
  message: z.string(),
});

export const scanSuccessSchema = z.object({
  ok: z.literal(true),
  result: scanResultSchema,
  pages: z.array(scanPageSchema),
  warnings: z.array(z.string()),
});

export const scanOutcomeSchema = z.discriminatedUnion("ok", [scanSuccessSchema, scanFailureSchema]);
export type ScanFailure = z.infer<typeof scanFailureSchema>;
export type ScanSuccess = z.infer<typeof scanSuccessSchema>;
export type ScanOutcome = z.infer<typeof scanOutcomeSchema>;

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
export type PageFacts = z.infer<typeof pageFactsSchema>;

export const styleFactsSchema = z.object({
  /** 6-digit upper-case hex, most important first, at most 5. */
  colors: z.array(z.string()),
  fonts: z.object({ heading: z.string(), body: z.string() }),
});
export type StyleFacts = z.infer<typeof styleFactsSchema>;

export const siteFactsSchema = z.object({
  url: z.string(),
  nameCandidates: z.array(z.string()),
  pages: z.array(pageFactsSchema),
  style: styleFactsSchema,
  business: businessInfoSchema.optional(),
  socialLinks: z.array(z.string()),
  logo: z.string().optional(),
});
export type SiteFacts = z.infer<typeof siteFactsSchema>;

export const discoverySchema = z.object({
  /** The home page's address after redirects. */
  url: z.string(),
  home: pageFactsSchema,
  /** Colours and fonts come with the home page, so they are settled before the inner pages are read. */
  style: styleFactsSchema,
  styleWarnings: z.array(z.string()),
  pageUrls: z.array(z.string()),
});
export type Discovery = z.infer<typeof discoverySchema>;
