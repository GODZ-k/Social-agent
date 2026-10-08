import { format, parseISO } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { DraftingStep } from "./drafting-step";
import { PlatformFormatCell } from "./platform-format";
import type { DraftingSlot } from "@/modules/content/types";

/** FL-4: one post still drafting, as a real table row — same columns as a finished post,
 * its name replaced by the live step while the thumbnail and caption are still skeletons.
 * Its time is labelled as the strategy's pick rather than "in N days": nothing is scheduled yet. */
export function DraftingTableRow({ slot }: { slot: DraftingSlot }) {
  return (
    <tr aria-busy className="border-b last:border-0">
      <td className="w-[38%] max-w-0 px-5 py-3">
        <span className="flex min-w-0 items-center gap-3.5">
          <span className="skeleton size-11 shrink-0 rounded-md" />
          <span className="min-w-0 flex-1">
            <span className="skeleton block h-3 w-32 rounded-full" />
            <DraftingStep step={slot.step} className="mt-1.5" />
          </span>
        </span>
      </td>
      <td className="px-5 py-3">
        <PlatformFormatCell platform={slot.platform} format={slot.format} detail={slot.detail} />
      </td>
      <td className="px-5 py-3">
        <Badge variant="tint">
          <LoaderCircle className="animate-spin" /> Drafting
        </Badge>
      </td>
      <td className="px-5 py-3 whitespace-nowrap">
        <span className="block tabular-nums">{format(parseISO(slot.scheduledFor), "EEE d MMM, h:mm a")}</span>
        <span className="type-label">Best time from your strategy</span>
      </td>
      <td className="px-5 py-3" />
    </tr>
  );
}
