"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import type { AuthResult } from "@/lib/auth/types";
import { FieldNote } from "@/components/form/field-note";
import { AuthDialog } from "@/modules/account/components/auth-dialog";
import { BackupCodesList } from "./backup-codes-list";
import { errorCopy } from "@/lib/auth/error-copy";
import { SavedCodesCheck } from "./saved-codes-check";
import { useAuthSubmit } from "@/hooks/use-auth-submit";

/**
 * "Make new codes": confirm that the old ones stop working, then show the new ones once.
 * The confirm closes before the call so the provider's own "confirm it's you" prompt is not trapped behind it.
 */
export function MakeNewCodes({ make }: { make: () => Promise<AuthResult<string[]>> }) {
  const { pending, error, run } = useAuthSubmit();
  const [confirming, setConfirming] = useState(false);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);

  function confirm() {
    setConfirming(false);
    run(make, (fresh) => {
      setSaved(false);
      setCodes(fresh);
    });
  }

  return (
    <div className="grid justify-items-start gap-1.5">
      <Button variant="outline" size="sm" disabled={pending} onClick={() => setConfirming(true)}>
        Make new codes
      </Button>
      {error ? <FieldNote error>{errorCopy(error.code)}</FieldNote> : null}
      <AuthDialog
        alert
        open={confirming}
        onOpenChange={setConfirming}
        title="Make new backup codes?"
        description="Your unused codes stop working at once. You get new ones, shown one time."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button onClick={confirm}>Make new codes</Button>
          </>
        }
      />
      <AuthDialog
        open={codes !== null}
        onOpenChange={() => undefined}
        title="Your new backup codes"
        description="Your old codes no longer work. This is the only time we show these."
        footer={
          <Button disabled={!saved} onClick={() => setCodes(null)}>
            Done
          </Button>
        }
      >
        <BackupCodesList codes={codes ?? []} />
        <SavedCodesCheck checked={saved} onCheckedChange={setSaved} />
      </AuthDialog>
    </div>
  );
}
