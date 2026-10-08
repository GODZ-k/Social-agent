"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { LoaderCircle, Mail, Send } from "lucide-react";
import { cancelInvite, resendInvite } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { AdminClientRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { Lightbox } from "@repo/ui/components/lightbox";
import { routes } from "@/config/routes";

/** ADM-4, invited state: when the invite was sent, and how to resend or cancel it. */
export function InviteBanner({ client }: { client: AdminClientRow }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const resend = useServerAction(resendInvite, { success: "Invite sent again", failure: "Couldn't resend it." });
  const cancel = useServerAction(cancelInvite, {
    success: "Invite cancelled",
    failure: "Couldn't cancel it.",
    onSuccess: () => router.push(routes.admin.clients.list),
  });

  return (
    <>
      <Panel className="mb-5 flex flex-wrap items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
          <Mail className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Invite sent {format(parseISO(client.invitedAt!), "d MMM")}, not opened yet</p>
          <p className="type-label mt-0.5">The link in {client.email}&rsquo;s inbox works for 30 days.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" onClick={() => setConfirming(true)}>
            Cancel invite
          </Button>
          <Button variant="outline" onClick={() => resend.run(client.id)} disabled={resend.isPending}>
            {resend.isPending ? <LoaderCircle className="animate-spin" /> : <Send />}
            Resend invite
          </Button>
        </div>
      </Panel>

      <Lightbox open={confirming} onOpenChange={setConfirming} title="Cancel invite">
        <div className="grid w-[min(92vw,26rem)] gap-4 rounded-2xl bg-card p-6 text-foreground shadow-floating">
          <div className="grid size-11 place-items-center rounded-full bg-destructive/12 text-destructive">
            <Mail className="size-5" />
          </div>
          <div>
            <h2 className="type-heading">Cancel {client.name ?? client.email}&rsquo;s invite?</h2>
            <p className="type-label mt-1.5">The sign-in link in their email stops working, and they leave your client list. You can invite them again any time.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Keep invite
            </Button>
            <Button variant="destructive" onClick={() => cancel.run(client.id)} disabled={cancel.isPending}>
              {cancel.isPending && <LoaderCircle className="animate-spin" />}
              Cancel invite
            </Button>
          </div>
        </div>
      </Lightbox>
    </>
  );
}
