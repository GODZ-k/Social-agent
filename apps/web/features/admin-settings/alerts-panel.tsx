import type { AlertRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { AlertItem } from "./alert-item";

/** Which connected channels each kind of alert goes to. */
export function AlertsPanel({ alerts }: { alerts: AlertRow[] }) {
  return (
    <Panel>
      <PanelHeader
        className="mb-2"
        title="Alerts"
        description="Pick which connected channels each kind of alert goes to."
        right={<PanelStat value={alerts.length} caption="kinds" />}
      />
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
