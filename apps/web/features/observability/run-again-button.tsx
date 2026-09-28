"use client";

import { LoaderCircle, RotateCw } from "lucide-react";
import { rerunAgentRun } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { Button } from "@repo/ui/components/button";

/** OBS-3: starts this run again with the same input. */
export function RunAgainButton({ runId }: { runId: string }) {
  const action = useServerAction(rerunAgentRun, {
    success: "Started the run again",
    failure: "Couldn't start it again.",
  });

  return (
    <Button onClick={() => action.run(runId)} disabled={action.isPending}>
      {action.isPending ? <LoaderCircle className="animate-spin" /> : <RotateCw />}
      Run again
    </Button>
  );
}
