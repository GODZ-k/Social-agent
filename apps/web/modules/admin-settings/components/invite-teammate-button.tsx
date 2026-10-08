"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { InviteTeammateDialog } from "./invite-teammate-dialog";

export function InviteTeammateButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus /> Invite a teammate
      </Button>
      <InviteTeammateDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
