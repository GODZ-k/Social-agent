"use client";

import { ChevronDown, Layers } from "lucide-react";
import type { Platform } from "@social-agent/shared";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/dropdown-menu";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";

/** "All platforms" filter, same pattern as `ContentToolbar`'s. */
export function CalendarPlatformFilter({
  platform,
  onChange,
  platforms,
}: {
  platform: Platform | "";
  onChange: (next: Platform | "") => void;
  platforms: Platform[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="pressable flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-card px-3.5 text-sm font-medium ring-1 ring-border">
        <Layers className="size-4 text-muted-foreground" />
        {platform ? PLATFORM_LABEL[platform] : "All platforms"}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onChange("")}>All platforms</DropdownMenuItem>
        {platforms.map((p) => (
          <DropdownMenuItem key={p} onSelect={() => onChange(p)}>
            <PlatformIcon platform={p} /> {PLATFORM_LABEL[p]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
