import { format } from "date-fns";
import { Clock } from "lucide-react";
import type { ResearchView } from "@/lib/types";

export function ResearchVersionPill({ growthBrief }: { growthBrief: NonNullable<ResearchView["growthBrief"]> }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-3.5 py-1.5 text-[0.8125rem] text-muted-foreground">
      <Clock className="size-3.5" />
      Version {growthBrief.version}, {format(new Date(growthBrief.createdAt), "d MMMM")}
    </span>
  );
}
