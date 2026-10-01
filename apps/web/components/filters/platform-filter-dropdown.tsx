"use client";

import { ChevronDown, Layers } from "lucide-react";
import type { Platform } from "@social-agent/shared";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/dropdown-menu";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";

/**
 * "All platforms" filter, shared by the content toolbar and the calendar. It needs Cadence's
 * `Platform` type, so it cannot live in `packages/ui`; it sits here rather than inside either
 * feature, so neither has to reach into the other.
 */
export function PlatformFilterDropdown({
  platform,
  onChange,
  platforms,
  align = "start",
}: {
  platform: Platform | "";
  onChange: (next: Platform | "") => void;
  platforms: Platform[];
  align?: "start" | "end";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="pressable flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-card px-3.5 text-sm font-medium ring-1 ring-border">
        <Layers className="size-4 text-muted-foreground" />
        {platform ? PLATFORM_LABEL[platform] : "All platforms"}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
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
