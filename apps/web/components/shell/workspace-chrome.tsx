import { getBrand, listActiveBrands } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { BrandTheme } from "@repo/ui/components/brand-theme";
import { TopBar } from "./top-bar";
import { AdminActingNote } from "./admin-acting-note";
import { WorkspaceNav } from "./workspace-nav";

/**
 * Header, nav and brand tint for one workspace. Async so the layout itself
 * stays instant: the chrome streams in under Suspense while the page's own
 * loading state shows. A missing brand leaves the bar without a switcher; the
 * page decides on notFound(). `basePath` tells every link inside whether it is
 * building the brand's own tree or the admin's mirror of it.
 */
export async function WorkspaceChrome({
  params,
  basePath = "/c",
}: {
  /** The promise, not the value: awaiting it in the layout would block the whole subtree from prerendering. */
  params: Promise<{ brandId: string }>;
  basePath?: WorkspaceBasePath;
}) {
  const { brandId } = await params;
  const [viewer, brand, brands] = await Promise.all([getViewer(), getBrand(brandId), listActiveBrands()]);
  const actingInBrand = brand !== null && viewer.role === "admin";
  return (
    <>
      <BrandTheme color={brand?.accent} />
      <TopBar viewer={viewer} brand={brand ?? undefined} brands={brands} basePath={basePath} />
      {actingInBrand && <AdminActingNote />}
      {brand && <WorkspaceNav brandId={brandId} pendingApprovals={brand.stats.pendingApprovals} basePath={basePath} />}
    </>
  );
}
