import type { Strategy } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";

export function AudiencePanel({ audience }: { audience: Strategy["audience"] }) {
  return (
    <Panel aria-labelledby="audience-heading">
      <h2 id="audience-heading" className="type-heading">Who it talks to</h2>
      <p className="type-label mt-1 mb-5">From your research.</p>
      <ul className="grid gap-4 lg:grid-cols-3">
        {audience.map((a) => (
          <li key={a.segment} className="rounded-xl bg-secondary/60 p-4">
            <p className="font-semibold">{a.segment}</p>
            <p className="type-label mt-1">{a.note}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
