import { format, parseISO } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { DraftingStep } from "./drafting-step";
import { PlatformFormatLine } from "./platform-format";
import type { DraftingSlot } from "@/hooks/use-generate-posts";

/** FL-4: `DraftingTableRow`'s phone/tablet twin, same columns folded into one card. */
export function DraftingCardRow({ slot }: { slot: DraftingSlot }) {
  return (
    <li aria-busy className="flex items-center gap-3 p-3">
      <span className="skeleton size-14 shrink-0 rounded-xl" />
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="skeleton block h-3 w-32 rounded-full" />
        <DraftingStep step={slot.step} />
        <PlatformFormatLine platform={slot.platform} format={slot.format} detail={slot.detail} />
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
