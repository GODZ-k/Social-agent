"use client";

import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { resolveRole, type Viewer } from "@/lib/api/session";

/** The signed-in person and what they're allowed to see. */
export function useViewer() {
  const { isLoaded, user } = useUser();

  const viewer = useMemo<Viewer | null>(() => {
    if (!user) return null;
    const email = user.primaryEmailAddress?.emailAddress ?? "";
    return {
      id: user.id,
      email,
      name: user.fullName ?? user.firstName ?? email,
      role: resolveRole(user.publicMetadata, email),
    };
  }, [user]);

  return { isLoaded, viewer, isAdmin: viewer?.role === "admin" };
}
