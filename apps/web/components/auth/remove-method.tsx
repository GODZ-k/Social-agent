"use client";

import { Button } from "@repo/ui/components/button";
import { AuthDialog } from "./auth-dialog";

/**
 * Confirms removing a method. It closes before the removal runs, because the
 * provider may open its own "confirm it's you" prompt, which a still-open dialog would trap.
 */
export function RemoveMethod({
  title,
  kind,
  description,
  open,
  onCancel,
  onConfirm,
}: {
  /** The full label shown in the heading, e.g. "Passkey on MacBook Pro". */
  title: string;
  /** The short word the buttons use, e.g. "passkey" or "authenticator app". */
  kind: string;
  description: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AuthDialog
      alert
      open={open}
      onOpenChange={(next) => (next ? null : onCancel())}
      title={`Remove the ${title.toLowerCase()}?`}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            Keep {kind}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Remove {kind}
          </Button>
        </>
      }
    />
  );
}
