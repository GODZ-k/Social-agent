"use client";

import { useSyncExternalStore } from "react";
import { UserButton } from "@clerk/nextjs";

const subscribe = () => () => {};

/**
 * Clerk's button mounts its own DOM and disagrees with the server's markup on
 * the first client render, so it is rendered only after mount. The placeholder
 * keeps the bar's width so nothing shifts when the avatar appears.
 */
export function UserMenu() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <UserButton /> : <span className="size-7 rounded-full bg-secondary" aria-hidden />;
}
