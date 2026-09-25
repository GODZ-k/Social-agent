import { z } from "zod";
import { config } from "@/config/constants";
import {
  pageFactsSchema,
  scanPageSchema,
  scanResultSchema,
  scanStepIdSchema,
  styleFactsSchema,
} from "@social-agent/shared";

// The site facts live in @social-agent/shared so the agents package can read them; re-exported for src/scan.
export { pageFactsSchema, siteFactsSchema, styleFactsSchema, type PageFacts, type SiteFacts, type StyleFacts } from "@social-agent/shared";

/** Stable ids: the progress screen shows a scan by them. One source of truth: the shared schema. */
export const SCAN_STEP_IDS = scanStepIdSchema.options;

export const scanErrorCodeSchema = z.enum([
  "INVALID_URL",
  "BLOCKED_ADDRESS",
  "SITE_UNREACHABLE",
  "NOT_A_WEBSITE",
  "NO_CONTENT",
  "INTERPRETATION_FAILED",
]);
export type ScanErrorCode = z.infer<typeof scanErrorCodeSchema>;

/** Thrown inside src/scan. Never crosses runBrandScan: it is turned into a ScanFailure. */
export class ScanError extends Error {
  constructor(
    public readonly code: ScanErrorCode,
    message: string = config.scan.MESSAGES[code],
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
