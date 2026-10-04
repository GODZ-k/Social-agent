"use client";

import Link from "next/link";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { PageHeader } from "@repo/ui/components/states";

/** ADM-2: the clients list failed to load. Nothing was changed. */
export default function AdminClientsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <PageHeader title="Clients" description="Every business owner you manage, with what needs you first." />
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-destructive/12 text-destructive">
          <Activity className="size-5" />
        </div>
        <p className="type-heading">Couldn&rsquo;t load your clients</p>
        <p className="text-muted-foreground">
          The server didn&rsquo;t answer in time. Nothing was changed. Try again, or check the server in Observability.
        </p>
        <div className="mt-2 flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/observability/server">
              <Activity /> Open Observability
            </Link>
          </Button>
          <Button onClick={reset}>
            <RefreshCw /> Try again
          </Button>
        </div>
      </div>
    </>
  );
}
