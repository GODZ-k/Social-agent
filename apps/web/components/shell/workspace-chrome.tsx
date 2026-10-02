import { getBrand, listActiveBrands } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { TopBar } from "./top-bar";
import { AdminActingNote } from "./admin-acting-note";
import { WorkspaceNav } from "./workspace-nav";

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
      <TopBar viewer={viewer} brand={brand ?? undefined} brands={brands} basePath={basePath} />
      {actingInBrand && <AdminActingNote />}
      {brand && <WorkspaceNav brandId={brandId} pendingApprovals={brand.stats.pendingApprovals} basePath={basePath} />}
    </>
  );
}
