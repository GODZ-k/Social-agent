"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AnalyticsRange } from "@/lib/types";
import { Segmented } from "@repo/ui/components/segmented";

type RangeValue = `${AnalyticsRange}`;

const OPTIONS: { value: RangeValue; label: string }[] = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

/** Changes the `range` query param; the page re-reads the report for the new window. */
export function RangeToggle({ range }: { range: AnalyticsRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onValueChange(value: RangeValue) {
    const params = new URLSearchParams(searchParams);
    params.set("range", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return <Segmented label="Date range" value={String(range) as RangeValue} onValueChange={onValueChange} options={OPTIONS} />;
}
