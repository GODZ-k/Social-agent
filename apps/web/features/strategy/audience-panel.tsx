import type { Strategy } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";

export function AudiencePanel({ audience }: { audience: Strategy["audience"] }) {
  return (
    <Panel aria-labelledby="audience-heading">
      <h2 id="audience-heading" className="type-heading mb-5">Who it&apos;s talking to</h2>
      <dl className="grid gap-4">
        {audience.map((a) => (
          <div key={a.segment}>
            <dt className="type-label">{a.segment}</dt>
            <dd>{a.note}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
