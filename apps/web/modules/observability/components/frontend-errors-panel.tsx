"use client";

import { useMemo, useState } from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Check, ChevronRight } from "lucide-react";
import type { FrontendErrorRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";
import { Segmented } from "@repo/ui/components/segmented";
import { RowList } from "./row-list";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { routes } from "@/config/routes";
import type { RowListColumn } from "@/modules/observability/types";

type Filter = "unresolved" | "new" | "fixed";

const COLUMNS: RowListColumn<FrontendErrorRow>[] = [
  {
    header: "Error and page",
    main: true,
    render: (e) => (
      <span className="min-w-0">
        <span className="block font-mono text-[0.8125rem]">{e.message}</span>
        <span className="type-label block">
          <span className="font-mono">{e.page}</span>. {e.effect}
        </span>
        {e.newInRelease && (
          <Badge variant="danger" className="mt-1.5">
            New in this release
          </Badge>
        )}
      </span>
    ),
  },
  { header: "People", align: "right", width: "4.5rem", render: (e) => <span className="font-medium">{e.people}</span> },
  { header: "Times", align: "right", width: "4rem", render: (e) => e.times },
  { header: "First seen", align: "right", width: "7rem", render: (e) => format(parseISO(e.firstSeenAt), "d MMM, h:mm a") },
  { header: "Last seen", align: "right", width: "6.5rem", render: (e) => formatDistanceToNow(parseISO(e.lastSeenAt), { addSuffix: true }) },
];

/** Errors grouped by cause, most people first. Open one for where it happens and what the person did. */
export function FrontendErrorsPanel({ errors, hiddenNoise }: { errors: FrontendErrorRow[]; hiddenNoise: number }) {
  const [filter, setFilter] = useState<Filter>("unresolved");
  const filtered = useMemo(() => {
    if (filter === "fixed") return errors.filter((e) => e.status === "fixed");
    if (filter === "new") return errors.filter((e) => e.newInRelease && e.status === "unresolved");
    return errors.filter((e) => e.status === "unresolved");
  }, [errors, filter]);

  return (
    <Panel id="errors">
      <PanelHeader
        title="Errors people hit"
        description="Grouped by cause, most people first. Open one for where it happens and what the person did."
        right={<PanelStat value={errors.filter((e) => e.status === "unresolved").length} caption="Unresolved" />}
      />
      <Segmented
        label="Filter errors"
        value={filter}
        onValueChange={setFilter}
        options={[
          { value: "unresolved", label: "Unresolved" },
          { value: "new", label: "New" },
          { value: "fixed", label: "Fixed" },
        ]}
        className="mb-4"
      />
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nothing here.</p>
      ) : (
        <RowList columns={COLUMNS} rows={filtered} rowKey={(e) => e.id} href={(e) => routes.admin.observability.frontendError(e.id)} />
      )}
      {hiddenNoise > 0 && (
        <div className="mt-4 flex items-center gap-2 border-t pt-4 text-sm text-muted-foreground">
          <Check className="size-4 text-success" />
          <span>{hiddenNoise} errors from browser extensions and bots are hidden.</span>
          <button type="button" className="ml-auto inline-flex items-center gap-0.5 font-medium text-tint-foreground">
            Show them <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </Panel>
  );
}
