import { Bookmark, Eye, Heart, MessageCircle } from "lucide-react";
import type { PostMetrics as Metrics } from "@/lib/types";
import { formatCompact } from "@/lib/utils";

const METRIC_META = [
  { key: "reach", label: "Reached", icon: Eye },
  { key: "saves", label: "Saves", icon: Bookmark },
  { key: "likes", label: "Likes", icon: Heart },
  { key: "comments", label: "Comments", icon: MessageCircle },
] as const;

/** The four numbers a published post's results lead with (FL-3), each with its own icon. */
export function PublishedPostMetrics({ metrics }: { metrics: Metrics }) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {METRIC_META.map(({ key, label, icon: Icon }) => (
        <div key={key} className="rounded-2xl bg-secondary p-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3.5" /> {label}
          </dt>
          <dd className="type-number mt-1 text-[1.375rem]">{formatCompact(metrics[key])}</dd>
        </div>
      ))}
    </dl>
  );
}
