"use client";

import { LoaderCircle, RefreshCw } from "lucide-react";
import { runResearch } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { Button } from "@repo/ui/components/button";

export function RunResearchButton({ clientId }: { clientId: string }) {
  const research = useServerAction(runResearch, { success: "Researching again" });

  return (
    <Button variant="outline" disabled={research.isPending} onClick={() => research.run(clientId)}>
      {research.isPending ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
      Run research again
    </Button>
  );
}
