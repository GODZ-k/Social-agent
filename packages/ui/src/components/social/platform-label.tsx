import type { Platform } from "./types";
import { PLATFORM_LABEL } from "./platform-names";
import { PlatformIcon } from "./platform";
import { cn } from "../../lib/utils";

/**
 * Each network's own colour, one shade per theme, checked to read as text at
 * 4.5:1 on the page, cards and secondary fills. TikTok's is black, so it
 * follows the foreground and stays visible in dark mode.
 */
export const PLATFORM_TEXT: Record<Platform, string> = {
  instagram: "text-[#b52f7b] dark:text-[#f06ba8]",
  facebook: "text-[#0a5ce0] dark:text-[#5aa0ff]",
  linkedin: "text-[#0a66c2] dark:text-[#71b7fb]",
  tiktok: "text-foreground",
};

/** The network, named in its own colour. Never an icon alone. */
export function PlatformLabel({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-semibold", PLATFORM_TEXT[platform], className)}>
      <span aria-hidden className="contents">
        <PlatformIcon platform={platform} className="size-[1.1em]" />
      </span>
      {PLATFORM_LABEL[platform]}
    </span>
  );
}
