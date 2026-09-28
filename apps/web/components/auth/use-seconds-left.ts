"use client";

import { useEffect, useState } from "react";

/** Counts down once a second from `seconds` to zero, starting again whenever `seconds` or `restartKey` changes. */
export function useSecondsLeft(seconds: number, restartKey?: unknown): number {
  const [left, setLeft] = useState(seconds);
  const [started, setStarted] = useState({ seconds, restartKey });
  if (started.seconds !== seconds || started.restartKey !== restartKey) {
    setStarted({ seconds, restartKey });
    setLeft(seconds);
  }

  useEffect(() => {
    const endsAt = Date.now() + seconds * 1000;
    const timer = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setLeft(next);
      if (next === 0) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [seconds, restartKey]);

  return left;
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
