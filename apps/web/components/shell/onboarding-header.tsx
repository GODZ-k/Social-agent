import type { Viewer } from "@/lib/types";
import { TopBarFrame } from "./top-bar-frame";
import { BarDivider } from "./bar-divider";
import { BrandBackLink } from "./brand-back-link";
import { AccountMenu } from "./account-menu";

/** Logo and account only, so nothing pulls away from the step. A client adding a brand gets a way back to their last one. */
export function OnboardingHeader({ viewer, backTo }: { viewer: Viewer; backTo?: { id: string; name: string } }) {
  return (
    <TopBarFrame wordmark>
      {backTo && (
        <>
          <BarDivider />
          <BrandBackLink brand={backTo} />
        </>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <AccountMenu viewer={viewer} />
      </div>
    </TopBarFrame>
  );
}
