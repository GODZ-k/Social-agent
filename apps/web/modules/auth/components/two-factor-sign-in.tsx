"use client";

import { useState } from "react";
import { List, Smartphone } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { authCapabilities, useTwoFactorSignIn } from "@/lib/auth/client";
import type { AuthError } from "@/lib/auth/types";
import { OrDivider } from "./or-divider";
import { TextLink } from "./text-link";
import { AppCodeForm } from "./app-code-form";
import { BackupCodeForm } from "./backup-code-form";
import { FlowEnded, TwoFactorPaused } from "./outcomes";
import { PasskeyButton } from "./passkey-button";
import { routes } from "@/config/routes";

type Method = "app" | "backup";

/** AUTH-7 at sign-in: the second step after the password, with the other ways in one tap away. */
export function TwoFactorSignIn({ redirectTo }: { redirectTo: string }) {
  const { ready, hasPending, email, verifyAppCode, verifyBackupCode, verifyPasskey } = useTwoFactorSignIn({ redirectTo });
  const [method, setMethod] = useState<Method>("app");
  const [paused, setPaused] = useState<AuthError | null>(null);

  if (!ready) return <div className="skeleton h-80 w-full" role="status" aria-label="Loading" />;
  if (paused) return <TwoFactorPaused email={email} seconds={paused.retryAfterSeconds} />;
  if (!hasPending) return <FlowEnded />;

  const who = email ? (
    <>
      Signing in as <b>{email}</b>.{" "}
    </>
  ) : null;

  return (
    <>
      {method === "app" ? (
        <AppCodeForm lede={who} verify={verifyAppCode} onPaused={setPaused} />
      ) : (
        <BackupCodeForm lede={who} verify={verifyBackupCode} onPaused={setPaused} />
      )}
      <div className="mt-7 grid gap-2.5">
        <OrDivider>or</OrDivider>
        {authCapabilities.secondFactors.includes("passkey") ? (
          <PasskeyButton verify={verifyPasskey} onPaused={setPaused} />
        ) : null}
        {method === "app" ? (
          <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => setMethod("backup")}>
            <List />
            Use a backup code
          </Button>
        ) : (
          <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => setMethod("app")}>
            <Smartphone />
            Use your authenticator app
          </Button>
        )}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        No phone or backup codes? <TextLink href={routes.auth.twoFactorLostAccess}>Get back into your account</TextLink>
      </p>
    </>
  );
}
