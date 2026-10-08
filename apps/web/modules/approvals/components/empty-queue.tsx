import Link from "next/link";
import { CalendarDays, LayoutGrid } from "lucide-react";
import type { PostView } from "@/lib/types";
import { Button } from "@repo/ui/components/button";
import { StateMark } from "@repo/ui/components/states";
import { WhatHappensNext } from "./what-happens-next";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/** Both empty states end the same way: content or the calendar, never a dead end. */
function SeeContentAndCalendar({ brandId, basePath }: { brandId: string; basePath: WorkspaceBase }) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      <Button variant="outline" asChild>
        <Link href={workspaceRoutes(basePath).content(brandId)}>
          <LayoutGrid /> See all content
        </Link>
      </Button>
      <Button asChild>
        <Link href={workspaceRoutes(basePath).calendar(brandId)}>
          <CalendarDays /> Open calendar
        </Link>
      </Button>
    </div>
  );
}

/**
 * ST-4: the approval queue is empty, either because nothing has been drafted yet (`done` = 0)
 * or because the owner just reviewed the last post this session (`done` > 0, with a breakdown
 * of what happened to it and what happens next).
 */
export function EmptyQueue({
  brandId,
  done,
  approved,
  changesCount,
  basePath = routes.brand.base,
}: {
  brandId: string;
  done: number;
  /** Posts approved this session, for the "on the calendar" row and the connection warning. */
  approved: PostView[];
  /** Posts sent back to the agent for a rewrite this session. */
  changesCount: number;
  basePath?: WorkspaceBase;
}) {
  if (done === 0) {
    return (
      <div className="mx-auto max-w-md py-14 text-center">
        <StateMark kind="missing" />
        <p className="type-heading">Nothing to approve</p>
        <p className="mt-2.5 text-muted-foreground">
          New drafts from the agent show up here before anything is scheduled. You decide on each one.
        </p>
        <div className="mt-7">
          <SeeContentAndCalendar brandId={brandId} basePath={basePath} />
        </div>
      </div>
    );
  }

  const rejected = done - approved.length - changesCount;
  const clauses = [
    approved.length > 0 && `${approved.length} approved`,
    changesCount > 0 && `${changesCount} sent back for changes`,
    rejected > 0 && `${rejected} rejected`,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-xl py-14 text-center" role="status">
      <StateMark kind="done" />
      <p className="type-heading">That&rsquo;s all of them</p>
      <p className="mt-2.5 text-muted-foreground">
        You went through {done} {done === 1 ? "post" : "posts"}: {clauses.join(", ")}.
      </p>
      <WhatHappensNext approved={approved} changesCount={changesCount} brandId={brandId} basePath={basePath} />
      <div className="mt-7">
        <SeeContentAndCalendar brandId={brandId} basePath={basePath} />
      </div>
    </div>
  );
}
