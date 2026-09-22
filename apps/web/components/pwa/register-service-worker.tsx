"use client";

import { useEffect } from "react";

/** Registers the worker in production builds only; in development it would cache stale chunks. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // The app works without it; installation and offline fallback are the only loss.
    });
  }, []);
  return null;
}
