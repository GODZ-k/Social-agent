import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";

/** The panel frame, shared with the skeleton so the header never jumps. */
export function ThisWeekFrame({
  clientId,
  subtitle,
  children,
  basePath = "/c",
}: {
  clientId: string;
  subtitle?: string;
  children: React.ReactNode;
  basePath?: WorkspaceBasePath;
}) {
  return (
    <Panel aria-labelledby="week-heading" className="overflow-hidden">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="week-heading" className="type-heading">This week</h2>
          {subtitle && <p className="type-label mt-1">{subtitle}</p>}
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={workspaceHref(basePath, clientId, "/calendar")}>
            <CalendarDays /> Open calendar <ArrowRight />
          </Link>
        </Button>
      </div>
      {children}
    </Panel>
  );
}
