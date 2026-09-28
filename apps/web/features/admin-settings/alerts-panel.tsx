import type { AlertRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { AlertItem } from "./alert-item";

/** Which connected channels each kind of alert goes to. */
export function AlertsPanel({ alerts }: { alerts: AlertRow[] }) {
  return (
    <Panel>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Alerts</h2>
          <p className="type-label mt-1">Pick which connected channels each kind of alert goes to.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{alerts.length}</p>
          <p className="type-label mt-0.5">kinds</p>
        </div>
      </div>
      <ul>
        {alerts.map((alert) => (
          <AlertItem key={alert.kind} alert={alert} />
        ))}
      </ul>
      <p className="type-label mt-4 border-t pt-4">
        Connect Slack or WhatsApp above and they show up here too. Sign-in and account alerts (new device, two-factor changes) are personal
        and stay in <b className="font-medium text-foreground">Your account</b>, from the account menu.
      </p>
    </Panel>
  );
}
