import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { listActiveBrands } from "@/lib/api/server";
import { signOut } from "@/lib/auth/actions";
import { getViewer } from "@/lib/auth/viewer";
import { prettyUrl } from "@/lib/utils";
import { textLinkClass } from "@/modules/auth/components/text-link";
import { BrandMark } from "@repo/ui/components/brand-mark";
import { Logo } from "@/components/common/logo";
import { StateMark } from "@repo/ui/components/states";
import { routes } from "@/config/routes";

/**
 * A brand id that's missing, archived, or not the viewer's (ST-2 "brand"): all three read
 * the same, so nothing about which case it is leaks. Shows the viewer's other brands so the
 * way on is one tap. Async: not-found.tsx can read data like any other server component.
 */
export default async function WorkspaceNotFound() {
  const [brands, viewer] = await Promise.all([listActiveBrands(), getViewer()]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center px-4 pt-10 text-center md:pt-16">
      <Logo />
      <div className="mt-8 w-full">
        <StateMark kind="missing" />
        <h1 className="type-title">This brand isn&apos;t available</h1>
        <p className="mt-3.5 text-muted-foreground">
          It may have been removed, or this account can&apos;t open it. If someone sent you the link, ask them to check it.
        </p>

        {brands.length > 0 && (
          <div className="mt-8 rounded-xl bg-card p-2 text-left shadow-raised">
            <p className="type-label px-3.5 pt-2 pb-1">Your brands</p>
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={routes.brand.overview(brand.id)}
                className="pressable flex min-h-14 items-center gap-3.5 rounded-2xl px-3.5 py-2.5 hover:bg-accent"
              >
                <BrandMark name={brand.name} color={brand.accent} />
                <span className="grid min-w-0 flex-1">
                  <span className="truncate font-medium">{brand.name}</span>
                  <span className="truncate text-[0.8125rem] text-muted-foreground">{prettyUrl(brand.url)}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
            <Link
              href={routes.onboarding.start}
              className="pressable flex min-h-14 items-center gap-3.5 rounded-2xl px-3.5 py-2.5 font-medium text-tint-foreground hover:bg-accent"
            >
              <span className="grid size-7.5 shrink-0 place-items-center rounded-full bg-tint text-tint-foreground">
                <Plus className="size-4" />
              </span>
              Add a brand
            </Link>
          </div>
        )}

        <p className="mt-5 text-[0.8125rem] text-muted-foreground">
          Signed in as {viewer.email}.{" "}
          <form action={signOut} className="inline">
            <button type="submit" className={textLinkClass}>
              Use another account
            </button>
          </form>
        </p>
      </div>
    </main>
  );
}
