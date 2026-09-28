import { formatDistanceToNow, parseISO } from "date-fns";
import type { FrontendErrorDetail } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RowList, type RowListColumn } from "./row-list";

type ClientHit = FrontendErrorDetail["clients"][number];

const COLUMNS: RowListColumn<ClientHit>[] = [
  { header: "Client", render: (c) => <span className="font-medium">{c.name}</span> },
  { header: "Hit it", align: "right", render: (c) => `${c.times} times` },
  { header: "Last", align: "right", render: (c) => formatDistanceToNow(parseISO(c.lastAt), { addSuffix: true }) },
];

/** Clients whose people saw this error. */
export function WhoHitItPanel({ clients }: { clients: FrontendErrorDetail["clients"] }) {
  return (
    <Panel>
      <h2 className="type-heading">Who hit it</h2>
      <p className="type-label mt-1 mb-4">Clients whose people saw this error.</p>
      <RowList columns={COLUMNS} rows={clients} rowKey={(c) => c.brandId} />
    </Panel>
  );
}
