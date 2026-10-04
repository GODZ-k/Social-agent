import { redirect } from "next/navigation";
import { listActiveBrands } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { TopBar } from "@/components/shell/top-bar";
import { BrandTile } from "@/features/brands/brand-tile";
import { BrandList } from "@/features/brands/brand-list";
import { BrandSetupTile } from "@/features/brands/brand-setup-tile";

export default async function BrandsPage() {
  const [viewer, brands] = await Promise.all([getViewer(), listActiveBrands()]);

  if (viewer.role === "admin") redirect("/admin/clients");

  if (brands.length === 0) redirect("/onboarding");

  const tiles = brands.map((brand) =>
    brand.stage === "onboarding" ? (
      <BrandSetupTile key={brand.id} brand={brand} />
    ) : (
      <BrandTile key={brand.id} brand={brand} basePath="/c" />
    ),
  );

  return (
    <div className="min-h-dvh">
      <TopBar viewer={viewer}/>
      <main className="mx-auto max-w-[76rem] px-4 pt-14 pb-24 md:px-6 md:pt-24">
        <BrandList brands={brands} tiles={tiles} />
      </main>
    </div>
  );
}
