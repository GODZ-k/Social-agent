"use client";

import { useUrlParam } from "@/hooks/use-url-param";
import { format, parseISO } from "date-fns";
import { ChevronDown } from "lucide-react";
import type { Release } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/dropdown-menu";
import { TOOLBAR_PILL_CLASS } from "./badges";

/** The Frontend tab's toolbar: which release the release-check panel compares, newest first. */
export function ReleasePicker({ releases, activeId }: { releases: Release[]; activeId: string }) {
  const setParam = useUrlParam();
  const latest = releases[0];
  const label = activeId === latest?.id ? "All releases" : (() => {
    const active = releases.find((r) => r.id === activeId);
    return active ? `${format(parseISO(active.at), "d MMM")} (${active.commit})` : "All releases";
  })();

  // The newest release is the default, so it is left out of the URL entirely.
  const setRelease = (id: string) => setParam("release", id === latest?.id ? null : id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={TOOLBAR_PILL_CLASS}>
          {label} <ChevronDown className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {releases.map((r) => (
          <DropdownMenuItem key={r.id} onSelect={() => setRelease(r.id)} aria-selected={r.id === activeId}>
            {format(parseISO(r.at), "d MMM, h:mm a")} ({r.commit})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
