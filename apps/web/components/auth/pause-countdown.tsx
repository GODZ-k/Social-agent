"use client";

import { useState } from "react";
import { formatClock, useSecondsLeft } from "@/hooks/use-seconds-left";

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

/** How long sign-in stays paused, with the clock time it opens again so people can leave and come back. */
export function PauseCountdown({ seconds }: { seconds: number }) {
  const [opensAt] = useState(() => new Date(Date.now() + seconds * 1000));
  const left = useSecondsLeft(seconds);
  return (
    <div role="timer" aria-live="off" className="mt-7 flex items-center gap-3.5 rounded-[1.125rem] bg-card px-4.5 py-4 shadow-raised">
      <span className="type-number text-[1.75rem] leading-none tabular-nums">{formatClock(left)}</span>
      <p className="text-sm text-muted-foreground">
        {left > 0 ? `Try again at ${timeFormat.format(opensAt)}. You can leave this page.` : "You can try again now."}
      </p>
    </div>
  );
}
