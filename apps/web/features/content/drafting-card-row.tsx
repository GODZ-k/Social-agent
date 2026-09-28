import { format, parseISO } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { FORMAT_NAME } from "@repo/ui/components/social/format-badge";
import { DraftingStep } from "./drafting-step";
import type { DraftingSlot } from "./use-generate-posts";

/** FL-4: `DraftingTableRow`'s phone/tablet twin, same columns folded into one card. */
export function DraftingCardRow({ slot }: { slot: DraftingSlot }) {
  return (
    <li aria-busy className="flex items-center gap-3 p-3">
      <span className="skeleton size-14 shrink-0 rounded-xl" />
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="skeleton block h-3 w-32 rounded-full" />
        <DraftingStep step={slot.step} />
        <span className="flex items-center gap-1.5 text-sm">
          <PlatformIcon platform={slot.platform} className="size-3.5 text-muted-foreground" />
          <b className="font-medium">
            {PLATFORM_LABEL[slot.platform]} {FORMAT_NAME[slot.format].toLowerCase()}
          </b>
          {slot.detail && <span className="text-muted-foreground">, {slot.detail}</span>}
        </span>
        <Badge variant="tint">
          <LoaderCircle className="animate-spin" /> Drafting
        </Badge>
        <span className="flex items-baseline gap-1.5 text-sm">
          <span className="tabular-nums">{format(parseISO(slot.scheduledFor), "EEE d MMM, h:mm a")}</span>
          <span className="type-label">Best time from your strategy</span>
        </span>
      </span>
    </li>
  );
}
