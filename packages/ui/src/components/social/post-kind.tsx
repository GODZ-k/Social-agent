import type { Platform, PostFormat } from "./types";
import { PLATFORM_LABEL } from "./platform-names";
import { FORMAT_NAME } from "./format-badge";
import { PlatformLabel } from "./platform-label";
import { cn } from "../../lib/utils";

export interface PostKindFields {
  platform: Platform;
  format: PostFormat;
  /** Carousels only. */
  slides?: number;
  /** Reels and stories only. */
  durationSec?: number;
}

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function duration(seconds: number) {
  if (seconds < 60) return plural(seconds, "second");
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${plural(minutes, "minute")} ${plural(rest, "second")}` : plural(minutes, "minute");
}

/** "5 slides" or "30 seconds", when the post has one. Shared with the chip row (`PostFacts`). */
export function postDetail({ format, slides, durationSec }: PostKindFields) {
  if (format === "carousel" && slides) return plural(slides, "slide");
  if ((format === "reel" || format === "story") && durationSec) return duration(durationSec);
  return null;
}

/** The kind as one plain sentence, for aria-labels and titles: "Instagram carousel, 5 slides". */
export function describePostKind(fields: PostKindFields) {
  const detail = postDetail(fields);
  const kind = `${PLATFORM_LABEL[fields.platform]} ${FORMAT_NAME[fields.format].toLowerCase()}`;
  return detail ? `${kind}, ${detail}` : kind;
}

/** "Instagram carousel, 5 slides", with the platform named in its own colour. */
export function PostKind({ className, ...fields }: PostKindFields & { className?: string }) {
  const detail = postDetail(fields);
  return (
    <span className={cn("inline-flex min-w-0 flex-wrap items-center gap-x-1", className)}>
      <PlatformLabel platform={fields.platform} />
      <span>
        {FORMAT_NAME[fields.format].toLowerCase()}
        {detail && <span className="text-muted-foreground">, {detail}</span>}
      </span>
    </span>
  );
}
