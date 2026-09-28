import { Mail } from "lucide-react";
import type { ConnectableChannelKind, NotificationChannel } from "@/lib/types";
import { APP_NAME } from "@/lib/utils";
import { Panel } from "@repo/ui/components/states";
import { ChannelRow } from "./channel-row";

/** Email is always on; Discord, Slack and WhatsApp connect or disconnect below it. */
export function ChannelsPanel({ channels }: { channels: NotificationChannel[] }) {
  const others = channels.filter((c): c is NotificationChannel & { kind: ConnectableChannelKind } => c.kind !== "email");
  const connectedCount = others.filter((c) => c.connected).length;

  return (
    <Panel>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Channels</h2>
          <p className="type-label mt-1">Add somewhere besides email for {APP_NAME} to send alerts.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{connectedCount}</p>
          <p className="type-label mt-0.5">connected</p>
        </div>
      </div>
      <p className="mb-4 flex items-center gap-2.5 text-sm text-muted-foreground">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary">
          <Mail className="size-4" />
        </span>
        <span>
          <b className="font-medium text-foreground">Email</b> is on by default, sent to every admin&rsquo;s own inbox. Turn it off per alert below.
        </span>
      </p>
      <ul className="grid gap-3">
        {others.map((channel) => (
          <ChannelRow key={channel.kind} channel={channel} />
        ))}
      </ul>
    </Panel>
  );
}
