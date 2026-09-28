"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, List, Lock, Plus, Smartphone, Trash2 } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@repo/ui/components/states";
import { useTwoFactorMethods } from "@/lib/auth/client";
import { canRemoveMethod } from "@/lib/auth/rules";
import type { TwoFactorMethod } from "@/lib/auth/types";
import { FieldNote } from "@/components/auth/field-note";
import { Notice } from "@/components/auth/notice";
import { errorCopy } from "./error-copy";
import { MakeNewCodes } from "./make-new-codes";
import { MethodRow } from "./method-row";
import { RemoveMethod } from "./remove-method";
import { useAuthSubmit } from "./use-auth-submit";

const SETUP = "/two-factor/setup?redirect_url=/two-factor/manage";

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
 * AUTH-7 manage: the methods, backup codes and the rules around them. Admins
 * can never remove their last method; clients can turn two-factor off.
 */
export function TwoFactorManage({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const { ready, methods, backupCodes, removeMethod, makeNewBackupCodes } = useTwoFactorMethods();
  const [removing, setRemoving] = useState<TwoFactorMethod | null>(null);
  const { pending, error, run } = useAuthSubmit();

  if (!ready) return <div className="skeleton h-72 w-full" role="status" aria-label="Loading" />;

  function confirmRemove() {
    if (!removing) return;
    const { id } = removing;
    setRemoving(null);
    run(
      () => removeMethod(id),
      () => router.refresh(),
    );
  }

  const on = methods.length > 0;
  const removable = canRemoveMethod(methods, isAdmin);
  const codesDetail = backupCodes.remaining === null ? "Each code works once." : `${backupCodes.remaining} left. Each code works once.`;

  return (
    <Panel aria-labelledby="tf-title">
      <div className="mb-4">
        <h2 id="tf-title" className="type-heading flex flex-wrap items-center gap-2">
          Two-factor sign-in
          {on ? (
            <Badge variant="success">
              <Check className="size-3.5" aria-hidden />
              On
            </Badge>
          ) : (
            <Badge>Off</Badge>
          )}
        </h2>
        <p className="type-label mt-1 text-muted-foreground">
          {isAdmin
            ? "A second step after your password. Admin accounts need at least one method, so it can't be turned off."
            : "A second step after your password. It keeps your brand safe even if someone learns your password."}
        </p>
      </div>
      {error ? <Notice tone="error">{errorCopy(error.code)}</Notice> : null}
      <div className="divide-y">
        {methods.map((method) => {
          const title = methodTitle(method);
          const noteId = `last-${method.id}`;
          return (
            <MethodRow
              key={method.id}
              icon={method.kind === "passkey" ? Lock : Smartphone}
              title={title}
              detail={methodDetail(method)}
              note={removable ? null : <FieldNote id={noteId}>You can&apos;t remove your only method. Admin accounts always need one.</FieldNote>}
            >
              <Button
                variant="ghost"
                size="sm"
                disabled={!removable || pending}
                aria-describedby={removable ? undefined : noteId}
                aria-label={`Remove ${title.toLowerCase()}`}
                onClick={() => setRemoving(method)}
              >
                <Trash2 />
                Remove
              </Button>
            </MethodRow>
          );
        })}
        {on && backupCodes.enabled ? (
          <MethodRow icon={List} title="Backup codes" detail={codesDetail}>
            <MakeNewCodes make={makeNewBackupCodes} />
          </MethodRow>
        ) : null}
      </div>
      {on ? null : (
        <Button asChild className="mt-4">
          <Link href={SETUP}>
            <Plus />
            Turn on two-factor
          </Link>
        </Button>
      )}
      <RemoveMethod
        title={removing ? methodTitle(removing) : ""}
        kind={removing ? methodKind(removing) : ""}
        description={removing ? whatsLeft(removing, methods, backupCodes.enabled) : ""}
        open={removing !== null}
        onCancel={() => setRemoving(null)}
        onConfirm={confirmRemove}
      />
    </Panel>
  );
}
