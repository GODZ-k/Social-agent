import { Mail } from "lucide-react";
import type { ConnectableChannelKind, NotificationChannel } from "@/lib/types";
import { APP_NAME } from "@/lib/utils";
import { Panel } from "@repo/ui/components/states";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { ChannelRow } from "./channel-row";

/** Email is always on; Discord, Slack and WhatsApp connect or disconnect below it. */
export function ChannelsPanel({ channels }: { channels: NotificationChannel[] }) {
  const others = channels.filter((c): c is NotificationChannel & { kind: ConnectableChannelKind } => c.kind !== "email");
  const connectedCount = others.filter((c) => c.connected).length;

  return (
    <Panel>
      <PanelHeader
        className="mb-4"
        title="Channels"
        description={`Add somewhere besides email for ${APP_NAME} to send alerts.`}
        right={<PanelStat value={connectedCount} caption="connected" />}
      />
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
