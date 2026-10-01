import { formatDistanceToNow, parseISO } from "date-fns";
import type { FrontendErrorDetail } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RowList, type RowListColumn } from "./row-list";
import { PanelHeader } from "@repo/ui/components/panel-header";

type BrandHit = FrontendErrorDetail["brands"][number];

const COLUMNS: RowListColumn<BrandHit>[] = [
  { header: "Brand", render: (c) => <span className="font-medium">{c.name}</span> },
  { header: "Hit it", align: "right", render: (c) => `${c.times} times` },
  { header: "Last", align: "right", render: (c) => formatDistanceToNow(parseISO(c.lastAt), { addSuffix: true }) },
];

/** Clients whose people saw this error. */
export function WhoHitItPanel({ brands }: { brands: FrontendErrorDetail["brands"] }) {
  return (
    <Panel>
      <PanelHeader title="Who hit it" description="Clients whose people saw this error." />
      <RowList columns={COLUMNS} rows={brands} rowKey={(c) => c.brandId} />
    </Panel>
  );
}
