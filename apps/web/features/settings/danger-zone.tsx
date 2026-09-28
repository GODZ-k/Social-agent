"use client";

import { useState } from "react";
import { Archive as ArchiveIcon, Trash2 } from "lucide-react";
import { archiveBrand } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { Client } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { DeleteConfirmSheet } from "@/features/settings/delete-confirm-sheet";

/** Archive is the main action (owner decision, S16); delete only removes data for good. */
export function DangerZone({
  client,
  isAdmin,
}: {
  client: Pick<Client, "id" | "name" | "status" | "stats">;
  isAdmin: boolean;
}) {
  const noun = isAdmin ? "client" : "brand";
  const archived = client.status === "archived";
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const archive = useServerAction(archiveBrand, { success: `${client.name} archived` });

  return (
    <>
      <Panel className="ring-1 ring-destructive/25">
        <h2 className="type-heading">Stop or remove this {noun}</h2>
        <p className="type-label mt-1">Archive to pause. Delete only if you never want it back.</p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t pt-5">
          {archived ? (
            <div className="max-w-[52ch]">
              <p className="font-medium">Archived</p>
              <p className="type-label mt-1">Restore it from the banner at the top to start writing and publishing again.</p>
            </div>
          ) : (
            <>
              <div className="max-w-[52ch]">
                <p className="font-medium">Archive {client.name}</p>
                <p className="type-label mt-1">
                  Nothing new is written and nothing publishes. Everything is kept, and you can restore it any time.
                </p>
              </div>
              <Button variant="outline" disabled={archive.isPending} onClick={() => archive.run(client.id)}>
                {archive.isPending ? "Archiving" : <><ArchiveIcon />Archive</>}
              </Button>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t pt-5">
          <div className="max-w-[52ch]">
            <p className="font-medium">Delete {client.name}</p>
            <p className="type-label mt-1">Removes the brand kit, strategy, every post and the results. This can&apos;t be undone.</p>
          </div>
          <Button variant="outline" className="text-destructive" onClick={() => setConfirmingDelete(true)}>
            <Trash2 />Delete
          </Button>
        </div>
      </Panel>

      <DeleteConfirmSheet
        client={client}
        noun={noun}
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        onArchiveInstead={() => {
          setConfirmingDelete(false);
          archive.run(client.id);
        }}
      />
    </>
  );
}
