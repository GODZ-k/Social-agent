import type { ObsRange, RouteSearchParams } from "@/lib/types";

const RANGES: ObsRange[] = ["24h", "7d", "30d"];

/** One value for a key. A repeated key arrives as an array, which is never a range or an id. */
function one(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

/** The toolbar's range, brand filter and release, read from a page's `searchParams`. */
export function parseObsSearchParams(searchParams: Awaited<RouteSearchParams>): { range: ObsRange; brandId: string | null; releaseId: string | null } {
  const range = one(searchParams.range);
  return {
    range: RANGES.includes(range as ObsRange) ? (range as ObsRange) : "24h",
    brandId: one(searchParams.brand),
    releaseId: one(searchParams.release),
  };
}
