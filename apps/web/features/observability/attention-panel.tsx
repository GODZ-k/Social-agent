import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Activity, AlertCircle, Check, ChevronRight } from "lucide-react";
import type { AttentionItem, ObsRange } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { rangePhrase } from "./format";

const TARGET_HREF: Record<AttentionItem["kind"], (id: string) => string> = {
  frontend_error: (id) => `/admin/observability/frontend/${id}`,
  agent_run: (id) => `/admin/observability/agents/${id}`,
  slow_route: () => "/admin/observability/server",
};

const LINK_LABEL: Record<AttentionItem["kind"], string> = {
  frontend_error: "View error",
  agent_run: "View run",
  slow_route: "View route",
};

/** Problems from the window, newest first, plus how many cleared on their own. A slow route is a warning; the rest are errors. */
export function AttentionPanel({ items, clearedOnTheirOwn, range }: { items: AttentionItem[]; clearedOnTheirOwn: number; range: ObsRange }) {
  return (
    <Panel>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="type-heading">Needs attention</h2>
          <p className="type-label mt-1">Problems from {rangePhrase(range)}, newest first.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{items.length}</p>
          <p className="type-label mt-0.5">Open</p>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Nothing needs you right now.</p>
      ) : (
        <div className="grid gap-2.5">
          {items.map((item) => {
            const warning = item.kind === "slow_route";
            return (
              <Link
                key={item.id}
                href={TARGET_HREF[item.kind](item.targetId)}
                className={warning ? "flex items-start gap-3.5 rounded-xl bg-warning/7 p-4 hover:brightness-98" : "flex items-start gap-3.5 rounded-xl bg-destructive/6 p-4 hover:brightness-98"}
              >
                {warning ? (
                  <Activity aria-hidden className="mt-0.5 size-4.5 shrink-0 animate-pulse text-warning" />
                ) : (
                  <AlertCircle aria-hidden className="mt-0.5 size-4.5 shrink-0 text-destructive" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="type-label mt-1">
                    {item.detail} {format(parseISO(item.at), "d MMM, h:mm a")}
                  </p>
                </div>
                <span className="type-label mt-0.5 flex shrink-0 items-center gap-0.5 font-medium text-tint-foreground">
                  {LINK_LABEL[item.kind]}
                  <ChevronRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
      {clearedOnTheirOwn > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
          <p className="type-label flex items-center gap-2">
            <Check className="size-4 text-success" />
            {clearedOnTheirOwn} problems cleared on their own in {rangePhrase(range)}.
          </p>
          <Link href="/admin/observability" className="type-label flex shrink-0 items-center gap-0.5 font-medium text-tint-foreground">
            History
            <ChevronRight className="size-4" />
          </Link>
        </div>
      )}
    </Panel>
  );
}
