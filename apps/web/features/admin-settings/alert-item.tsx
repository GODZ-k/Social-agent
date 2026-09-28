import { Bell, Mail, Shield, TriangleAlert, type LucideIcon } from "lucide-react";
import type { AlertChannelKind, AlertKind, AlertRow } from "@/lib/types";
import { AlertChannelToggle } from "./alert-channel-toggle";

const ICON: Record<AlertKind, LucideIcon> = {
  observability: TriangleAlert,
  new_client: Bell,
  questionnaire_ready: Shield,
  weekly_summary: Mail,
};

/** One kind of alert, with a switch for each channel it can currently route to. */
export function AlertItem({ alert }: { alert: AlertRow }) {
  const Icon = ICON[alert.kind];
  const channels = Object.keys(alert.routing) as AlertChannelKind[];

  return (
    <li className="flex flex-wrap items-start gap-4 border-b py-4.5 last:border-b-0">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-medium">{alert.label}</p>
        <p className="type-label mt-0.5">{alert.description}</p>
      </div>
      <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center">
        {channels.map((channel) => (
          <AlertChannelToggle key={channel} alertKind={alert.kind} channel={channel} checked={alert.routing[channel] ?? false} />
        ))}
      </div>
    </li>
  );
}
