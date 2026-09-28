import { Users } from "lucide-react";
import { EmptyState } from "@repo/ui/components/states";
import { InviteClientButton } from "./invite-client-button";

/** ADM-2: no clients at all yet, with how inviting one works. */
export function NoClientsEmpty() {
  return (
    <EmptyState
      icon={<Users />}
      title="No clients yet"
      description="Invite a business owner to get started. You can set up their brand before they first sign in."
      action={
        <div className="grid gap-5">
          <InviteClientButton />
          <ol className="grid gap-2 text-left text-sm text-muted-foreground">
            <li className="flex gap-2.5"><span className="font-medium text-foreground">1</span>They get an email with a link to sign in.</li>
            <li className="flex gap-2.5"><span className="font-medium text-foreground">2</span>You or they add their website, and the agent drafts a brand kit.</li>
            <li className="flex gap-2.5"><span className="font-medium text-foreground">3</span>They approve every post before it goes out. You can approve for them too.</li>
          </ol>
        </div>
      }
    />
  );
}
