import { Clock, LoaderCircle } from "lucide-react";
import { Panel } from "@repo/ui/components/states";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { FORMAT_NAME } from "@repo/ui/components/social/format-badge";
import type { DraftingSlot } from "@/modules/content/types";

const STEP_VERB: Record<DraftingSlot["step"], string> = {
  "Making the picture": "making the picture for",
  "Writing the caption": "writing the caption for",
  "Next in line": "starting",
};

/** "making the picture for an Instagram carousel, 5 slides, in your colours". */
function nowLine(slot: DraftingSlot) {
  const article = /^[aeiou]/i.test(PLATFORM_LABEL[slot.platform]) ? "an" : "a";
  const detail = slot.detail ? `, ${slot.detail}` : "";
  return `${STEP_VERB[slot.step]} ${article} ${PLATFORM_LABEL[slot.platform]} ${FORMAT_NAME[slot.format].toLowerCase()}${detail}, in your colours.`;
}

/** FL-4: the inline "drafting N more posts" panel, at the top of the Content page's own
 * layout — not an overlay. Shows overall progress, the step in hand, and the "N of M ready"
 * figure; the placeholder and finished rows for the batch live in the content table itself. */
export function DraftingSummaryPanel({
  readyCount,
  total,
  slots,
  rangeLabel,
  minutesLeft,
}: {
  readyCount: number;
  total: number;
  slots: DraftingSlot[];
  rangeLabel: string;
  minutesLeft: number;
}) {
  const percent = Math.round((readyCount / total) * 100);
  const active = slots[0];
  const done = readyCount >= total;

  return (
    <Panel aria-live="polite" className="mb-5 grid gap-4 sm:grid-cols-[1fr_auto]">
      <div>
        <h2 className="type-heading">Drafting {total} more posts</h2>
        <p className="type-label mt-1">For {rangeLabel}, from your strategy&rsquo;s themes and best times.</p>
        <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
        {active && (
          <p className="mt-3 flex items-center gap-2 text-sm">
            <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />
            <span>
              <b className="font-semibold">Now:</b> {nowLine(active)}
            </span>
          </p>
        )}
      </div>
      <div className="text-right max-sm:text-left max-sm:flex max-sm:items-baseline max-sm:gap-2">
        <b className="block font-display text-[2rem] leading-none font-semibold tracking-tight">
          {readyCount} of {total}
        </b>
        <span className="type-label">{done ? "ready" : `ready, about ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"} left`}</span>
      </div>
      <p className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
        <Clock className="mt-0.5 size-3.5 shrink-0" />
        You can leave this page. Each post appears here as it&rsquo;s ready, and we&rsquo;ll email you when all {total} are waiting for
        approval.
      </p>
    </Panel>
  );
}
