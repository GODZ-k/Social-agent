"use client";

import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { signOutOtherDevices } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { Button } from "@repo/ui/components/button";
import { AuthDialog } from "@/components/auth/auth-dialog";

/** BA-2: confirms before ending every other session, since it signs other devices out at once. */
export function SignOutDevicesButton({ otherCount }: { otherCount: number }) {
  const [open, setOpen] = useState(false);
  const signOut = useServerAction(signOutOtherDevices, { success: "Signed out other devices", onSuccess: () => setOpen(false) });

  if (otherCount === 0) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <LogOut />
        Sign out other devices
      </Button>
      <AuthDialog
        alert
        open={open}
        onOpenChange={setOpen}
        title={`Sign out ${otherCount} other ${otherCount === 1 ? "device" : "devices"}?`}
        description="Anyone using them is signed out at once. You stay signed in here; next time, those devices ask for your password."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={signOut.isPending} onClick={() => signOut.run()}>
              {signOut.isPending && <LoaderCircle className="animate-spin" />}
              Sign out {otherCount} {otherCount === 1 ? "device" : "devices"}
            </Button>
          </>
        }
      />
    </>
  );
}
