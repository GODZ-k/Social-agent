import type { Brand, Viewer } from "@/lib/types";
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
  brand,
  brands = [],
  basePath = "/c",
}: {
  viewer: Viewer;
  brand?: Brand;
  brands?: Brand[];
  basePath?: WorkspaceBasePath;
}) {
  const isAdmin = viewer.role === "admin";
  if (brand && isAdmin) return <AdminBrandHeader viewer={viewer} brand={brand} brands={brands} basePath={basePath} />;
  if (brand) return <WorkspaceHeader viewer={viewer} brand={brand} brands={brands} />;
  if (isAdmin) return <AdminHeader viewer={viewer} />;
  return <OnboardingHeader viewer={viewer} />;
}
