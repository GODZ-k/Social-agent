import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/states";

export function EmptyQueue({ clientId, done }: { clientId: string; done: number }) {
  return (
    <EmptyState
      icon={<PartyPopper />}
      title={done > 0 ? "That's all of them" : "Nothing to approve"}
      description={
        done > 0
          ? `You went through ${done} ${done === 1 ? "post" : "posts"}. Approved ones are on the calendar.`
          : "New drafts from the agent will show up here before anything is scheduled."
      }
      action={<Button asChild><Link href={`/c/${clientId}/calendar`}>Open calendar</Link></Button>}
    />
  );
}
