"use client";

import Link from "next/link";
import { LoaderCircle, Pencil, RefreshCw, TriangleAlert } from "lucide-react";
import { runResearch } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { ResearchView } from "@/lib/types";
import { Button } from "@repo/ui/components/button";

/** Research stopped partway (S19c). Answers and the brand kit are saved, so retrying costs nothing already given. */
export function ResearchFailed({
  clientId,
  onRetried,
  basePath = "/c",
}: {
  clientId: string;
  onRetried: (research: ResearchView) => void;
  basePath?: "/c" | "/admin/c";
}) {
  const retry = useServerAction(runResearch, { onSuccess: onRetried, failure: "Couldn't start research again." });

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-warning/15 text-warning">
        <TriangleAlert className="size-6" />
      </div>
      <h1 className="type-title">Research stopped halfway</h1>
      <p className="mt-3 text-muted-foreground">
        A search service didn&apos;t answer. Your brand kit and your answers are saved, so nothing needs to be filled in again.
      </p>

      <div className="mt-8 grid gap-3 text-left">
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 shadow-raised">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-tint-foreground">
            <RefreshCw className="size-4.5" />
          </span>
          <div className="min-w-48 flex-1">
            <p className="font-medium">Try again</p>
            <p className="type-label">Starts where it stopped. About 3 minutes.</p>
          </div>
          <Button disabled={retry.isPending} onClick={() => retry.run(clientId)}>
            {retry.isPending && <LoaderCircle className="animate-spin" />}
            Try again
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 shadow-raised">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-tint-foreground">
            <Pencil className="size-4.5" />
          </span>
          <div className="min-w-48 flex-1">
            <p className="font-medium">Check your answers</p>
            <p className="type-label">Change anything before it runs again.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`${basePath}/${clientId}/settings`}>Your answers</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
