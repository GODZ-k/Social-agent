"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Monitor, Smartphone } from "lucide-react";
import type { DeviceSession } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { TwoFactorSetupFlow } from "@/features/auth/two-factor-setup-flow";
import { AccountRow, AccountSection } from "./account-row";
import { ChangePasswordForm } from "./change-password-form";
import { TwoFactorSection } from "./two-factor-section";
import { SignOutDevicesButton } from "./sign-out-devices-button";

function activityLine(session: DeviceSession): string {
  if (session.current) return `${session.location}. Active now.`;
  return `${session.location}. Last active ${formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}.`;
}

/**
 * The setup steps are drawn for a full auth page: a 34px heading across a 25rem column.
 * Dropped into the dialog they read as a page stuffed into a card, so the pane lends them
 * its own measure and heading scale. Restyling here rather than forking the steps keeps one
 * copy of the wizard for both the page and this dialog.
 */
function InPane({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-100 pt-1 [&_:is(h1,h2)]:text-[1.375rem] [&_:is(h1,h2)]:tracking-[-0.02em] sm:[&_:is(h1,h2)]:text-[1.375rem]">{children}</div>;
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
}: {
  passwordChangedAt: string;
  sessions: DeviceSession[];
  isAdmin: boolean;
}) {
  const [changingPassword, setChangingPassword] = useState(false);
  const [turningOnTwoFactor, setTurningOnTwoFactor] = useState(false);
  const others = sessions.filter((session) => !session.current).length;

  if (turningOnTwoFactor) {
    const lede = isAdmin
      ? "Admin accounts need a second step after the password. It takes about a minute."
      : "Add a second step after your password. It takes about a minute.";
    return (
      <InPane>
        <TwoFactorSetupFlow
          lede={lede}
          onDone={() => setTurningOnTwoFactor(false)}
          skip={
            <Button type="button" variant="ghost" size="lg" className="w-full" onClick={() => setTurningOnTwoFactor(false)}>
              Cancel
            </Button>
          }
        />
      </InPane>
    );
  }

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

      <TwoFactorSection isAdmin={isAdmin} onTurnOn={() => setTurningOnTwoFactor(true)} />

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
