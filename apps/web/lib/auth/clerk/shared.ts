"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { SetActiveNavigate } from "@clerk/nextjs/types";
import { routes } from "@/config/routes";

const PENDING_KEY = "cadence.auth.pending";

/**
 * "silent" is a sign-up whose email already had an account: we still show the
 * code step so the page never reveals which emails are registered.
 */
export type PendingFlow = "sign-up" | "sign-in" | "silent" | "reset";

export interface Pending {
  email: string;
  flow: PendingFlow;
}

// The email typed on the previous screen, kept for this tab only so the next
// screen can show it and a reload does not lose it.
export function rememberPending(pending: Pending): void {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // Storage can be blocked; the next screen then falls back to Clerk's own state.
  }
}

export function readPending(): Pending | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as Pending) : null;
  } catch {
    return null;
  }
}

export function forgetPending(): void {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // Nothing to clean up when storage is blocked.
  }
}

const subscribeNever = () => () => {};

/** True only in the browser after hydration, so Clerk's client-side state never causes a mismatch. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

const SETUP_TWO_FACTOR = routes.auth.twoFactorSetup;

/** Builds Clerk's `finalize` navigate callback: pending session tasks go to two-factor setup, the rest to `redirectTo`. */
export function useFinishNavigation(): (redirectTo: string) => SetActiveNavigate {
  const router = useRouter();
  return useCallback(
    (redirectTo: string): SetActiveNavigate =>
      ({ session, decorateUrl }) => {
        forgetPending();
        const destination = session.currentTask?.key === "setup-mfa" ? SETUP_TWO_FACTOR : redirectTo;
        // decorateUrl may return an absolute URL so Safari can refresh Clerk's cookies.
        const url = decorateUrl(destination);
        if (url.startsWith("http")) window.location.href = url;
        else router.push(url);
      },
    [router],
  );
}
