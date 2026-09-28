"use client";

import { usePathname } from "next/navigation";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";

/** The workspace section in the address: "" for the overview, else "content", "settings" and so on. */
export function useActiveSegment(brandId: string, basePath: WorkspaceBasePath = "/c") {
  const pathname = usePathname();
  const base = workspaceHref(basePath, brandId);
  if (pathname === base) return "";
  return pathname.slice(base.length + 1).split("/")[0] ?? "";
}
