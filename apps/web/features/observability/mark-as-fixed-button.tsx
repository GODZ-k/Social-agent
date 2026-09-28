"use client";

import { Check, LoaderCircle } from "lucide-react";
import { markFrontendErrorFixed } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { Button } from "@repo/ui/components/button";

export function MarkAsFixedButton({ errorId, alreadyFixed }: { errorId: string; alreadyFixed: boolean }) {
  const action = useServerAction(markFrontendErrorFixed, {
    success: "Marked as fixed",
    failure: "Couldn't mark it as fixed.",
  });

  if (alreadyFixed) {
    return (
      <Button variant="outline" disabled>
        <Check /> Fixed
      </Button>
    );
  }

  return (
    <Button onClick={() => action.run(errorId)} disabled={action.isPending}>
      {action.isPending ? <LoaderCircle className="animate-spin" /> : <Check />}
      Mark as fixed
    </Button>
  );
}
