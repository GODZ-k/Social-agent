"use client";

import { usePathname } from "next/navigation";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/** The workspace section in the address: "" for the overview, else "content", "settings" and so on. */
export function useActiveSegment(brandId: string, basePath: WorkspaceBase = routes.brand.base) {
  const pathname = usePathname();
  const base = workspaceRoutes(basePath).overview(brandId);
  if (pathname === base) return "";
  return pathname.slice(base.length + 1).split("/")[0] ?? "";
}
