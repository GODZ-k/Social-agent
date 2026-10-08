import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { listActiveBrands } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { TopBar } from "@/modules/shell/components/top-bar";
import { BrandTile } from "@/modules/brands/components/brand-tile";
import { BrandList } from "@/modules/brands/components/brand-list";
import { BrandSetupTile } from "@/modules/brands/components/brand-setup-tile";

/** "Your brands": where a client lands signed in. An admin is sent to their clients instead. */
export async function BrandsPage() {
  const [viewer, brands] = await Promise.all([getViewer(), listActiveBrands()]);

  if (viewer.role === "admin") redirect(routes.admin.clients.list);
  if (brands.length === 0) redirect(routes.onboarding.start);

  const tiles = brands.map((brand) =>
    brand.stage === "onboarding" ? (
      <BrandSetupTile key={brand.id} brand={brand} />
    ) : (
      <BrandTile key={brand.id} brand={brand} basePath={routes.brand.base} />
    ),
  );

  return (
    <div className="min-h-dvh">
      <TopBar viewer={viewer} />
      <main className="mx-auto max-w-[76rem] px-4 pt-14 pb-24 md:px-6 md:pt-24">
        <BrandList brands={brands} tiles={tiles} />
      </main>
    </div>
  );
}
