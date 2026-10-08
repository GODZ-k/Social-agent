import { getViewer } from "@/lib/auth/viewer";

import { Badge } from "@repo/ui/components/badge";
import { TopBarFrame } from "./frames";
import { BarDivider } from "./frames";
import { BrandSwitcher } from "./brand-switcher";
import { AgentChatButton } from "./agent-chat-button";
import { AccountMenu } from "./account-menu";
import { ClientsBackLink } from "./bar-links";
import { CrumbSlash } from "./frames";
import { BrandBackLink } from "./bar-links";
import { toSwitcherBrand } from "@/modules/shell/helpers/switcher-brand";
import { routes } from "@/config/routes";
import type { TopBarProps } from "@/modules/shell/types";


export function TopBar({
  viewer,
  brand,
  brands = [],
  basePath = routes.brand.base,
  backTo,
  onboarding = false,
  personName,
}: TopBarProps) {
  const isAdmin = viewer.role === "admin";

  /** Only an onboarding route names the person, and only when we know who they are. */
  const buildingForName = onboarding ? personName : undefined;
  const switchable = brands.map((item) => toSwitcherBrand(item));

  return (
    <TopBarFrame wordmark={!brand}>
      {/* Admin inside a brand, or an admin building one: both get the way back to Clients */}
      {isAdmin && (brand || buildingForName) && (
        <>
          <BarDivider />
          <ClientsBackLink />
          <CrumbSlash />
        </>
      )}

      {/* Regular client inside a brand */}
      {brand && (
        <>
          {!isAdmin && <BarDivider />}

          <BrandSwitcher current={toSwitcherBrand(brand)} brands={switchable} />
        </>
      )}

      {/* Onboarding page with a previous brand */}
      {!brand && backTo && (
        <>
          <BarDivider />
          <BrandBackLink brand={backTo} />
        </>
      )}

      {buildingForName && (
        <span className="type-label truncate text-foreground max-[560px]:hidden">
          {buildingForName}&rsquo;s new brand
        </span>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* Agent only exists when we're inside a brand */}
        {brand && <AgentChatButton brand={brand} basePath={basePath} />}

        {/* Admin badge */}
        {isAdmin && (
          <Badge variant="outline" className="border-input text-foreground max-md:hidden">
            Admin
          </Badge>
        )}

        <AccountMenu viewer={viewer} />
      </div>
    </TopBarFrame>
  );
}

/**
 * The bar for a route that needs nothing but the signed-in person. The one request-time read lives
 * here rather than in each caller, so a caller can wrap it in its own `Suspense` and keep the rest
 * of its shell prerendered. A route that already has the viewer for another reason (a role redirect,
 * say) passes it to `TopBar` directly instead of reading it twice.
 */
export async function SignedInTopBar(props: Omit<TopBarProps, "viewer">) {
  const viewer = await getViewer();
  return <TopBar {...props} viewer={viewer} />;
}
