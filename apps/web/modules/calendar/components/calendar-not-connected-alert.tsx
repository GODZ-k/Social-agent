import Link from "next/link";
import { Clock } from "lucide-react";
import type { Platform } from "@social-agent/shared";
import { Button } from "@repo/ui/components/button";
import { platformNames } from "@/modules/calendar/helpers/calendar-model";
import { workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/** Approved posts wait here, not out, while their account is disconnected. Same warning tone as the settings tab's own banner. */
export function CalendarNotConnectedAlert({
  waitingPlatforms,
  brandId,
  basePath,
}: {
  waitingPlatforms: Platform[];
  brandId: string;
  basePath: WorkspaceBase;
}) {
  if (waitingPlatforms.length === 0) return null;
  const names = platformNames(waitingPlatforms);
  const isNot = waitingPlatforms.length === 1 ? "isn't" : "aren't";

  return (
    <div className="mb-5 flex flex-col items-start gap-3 rounded-xl bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2.5 text-sm">
        <Clock className="mt-0.5 size-4 shrink-0 text-warning" />
        <span>
          {names} {isNot} connected, so approved posts wait here instead of going out.
        </span>
      </p>
      <Button asChild size="sm" variant="outline" className="shrink-0 bg-card">
        <Link href={workspaceRoutes(basePath).settingsTab(brandId, "accounts")}>Connect accounts</Link>
      </Button>
    </div>
  );
}
