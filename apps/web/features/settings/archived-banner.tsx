"use client";

import { Archive } from "lucide-react";
import { restoreBrand } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { Client } from "@/lib/types";
import { Button } from "@repo/ui/components/button";
import { cn } from "@/lib/utils";

export function ArchivedBanner({ client, className }: { client: Pick<Client, "id" | "name">; className?: string }) {
  const restore = useServerAction(restoreBrand, { success: `${client.name} restored` });

  return (
    <div className={cn("flex flex-wrap items-center gap-4 rounded-xl bg-secondary p-4 md:p-5", className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-muted-foreground">
        <Archive className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{client.name} is archived</p>
        <p className="type-label mt-0.5">Nothing is being written or published. Your brand kit, strategy and posts are kept as they were.</p>
      </div>
      <Button disabled={restore.isPending} onClick={() => restore.run(client.id)}>
        {restore.isPending ? "Restoring" : "Restore"}
      </Button>
    </div>
  );
}
