import type { BrandScanStep } from "@/lib/types";

/** The named steps of a brand scan, shown one at a time while it runs. Ids match the API's `ScanStepId`. */
export const BRAND_SCAN_STEPS: BrandScanStep[] = [
  { id: "discover", label: "Found your website", detail: "Home, about and product pages" },
  { id: "read-pages", label: "Read the pages", detail: "Colours, typefaces and how you write" },
  { id: "interpret", label: "Working out how you sound", detail: "Tone, vocabulary and sentence length" },
  { id: "report", label: "Drafting your brand kit", detail: "Putting your colours, fonts and tone together" },
];
