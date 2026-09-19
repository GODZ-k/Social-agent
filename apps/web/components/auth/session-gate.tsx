"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { setSession } from "@/lib/api/session";
import { useViewer } from "@/hooks/use-viewer";

/**
 * Hands the signed-in user to the API layer before any screen can ask for data,
 * and makes sure one person's cached data is never shown to the next.
 */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, viewer } = useViewer();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [syncedId, setSyncedId] = useState<string | null | undefined>(undefined);
  const tokenRef = useRef(getToken);
  tokenRef.current = getToken;

  const viewerId = viewer?.id ?? null;
  // Layout effects run before the queries of the screens below start fetching.
  useLayoutEffect(() => {
    if (!isLoaded) return;
    setSession(viewer, () => tokenRef.current());
    setSyncedId((previous) => {
      if (previous !== undefined && previous !== viewerId) queryClient.clear();
      return viewerId;
    });
  }, [isLoaded, viewer, viewerId, queryClient]);

  if (!isLoaded || syncedId !== viewerId) {
    return (
      <div className="grid min-h-dvh place-items-center" role="status" aria-label="Loading">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-7 w-2 animate-pulse rounded-full bg-primary/70" style={{ animationDelay: `${i * 140}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  // Remount on user change so no component keeps the previous person's state.
  return <Fragment key={viewerId ?? "signed-out"}>{children}</Fragment>;
}
