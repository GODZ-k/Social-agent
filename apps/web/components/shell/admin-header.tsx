import type { Viewer } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { TopBarFrame } from "./top-bar-frame";
import { AccountMenu } from "./account-menu";

/** The agency's own area. No switcher and no "Ask the agent": the agent works per brand. */
export function AdminHeader({ viewer }: { viewer: Viewer }) {
  return (
    <TopBarFrame>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Badge variant="outline" className="border-input text-foreground">
          Admin
        </Badge>
        <AccountMenu viewer={viewer} />
      </div>
    </TopBarFrame>
  );
}
