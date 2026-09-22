"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { deleteClient } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { Client } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { Sheet } from "@repo/ui/components/sheet";

export function DeleteClient({
  client,
  isAdmin,
}: {
  /** Only what the confirmation reads: the name it shows and the posts it cancels. */
  client: Pick<Client, "id" | "name" | "stats">;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const noun = isAdmin ? "client" : "brand";
  const [confirming, setConfirming] = useState(false);
  const remove = useServerAction(deleteClient, {
    onSuccess: () => router.replace("/"),
    success: `${client.name} deleted`,
  });

  return (
    <>
      <Panel className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="max-w-[52ch]">
          <h2 className="type-heading">Delete this {noun}</h2>
          <p className="type-label mt-1">
            Removes the brand kit, strategy, every post and the analytics. Posts that are scheduled won&apos;t go out.
          </p>
        </div>
        <Button variant="outline" className="text-destructive" onClick={() => setConfirming(true)}>
          Delete {client.name}
        </Button>
      </Panel>

      {/* A confirmation only here: this is the one action in the product that can't be undone. */}
      <Sheet
        open={confirming}
        onOpenChange={setConfirming}
        title={`Delete ${client.name}?`}
        description="This can't be undone."
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
            <Button variant="destructive" className="flex-1" disabled={remove.isPending} onClick={() => remove.run(client.id)}>
              {remove.isPending && <LoaderCircle className="animate-spin" />}
              {remove.isPending ? "Deleting" : `Delete ${client.name}`}
            </Button>
          </>
        }
      >
        <ul className="grid gap-2.5 pt-2 text-[0.9375rem]">
          <li>The brand kit and strategy are removed.</li>
          <li>
            {client.stats.scheduled > 0
              ? `${client.stats.scheduled} scheduled ${client.stats.scheduled === 1 ? "post" : "posts"} will not be published.`
              : "There are no scheduled posts to cancel."}
          </li>
          <li>Posts already published stay on the social networks. Only the copies here are removed.</li>
          <li>Connected accounts are disconnected.</li>
        </ul>
      </Sheet>
    </>
  );
}
