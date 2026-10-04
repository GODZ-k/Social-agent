import type { Brand, Viewer } from "@/lib/types";
import type { WorkspaceBasePath } from "@/lib/workspace-path";

import { Badge } from "@repo/ui/components/badge";
import { TopBarFrame } from "./top-bar-frame";
import { BarDivider } from "./bar-divider";
import { BrandSwitcher } from "./brand-switcher";
import { AgentChatButton } from "./agent-chat-button";
import { AccountMenu } from "./account-menu";
import { ClientsBackLink } from "./clients-back-link";
import { CrumbSlash } from "./crumb-slash";
import { BrandBackLink } from "./brand-back-link";
import { toSwitcherBrand } from "./switcher-brand";

export function TopBar({
  viewer,
  brand,
  brands = [],
  basePath = "/c",
  backTo,
}: {
  viewer: Viewer;
  brand?: Brand;
  brands?: Brand[];
  basePath?: WorkspaceBasePath;
  backTo?: { id: string; name: string };
}) {
  const isAdmin = viewer.role === "admin";

  const current = brand ? toSwitcherBrand(brand) : undefined;
  const switchable = brands.map((item) => toSwitcherBrand(item));

  return (
    <TopBarFrame wordmark={!brand}>
      {/* Admin inside a brand */}
      {isAdmin && brand && (
        <>
          <ClientsBackLink />
          <CrumbSlash />
        </>
      )}

      {/* Regular client inside a brand */}
      {brand && (
        <>
          {!isAdmin && <BarDivider />}

          <BrandSwitcher
            current={current!}
            brands={switchable}
            basePath={basePath}
          />
        </>
      )}

      {/* Onboarding page with a previous brand */}
      {!brand && backTo && (
        <>
          <BarDivider />
          <BrandBackLink brand={backTo} />
        </>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* Agent only exists when we're inside a brand */}
        {brand && (
          <AgentChatButton
            brand={brand}
            basePath={basePath}
          />
        )}

        {/* Admin badge */}
        {isAdmin && (
          <Badge
            variant="outline"
            className="border-input text-foreground max-md:hidden"
          >
            Admin
          </Badge>
        )}

        <AccountMenu viewer={viewer} />
      </div>
    </TopBarFrame>
  );
}
