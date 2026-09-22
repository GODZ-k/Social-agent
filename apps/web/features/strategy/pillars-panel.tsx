import type { ContentPillar } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { PillarShare } from "./pillar-share";

export function PillarsPanel({ pillars }: { pillars: ContentPillar[] }) {
  return (
    <Panel aria-labelledby="pillars-heading">
      <h2 id="pillars-heading" className="type-heading">Content pillars</h2>
      <p className="type-label mt-1 mb-6">The themes every post belongs to, and how much of the month each one gets.</p>
      <ul className="grid gap-6">
        {pillars.map((pillar) => (
          <li key={pillar.id} className="grid gap-x-6 gap-y-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center">
            <div>
              <p className="font-medium">{pillar.name}</p>
              <p className="type-label mt-0.5">{pillar.description}</p>
            </div>
            <PillarShare share={pillar.share} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
