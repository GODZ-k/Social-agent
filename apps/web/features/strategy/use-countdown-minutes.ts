"use client";

import { useEffect, useState } from "react";

/** Minutes left until `target`, ticking every 15 seconds so it's never stale. */
export function useCountdownMinutes(target: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  return Math.max(0, Math.ceil((Date.parse(target) - now) / 60_000));
}
