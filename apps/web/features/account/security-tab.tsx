"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Monitor, Smartphone } from "lucide-react";
import type { DeviceSession } from "@/lib/types";
import { useTwoFactorMethods } from "@/lib/auth/client";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { AccountRow, AccountSection } from "./account-row";
import { ChangePasswordForm } from "./change-password-form";
import { SignOutDevicesButton } from "./sign-out-devices-button";

function activityLine(session: DeviceSession): string {
  if (session.current) return `${session.location}. Active now.`;
  return `${session.location}. Last active ${formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}.`;
}

/**
 * BA-2's "Security" tab: how you sign in and where you are signed in.
 * Everything here happens in the dialog. The pages behind /sign-in, /verify and
 * /forgot-password are for people who are not signed in yet; sending someone who
 * is through them would take their own account away from them to hand it back.
 */
export function SecurityTab({
  passwordChangedAt,
  sessions,
  isAdmin,
  onLeave,
}: {
  passwordChangedAt: string;
  sessions: DeviceSession[];
  isAdmin: boolean;
  onLeave: () => void;
}) {
  const [changingPassword, setChangingPassword] = useState(false);
  // Read here rather than in the dialog: this is the only pane that shows it.
  const { methods } = useTwoFactorMethods();
  const twoFactorOn = methods.length > 0;
  const others = sessions.filter((session) => !session.current).length;

  return (
    <>
      <AccountSection title="Password">
        {changingPassword ? (
          <ChangePasswordForm onDone={() => setChangingPassword(false)} onCancel={() => setChangingPassword(false)} />
        ) : (
          <AccountRow
            label="Password"
            action={
              <Button variant="outline" size="sm" onClick={() => setChangingPassword(true)}>
                Change password
              </Button>
            }
          >
            <p>Changed {format(new Date(passwordChangedAt), "d MMM yyyy")}.</p>
            <p className="type-label mt-1 text-muted-foreground">At least 10 characters, not common or leaked.</p>
          </AccountRow>
        )}
      </AccountSection>

      <AccountSection title="Two-factor sign-in">
        <AccountRow
          label="Two-factor"
          action={
            <Button variant={twoFactorOn ? "outline" : "default"} size="sm" asChild onClick={onLeave}>
              <Link href={twoFactorOn ? "/two-factor/manage" : "/two-factor/setup"}>{twoFactorOn ? "Manage" : "Turn on"}</Link>
            </Button>
          }
        >
          <p className="flex flex-wrap items-center gap-2 font-medium">
            {twoFactorOn ? "On" : "Off"}
            {twoFactorOn && <Badge variant="success">Protected</Badge>}
          </p>
          <p className="type-label mt-1 text-muted-foreground">
            {isAdmin
              ? "A second step after your password. Admin accounts need at least one method, so it can't be turned off."
              : "A second step after your password. Takes about a minute to set up."}
          </p>
        </AccountRow>
      </AccountSection>

      {/* The device list is the row, not a column beside one: it needs the width. */}
      <AccountSection title="Where you're signed in">
        <ul className="divide-y divide-border py-1">
          {sessions.map((session) => {
            const Icon = session.device === "iPhone" ? Smartphone : Monitor;
            return (
              <li key={session.id} className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[0.75rem] bg-secondary text-muted-foreground">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {session.device}, {session.browser}
                    {session.current && <Badge variant="success">This device</Badge>}
                  </p>
                  <p className="type-label text-muted-foreground">{activityLine(session)}</p>
                </div>
              </li>
            );
          })}
        </ul>
        {others > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3.5">
            <p className="type-label text-muted-foreground">Sign out anywhere you don&rsquo;t recognise, then change your password.</p>
            <SignOutDevicesButton otherCount={others} />
          </div>
        )}
      </AccountSection>
    </>
  );
}
