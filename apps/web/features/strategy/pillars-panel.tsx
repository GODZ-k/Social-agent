import type { ContentPillar } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { PillarShare } from "./pillar-share";

export function PillarsPanel({ pillars }: { pillars: ContentPillar[] }) {
  return (
    <Panel aria-labelledby="pillars-heading">
      <h2 id="pillars-heading" className="type-heading">What you&apos;ll post about</h2>
      <p className="type-label mt-1 mb-3 border-b border-border pb-3">
        {pillars.length} themes, and each one&apos;s share of the week.
      </p>
      <ul>
        {pillars.map((pillar) => (
          <li key={pillar.id} className="border-t border-border py-3.5 first:border-t-0 first:pt-2">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-medium">{pillar.name}</p>
              <p className="type-label shrink-0">{pillar.share}%</p>
            </div>
            <p className="type-label mt-0.5">{pillar.description}</p>
            <PillarShare share={pillar.share} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
