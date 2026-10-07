"use client";

import { Check } from "lucide-react";
import type { Strategy } from "@/lib/types";
import { startStrategyNow } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { CountdownRing } from "./countdown-ring";
import { useCountdownMinutes } from "@/hooks/use-countdown-minutes";

/** S20a: a fresh draft, counting down to when it starts on its own. */
export function StrategyDraftBanner({ strategy, onAskForChanges }: { strategy: Strategy; onAskForChanges: () => void }) {
  const minutes = useCountdownMinutes(strategy.autoStartsAt);
  const start = useServerAction(startStrategyNow, { success: "Your strategy started" });

  return (
    <Panel className="flex flex-wrap items-center gap-5 bg-tint shadow-none lg:flex-nowrap">
      <CountdownRing minutes={minutes} />
      <div className="min-w-0 flex-1">
        <h2 className="type-heading">Your first week is ready to check</h2>
        <p className="type-label mt-1">
          It starts on its own in {minutes} minute{minutes === 1 ? "" : "s"} if you change nothing. Starting only lets
          the agent draft posts; each one still waits for your approval.
        </p>
      </div>
      <div className="flex w-full gap-2.5 lg:w-auto">
        <Button variant="outline" className="flex-1 lg:flex-none" onClick={onAskForChanges}>
          Ask for changes
        </Button>
        <Button className="flex-1 lg:flex-none" disabled={start.isPending} onClick={() => start.run(strategy.brandId)}>
          <Check />
          {start.isPending ? "Starting" : "Start now"}
        </Button>
      </div>
    </Panel>
  );
}
