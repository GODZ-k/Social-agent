"use client";

import { useState } from "react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { useTwoFactorMethods } from "@/lib/auth/client";
import { canRemoveMethod } from "@/lib/auth/rules";
import type { TwoFactorMethod } from "@/lib/auth/types";
import { FieldNote } from "@/components/auth/field-note";
import { Notice } from "@/components/auth/notice";
import { errorCopy } from "@/components/auth/error-copy";
import { MakeNewCodes } from "@/components/auth/make-new-codes";
import { RemoveMethod } from "@/components/auth/remove-method";
import { useAuthSubmit } from "@/hooks/use-auth-submit";
import { AccountRow, AccountSection } from "./account-row";

function methodTitle(method: TwoFactorMethod): string {
  if (method.kind !== "passkey") return "Authenticator app";
  return method.name ? `Passkey on ${method.name}` : "Passkey";
}

function methodKind(method: TwoFactorMethod): string {
  return method.kind === "passkey" ? "passkey" : "authenticator app";
}

/** What's left to sign in with once this one method is gone, for the remove-confirm dialog. */
function whatsLeft(removing: TwoFactorMethod, methods: readonly TwoFactorMethod[], backupCodesEnabled: boolean): string {
  const other = methods.find((method) => method.id !== removing.id);
  const parts = [other ? `your ${methodKind(other)}` : null, backupCodesEnabled ? "your backup codes" : null].filter(Boolean);
  if (parts.length === 0) return "You won't be able to sign in with it any more.";
  return `You won't be able to sign in with it. You still have ${parts.join(" and ")}.`;
}

function methodDetail(method: TwoFactorMethod): string {
  const added = method.addedAt ? `Added ${method.addedAt.toLocaleDateString()}.` : null;
  const used = method.lastUsedAt ? `Last used ${method.lastUsedAt.toLocaleDateString()}.` : "Not used yet.";
  return added ? `${added} ${used}` : used;
}

/**
 * Two-factor as part of the account, the way Clerk's own profile holds it: the
 * methods, the backup codes and turning it on all happen here, over the page you
 * were on. `/two-factor/setup` is left for the times something *requires* it and
 * the person has not signed in far enough to open this dialog.
 */
export function TwoFactorSection({ isAdmin, onTurnOn }: { isAdmin: boolean; onTurnOn: () => void }) {
  const { ready, methods, backupCodes, removeMethod, makeNewBackupCodes } = useTwoFactorMethods();
  const [removing, setRemoving] = useState<TwoFactorMethod | null>(null);
  const { pending, error, run } = useAuthSubmit();

  if (!ready) return <div className="skeleton h-40 w-full rounded-xl" role="status" aria-label="Loading" />;

  const on = methods.length > 0;
  const removable = canRemoveMethod(methods, isAdmin);
  const codesDetail = backupCodes.remaining === null ? "Each code works once." : `${backupCodes.remaining} left. Each code works once.`;

  function confirmRemove() {
    if (!removing) return;
    const { id } = removing;
    setRemoving(null);
    run(() => removeMethod(id));
  }

  return (
    <AccountSection title="Two-factor sign-in">
      {error ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}

      <AccountRow
        label="Two-factor"
        action={
          on ? null : (
            <Button size="sm" onClick={onTurnOn}>
              Turn on
            </Button>
          )
        }
      >
        <p className="flex flex-wrap items-center gap-2 font-medium">
          {on ? "On" : "Off"}
          {on && <Badge variant="success">Protected</Badge>}
        </p>
        <p className="type-label mt-1 text-muted-foreground">
          {isAdmin
            ? "A second step after your password. Admin accounts need at least one method, so it can't be turned off."
            : "A second step after your password. Takes about a minute to set up."}
        </p>
      </AccountRow>

      {methods.map((method) => {
        const title = methodTitle(method);
        const noteId = `last-${method.id}`;
        return (
          <AccountRow
            key={method.id}
            label={title}
            action={
              <Button
                variant="ghost"
                size="sm"
                disabled={!removable || pending}
                aria-describedby={removable ? undefined : noteId}
                aria-label={`Remove ${title.toLowerCase()}`}
                onClick={() => setRemoving(method)}
              >
                Remove
              </Button>
            }
          >
            <p className="type-label text-muted-foreground">{methodDetail(method)}</p>
            {removable ? null : <FieldNote id={noteId}>You can&apos;t remove your only method. Admin accounts always need one.</FieldNote>}
          </AccountRow>
        );
      })}

      {on && backupCodes.enabled ? (
        <AccountRow label="Backup codes" action={<MakeNewCodes make={makeNewBackupCodes} />}>
          <p className="type-label text-muted-foreground">{codesDetail}</p>
        </AccountRow>
      ) : null}

      <RemoveMethod
        title={removing ? methodTitle(removing) : ""}
        kind={removing ? methodKind(removing) : ""}
        description={removing ? whatsLeft(removing, methods, backupCodes.enabled) : ""}
        open={removing !== null}
        onCancel={() => setRemoving(null)}
        onConfirm={confirmRemove}
      />
    </AccountSection>
  );
}
