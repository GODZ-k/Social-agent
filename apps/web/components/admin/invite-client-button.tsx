"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { InviteClientDialog } from "./invite-client-dialog";

/** The "Invite a client" button and its dialog. `?invite=1` opens it on load. */
export function InviteClientButton({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus /> Invite a client
      </Button>
      <InviteClientDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
