import type { ObsRange } from "@/lib/types";

const RANGES: ObsRange[] = ["24h", "7d", "30d"];

/** The toolbar's range and filter, read from the page's `searchParams`. */
export function parseObsSearchParams(searchParams: { range?: string; brand?: string }): { range: ObsRange; brandId: string | null } {
  const range = RANGES.includes(searchParams.range as ObsRange) ? (searchParams.range as ObsRange) : "24h";
  return { range, brandId: searchParams.brand ?? null };
}
