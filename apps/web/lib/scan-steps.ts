import type { BrandScanStep } from "@/lib/types";

/** The named steps of a brand scan, shown one at a time while it runs. */
export const BRAND_SCAN_STEPS: BrandScanStep[] = [
  { id: "fetch", label: "Reading the website", detail: "Home, about and product pages" },
  { id: "visual", label: "Picking out the visual identity", detail: "Colours, typefaces and imagery" },
  { id: "voice", label: "Listening to how they write", detail: "Tone, vocabulary and sentence length" },
  { id: "audience", label: "Working out who it's for", detail: "Offers, pricing and customer language" },
];
