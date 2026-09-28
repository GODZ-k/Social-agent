"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar, ChevronDown } from "lucide-react";
import { OBS_RANGE_LABEL, type ObsRange } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/dropdown-menu";

const RANGES: ObsRange[] = ["24h", "7d", "30d"];

/** The toolbar's date range: how far back every panel on this tab looks. */
export function RangePicker({ range }: { range: ObsRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setRange(next: ObsRange) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "24h") params.delete("range");
    else params.set("range", next);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-[0.8125rem] font-medium hover:bg-accent"
        >
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
