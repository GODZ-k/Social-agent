import type { Strategy } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";

export function CadencePanel({ cadence }: { cadence: Strategy["cadence"] }) {
  return (
    <Panel aria-labelledby="cadence-heading">
      <h2 id="cadence-heading" className="type-heading mb-5">Posting rhythm</h2>
      <ul className="grid gap-5">
        {cadence.map((c) => (
          <li key={c.platform} className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-tint text-tint-foreground">
              <PlatformIcon platform={c.platform} className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">
                {PLATFORM_LABEL[c.platform]}, {c.perWeek} times a week
              </p>
              <p className="type-label mt-0.5">Best at {c.bestTimes.join(", ")}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
