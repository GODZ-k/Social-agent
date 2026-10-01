import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Panel } from "@repo/ui/components/states";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { BarList } from "@repo/ui/components/bar-list";
import { formatUsd } from "./format";

/** Who the AI spend was for, ranked highest first: a labelled bar per client, its dollar value at the right. */
export function CostByClientPanel({
  title,
  description,
  rows,
  clientsHref,
}: {
  title: string;
  description: string;
  rows: { brandId: string; name: string; cost: number }[];
  clientsHref?: string;
}) {
  const total = rows.reduce((sum, r) => sum + r.cost, 0);
  return (
    <Panel>
      <PanelHeader
        title={title}
        description={description}
        right={<PanelStat value={formatUsd(total)} caption={rows.length === 1 ? "Top client" : `Top ${rows.length} clients`} />}
      />
      <BarList rows={rows} keyOf={(row) => row.brandId} labelOf={(row) => row.name} valueOf={(row) => row.cost} formatValue={formatUsd} />
      {clientsHref && (
        <p className="mt-4">
          <Link href={clientsHref} className="inline-flex items-center gap-0.5 text-sm font-medium text-tint-foreground hover:underline">
            All clients <ChevronRight className="size-3.5" />
          </Link>
        </p>
      )}
    </Panel>
  );
}
