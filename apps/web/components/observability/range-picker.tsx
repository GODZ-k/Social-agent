"use client";

import { useUrlParam } from "@/hooks/use-url-param";
import { Calendar, ChevronDown } from "lucide-react";
import { OBS_RANGE_LABEL, type ObsRange } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/dropdown-menu";
import { TOOLBAR_PILL_CLASS } from "./badges";

const RANGES: ObsRange[] = ["24h", "7d", "30d"];

/** The toolbar's date range: how far back every panel on this tab looks. */
export function RangePicker({ range }: { range: ObsRange }) {
  const setParam = useUrlParam();

  // "24h" is the default, so it is left out of the URL entirely.
  const setRange = (next: ObsRange) => setParam("range", next === "24h" ? null : next);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={TOOLBAR_PILL_CLASS}>
          <Calendar className="size-4" /> {OBS_RANGE_LABEL[range]} <ChevronDown className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {RANGES.map((r) => (
          <DropdownMenuItem key={r} onSelect={() => setRange(r)} aria-selected={r === range}>
            {OBS_RANGE_LABEL[r]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
