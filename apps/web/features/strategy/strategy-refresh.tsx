"use client";

import { cn } from "@/lib/utils";
import { PageHeader } from "@repo/ui/components/states";
import { RefreshButton } from "./refresh-button";
import { useRegenerateStrategy } from "./use-regenerate-strategy";

/**
 * Owns the rewrite action so the page header's button and the strategy it
 * rewrites share one pending state: the panels dim while the new version
 * is on its way. The panels arrive as children, rendered on the server.
 */
export function StrategyRefresh({ clientId, disabled, children }: { clientId: string; disabled?: boolean; children: React.ReactNode }) {
  const { regenerate, isPending } = useRegenerateStrategy(clientId);

  return (
    <>
      <PageHeader
        title="Strategy"
        description="What the agent plans to post, how often, and why. It rewrites this each time results come in."
        actions={
          <RefreshButton
            isPending={isPending}
            disabled={disabled}
            idleLabel="Rewrite from latest results"
            busyLabel="Rewriting from latest results"
            variant="outline"
            onClick={regenerate}
          />
        }
      />
      <div className={cn("grid gap-5 transition-opacity duration-300", isPending && "opacity-55")} aria-busy={isPending}>
        {children}
      </div>
    </>
  );
}
