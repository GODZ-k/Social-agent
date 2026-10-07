"use client";

import { setAlertRouting } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { AlertChannelKind, AlertKind } from "@/lib/types";
import { Switch } from "@repo/ui/components/switch";
import { CHANNEL_ICON, CHANNEL_LABEL } from "./channel-meta";

/** A real on/off control per channel per alert, not a button styled to look like one. */
export function AlertChannelToggle({ alertKind, channel, checked }: { alertKind: AlertKind; channel: AlertChannelKind; checked: boolean }) {
  const Icon = CHANNEL_ICON[channel];
  const toggle = useServerAction(setAlertRouting);

  return (
    <label className="flex min-w-32 items-center gap-2 text-[0.8125rem]">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="flex-1">{CHANNEL_LABEL[channel]}</span>
      <Switch checked={checked} disabled={toggle.isPending} onCheckedChange={(on) => toggle.run(alertKind, channel, on)} />
    </label>
  );
}
