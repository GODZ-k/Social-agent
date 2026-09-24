"use client";

import { format } from "date-fns";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { connectAccount, disconnectAccount } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { Platform, SocialAccount } from "@social-agent/shared";
import { cn } from "@/lib/utils";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

/** Each row owns its own actions, so a pending state never leaks onto another network's button. */
export function AccountRow({
  clientId,
  platform,
  planned,
  account,
}: {
  clientId: string;
  platform: Platform;
  planned: boolean;
  account: SocialAccount | null;
}) {
  const name = PLATFORM_LABEL[platform];
  const connect = useServerAction(connectAccount, { success: `${name} connected` });
  const disconnect = useServerAction(disconnectAccount, { onSuccess: () => toast(`${name} disconnected`) });
  const connecting = connect.isPending;
  const disconnecting = disconnect.isPending;
  const connected = account?.status === "connected";
  const needsAttention = account?.status === "expired" || (planned && !account);

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-card p-4 shadow-raised md:p-5">
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-md",
          connected ? "bg-tint text-tint-foreground" : "bg-secondary text-muted-foreground",
        )}
      >
        <PlatformIcon platform={platform} className="size-5" />
      </span>

      <div className="min-w-0 flex-1 basis-48">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          {name}
          {connected && <Badge variant="success">Connected</Badge>}
          {account?.status === "expired" && <Badge variant="warning">Access expired</Badge>}
        </p>
        <p className={cn("type-label mt-0.5 flex items-start gap-1.5", needsAttention && "text-warning")}>
          {needsAttention && <TriangleAlert className="mt-px size-3.5 shrink-0" />}
          {statusLine(name, planned, account)}
        </p>
      </div>

      {connected ? (
        <Button variant="ghost" size="sm" disabled={disconnecting} onClick={() => disconnect.run(clientId, platform)}>
          {disconnecting && <LoaderCircle className="animate-spin" />}
          Disconnect
        </Button>
      ) : (
        <Button
          variant={needsAttention ? "default" : "outline"}
          size="sm"
          disabled={connecting}
          onClick={() => connect.run(clientId, platform)}
        >
          {connecting && <LoaderCircle className="animate-spin" />}
          {connectLabel(name, connecting, account)}
        </Button>
      )}
    </li>
  );
}

/** Always says what this state means for publishing, the only reason anyone reads this row. */
function statusLine(name: string, planned: boolean, account: SocialAccount | null): string {
  if (account?.status === "connected") return `${account.handle}, connected ${format(new Date(account.connectedAt), "d MMM yyyy")}`;
  if (account?.status === "expired") return `${name} signed ${account.handle} out. Reconnect it or scheduled posts won't go out.`;
  if (planned) return `The strategy posts to ${name}, but nothing can publish until it's connected.`;
  return "Not part of the posting plan.";
}

function connectLabel(name: string, connecting: boolean, account: SocialAccount | null): string {
  if (connecting) return `Opening ${name}`;
  return account ? "Reconnect" : "Connect";
}
