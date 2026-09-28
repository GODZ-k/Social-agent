"use client";

import { KeyRound } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import type { AuthError, AuthResult, AuthStep } from "@/lib/auth/types";
import { FieldNote } from "@/components/auth/field-note";
import { errorCopy } from "./error-copy";
import { useAuthSubmit } from "./use-auth-submit";

/** The passkey route at sign-in. Only rendered when the auth provider supports passkeys as a second step. */
export function PasskeyButton({ verify, onPaused }: { verify: () => Promise<AuthResult<AuthStep>>; onPaused: (error: AuthError) => void }) {
  const { pending, error, run } = useAuthSubmit();
  const pauseIfLocked = (failure: AuthError) => {
    if (failure.code === "too_many_attempts") onPaused(failure);
  };
  return (
    <div className="grid gap-1.5">
      <Button type="button" variant="outline" size="lg" className="w-full" disabled={pending} aria-busy={pending || undefined} onClick={() => run(verify, undefined, pauseIfLocked)}>
        <KeyRound />
        {pending ? "Waiting for your device" : "Use your passkey"}
      </Button>
      {error ? <FieldNote error>{errorCopy(error.code)}</FieldNote> : null}
    </div>
  );
}
