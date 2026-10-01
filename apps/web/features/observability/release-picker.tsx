"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ChevronDown } from "lucide-react";
import type { Release } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/dropdown-menu";
import { TOOLBAR_PILL_CLASS } from "./toolbar-pill";

/** The Frontend tab's toolbar: which release the release-check panel compares, newest first. */
export function ReleasePicker({ releases, activeId }: { releases: Release[]; activeId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const latest = releases[0];
  const label = activeId === latest?.id ? "All releases" : (() => {
    const active = releases.find((r) => r.id === activeId);
    return active ? `${format(parseISO(active.at), "d MMM")} (${active.commit})` : "All releases";
  })();

  function setRelease(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === latest?.id) params.delete("release");
    else params.set("release", id);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

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
