"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { disconnectChannel } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { ConnectableChannelKind, NotificationChannel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { CHANNEL_ICON, CHANNEL_LABEL } from "./channel-meta";
import { ConnectSlackDialog } from "./connect-slack-dialog";
import { ConnectWhatsAppDialog } from "./connect-whatsapp-dialog";

/** Discord, Slack or WhatsApp: connect, connected, or disconnect. Email has no row of its own. */
export function ChannelRow({ channel }: { channel: NotificationChannel & { kind: ConnectableChannelKind } }) {
  const Icon = CHANNEL_ICON[channel.kind];
  const name = CHANNEL_LABEL[channel.kind];
  const disconnect = useServerAction(disconnectChannel, { success: `${name} disconnected` });
  const [connecting, setConnecting] = useState(false);

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-card p-4 shadow-raised md:p-5">
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-md",
          channel.connected ? "bg-tint text-tint-foreground" : "bg-secondary text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          {name}
          {channel.connected && <Badge variant="success">Connected</Badge>}
        </p>
        <p className="type-label mt-0.5">{channel.detail}</p>
      </div>
      {channel.connected ? (
        <Button variant="ghost" size="sm" disabled={disconnect.isPending} onClick={() => disconnect.run(channel.kind)}>
          {disconnect.isPending && <LoaderCircle className="animate-spin" />}
          Disconnect
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setConnecting(true)}>
          Connect {name}
        </Button>
      )}
      {channel.kind === "slack" && <ConnectSlackDialog open={connecting} onOpenChange={setConnecting} />}
      {channel.kind === "whatsapp" && <ConnectWhatsAppDialog open={connecting} onOpenChange={setConnecting} />}
    </li>
  );
}
