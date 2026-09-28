import type { Client, Viewer } from "@/lib/types";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { WorkspaceHeader } from "./workspace-header";
import { AdminBrandHeader } from "./admin-brand-header";
import { AdminHeader } from "./admin-header";
import { OnboardingHeader } from "./onboarding-header";

/**
 * Picks the header for who is looking and where. Kept for pages that still
 * render `<TopBar>`; new pages render the header they need directly.
 */
export function TopBar({
  viewer,
  client,
  clients = [],
  basePath = "/c",
}: {
  viewer: Viewer;
  client?: Client;
  clients?: Client[];
  basePath?: WorkspaceBasePath;
}) {
  const isAdmin = viewer.role === "admin";
  if (client && isAdmin) return <AdminBrandHeader viewer={viewer} brand={client} brands={clients} basePath={basePath} />;
  if (client) return <WorkspaceHeader viewer={viewer} brand={client} brands={clients} />;
  if (isAdmin) return <AdminHeader viewer={viewer} />;
  return <OnboardingHeader viewer={viewer} />;
}
