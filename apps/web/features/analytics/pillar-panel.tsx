import type { Analytics } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RankedBars } from "@repo/ui/components/social/charts";

export function PillarPanel({ byPillar }: { byPillar: Analytics["byPillar"] }) {
  const pillars = byPillar.map((p) => ({ label: p.name, value: p.reach }));
  return (
    <Panel aria-labelledby="pillar-heading">
      <h2 id="pillar-heading" className="type-heading">Reach by pillar</h2>
      <p className="type-label mt-1 mb-3">Total accounts reached by each content theme.</p>
      <RankedBars rows={pillars} metric="Reach" />
    </Panel>
  );
}
