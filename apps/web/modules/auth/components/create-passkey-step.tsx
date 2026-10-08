"use client";

import { KeyRound, Smartphone } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import type { AuthResult } from "@/lib/auth/types";
import { APP_NAME } from "@/lib/utils";
import { AuthHeading } from "./auth-heading";
import { Notice } from "@/components/form/notice";
import { StatusIcon } from "./status-icon";
import { SubmitButton } from "./submit-button";
import { errorCopy } from "@/lib/auth/error-copy";
import { SetupProgress } from "./setup-progress";
import { useAuthSubmit } from "@/hooks/use-auth-submit";

/** Step 2 with a passkey: the browser owns the prompt; we say what is happening and offer a way out. */
export function CreatePasskeyStep({
  create,
  onCreated,
  onUseApp,
  headingLevel,
}: {
  create: () => Promise<AuthResult>;
  onCreated: () => void;
  onUseApp: () => void;
  headingLevel?: 1 | 2;
}) {
  const { pending, error, run } = useAuthSubmit();
  return (
    <>
      <SetupProgress step={2} />
      <AuthHeading icon={<StatusIcon icon={KeyRound} />} title="Create a passkey" level={headingLevel}>
        Your browser asks for your fingerprint, face or device PIN. {APP_NAME} never sees them; they stay on your device.
      </AuthHeading>
      {error ? <Notice tone="warning">{errorCopy(error.code)}</Notice> : null}
      <div className="mt-6 grid gap-3">
        <SubmitButton type="button" pending={pending} pendingLabel="Waiting for your device" onClick={() => run(create, onCreated)}>
          {error ? "Try again" : "Create passkey"}
        </SubmitButton>
        <Button type="button" variant="outline" size="lg" className="w-full" onClick={onUseApp}>
          <Smartphone />
          Use an authenticator app instead
        </Button>
      </div>
    </>
  );
}
