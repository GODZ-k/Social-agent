"use client";

import { AUTH_POLICY } from "@/lib/auth/rules";
import { textLinkClass } from "./text-link";
import { formatClock, useSecondsLeft } from "./use-seconds-left";

/**
 * "Didn't get it?" with a resend button that waits a minute between sends.
 * `sentCount` restarts the wait after each successful send.
 */
export function ResendRow({ hint, label, onResend, sentCount, pending }: { hint: string; label: string; onResend: () => void; sentCount: number; pending?: boolean }) {
  const left = useSecondsLeft(AUTH_POLICY.resendSeconds, sentCount);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted-foreground">
      <span>{hint}</span>
      {left > 0 ? (
        <span>
          {label} in <span className="tabular-nums">{formatClock(left)}</span>
        </span>
      ) : (
        <button type="button" onClick={onResend} disabled={pending} className={textLinkClass}>
          {label}
        </button>
      )}
    </div>
  );
}
