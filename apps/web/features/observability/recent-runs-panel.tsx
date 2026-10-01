import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Bot, Check, ChevronRight, X } from "lucide-react";
import type { AgentRunRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";
import { RowList, type RowListColumn } from "./row-list";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { BrandBadge } from "./brand-badge";
import { formatUsd } from "./format";

const STATUS_VARIANT = { ok: "success", error: "danger", running: "tint" } as const;
const STATUS_LABEL = { ok: "OK", error: "Error", running: "Running" } as const;
const STATUS_ICON = { ok: Check, error: X, running: null } as const;

const COLUMNS: RowListColumn<AgentRunRow>[] = [
  { header: "Started", width: "8rem", render: (r) => <span className="text-muted-foreground">{format(parseISO(r.startedAt), "d MMM, h:mm a")}</span> },
  { header: "Agent", width: "9rem", render: (r) => <span className="flex items-center gap-1.5 font-medium"><Bot className="size-4 text-muted-foreground" />{r.agent}</span> },
  { header: "Asked to", main: true, render: (r) => <span className="block truncate">{r.task}</span> },
  { header: "Client", width: "9rem", render: (r) => <BrandBadge name={r.brandName} /> },
  {
    header: "Status",
    render: (r) => {
      const Icon = STATUS_ICON[r.status];
      return (
        <Badge variant={STATUS_VARIANT[r.status]}>
          {Icon && <Icon />} {STATUS_LABEL[r.status]}
        </Badge>
      );
    },
  },
  { header: "Cost", align: "right", width: "5rem", render: (r) => formatUsd(r.cost) },
];

/** Every agent run, newest first. Open one to see each step. */
export function RecentRunsPanel({ runs }: { runs: AgentRunRow[] }) {
  return (
    <Panel>
      <PanelHeader title="Recent runs" description="Every agent run, newest first. Open one to see each step." />
      <RowList columns={COLUMNS} rows={runs} rowKey={(r) => r.id} href={(r) => `/admin/observability/agents/${r.id}`} cardBelow="lg" />
      <Link href="/admin/observability/agents?range=30d" className="mt-4 inline-flex items-center gap-0.5 text-sm font-medium text-tint-foreground hover:underline">
        All runs
        <ChevronRight className="size-3.5" />
      </Link>
    </Panel>
  );
}
