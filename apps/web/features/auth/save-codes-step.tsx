"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { BackupCodesList } from "./backup-codes-list";
import { SavedCodesCheck } from "./saved-codes-check";
import { SetupProgress } from "./setup-progress";

/** Step 3: backup codes, shown this once. The button stays locked until the person says they saved them. */
export function SaveCodesStep({ codes, onDone, pending, headingLevel }: { codes: string[]; onDone: () => void; pending: boolean; headingLevel?: 1 | 2 }) {
  const [saved, setSaved] = useState(false);
  return (
    <>
      {/* Reaching this step at all means backup codes are on, which makes it a genuine 3rd step. */}
      <SetupProgress step={3} total={3} />
      <AuthHeading title="Save your backup codes" level={headingLevel}>
        If you lose your phone or passkey, each code gets you in once. This is the only time we show them.
      </AuthHeading>
      <Notice tone="warning">Save them now. You can make new ones later, but you can&apos;t see these again.</Notice>
      <div className="mt-6 grid gap-4.5">
        <BackupCodesList codes={codes} />
        <SavedCodesCheck checked={saved} onCheckedChange={setSaved} />
        <Button type="button" size="lg" className="w-full" disabled={!saved || pending} onClick={onDone}>
          Continue
        </Button>
      </div>
    </>
  );
}
