"use client";

import { format } from "date-fns";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useConnectAccount, useDisconnectAccount } from "@/lib/api/queries";
import type { Client, Platform } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

const ALL_PLATFORMS: Platform[] = ["instagram", "facebook", "tiktok", "linkedin"];

/**
 * One row per network. The status line always says what the state means for
 * publishing, because that is the only reason anyone comes to this screen.
 */
export function SocialAccounts({ client }: { client: Client }) {
  const connect = useConnectAccount(client.id);
  const disconnect = useDisconnectAccount(client.id);

  // Networks the strategy posts to come first: those are the ones that matter.
  const platforms = [...ALL_PLATFORMS].sort(
    (a, b) => Number(client.platforms.includes(b)) - Number(client.platforms.includes(a)),
  );

  return (
    <ul className="grid gap-3">
      {platforms.map((platform) => {
        const account = client.accounts.find((a) => a.platform === platform);
        const planned = client.platforms.includes(platform);
        const name = PLATFORM_LABEL[platform];
        const connecting = connect.isPending && connect.variables === platform;
        const disconnecting = disconnect.isPending && disconnect.variables === platform;
        const needsAttention = account?.status === "expired" || (planned && !account);

        return (
          <li
            key={platform}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-card p-4 shadow-raised md:p-5"
          >
            <span
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-md",
                account?.status === "connected" ? "bg-tint text-tint-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              <PlatformIcon platform={platform} className="size-5" />
            </span>

            <div className="min-w-0 flex-1 basis-48">
              <p className="flex flex-wrap items-center gap-2 font-medium">
                {name}
                {account?.status === "connected" && <Badge variant="success">Connected</Badge>}
                {account?.status === "expired" && <Badge variant="warning">Access expired</Badge>}
              </p>
              <p className={cn("type-label mt-0.5 flex items-start gap-1.5", needsAttention && "text-warning")}>
                {needsAttention && <TriangleAlert className="mt-px size-3.5 shrink-0" />}
                {account?.status === "connected"
                  ? `${account.handle}, connected ${format(new Date(account.connectedAt), "d MMM yyyy")}`
                  : account?.status === "expired"
                    ? `${name} signed ${account.handle} out. Reconnect it or scheduled posts won't go out.`
                    : planned
                      ? `The strategy posts to ${name}, but nothing can publish until it's connected.`
                      : "Not part of the posting plan."}
              </p>
            </div>

            {account?.status === "connected" ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={disconnecting}
                onClick={() => disconnect.mutate(platform, { onSuccess: () => toast(`${name} disconnected`) })}
              >
                {disconnecting && <LoaderCircle className="animate-spin" />}
                Disconnect
              </Button>
            ) : (
              <Button
                variant={needsAttention ? "default" : "outline"}
                size="sm"
                disabled={connecting}
                onClick={() => connect.mutate(platform, { onSuccess: () => toast.success(`${name} connected`) })}
              >
                {connecting && <LoaderCircle className="animate-spin" />}
                {connecting ? `Opening ${name}` : account ? "Reconnect" : "Connect"}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
