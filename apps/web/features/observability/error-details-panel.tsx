import { format, parseISO } from "date-fns";
import type { FrontendErrorDetail } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RankedBars } from "@repo/ui/components/social/charts";
import { PanelHeader } from "@repo/ui/components/panel-header";

/** Where it shows up: page, release, devices, and which browsers saw it. */
export function ErrorDetailsPanel({ error }: { error: FrontendErrorDetail }) {
  return (
    <Panel>
      <PanelHeader title="Details" description="Where it shows up." />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="type-label">Page</p>
          <p className="mt-0.5 font-mono text-[0.8125rem]">{error.page}</p>
        </div>
        <div>
          <p className="type-label">Release</p>
          <p className="mt-0.5">{format(parseISO(error.release.at), "d MMM, h:mm a")}</p>
        </div>
        <div>
          <p className="type-label">Devices</p>
          <p className="mt-0.5">
            {error.devices.desktop} desktop, {error.devices.phone} phone
          </p>
        </div>
        <div>
          <p className="type-label">Session replay</p>
          <p className="mt-0.5 text-muted-foreground">Not recorded</p>
        </div>
      </div>
      {error.browsers.length > 0 && (
        <>
          <h3 className="type-heading mt-5 mb-3 text-base">Browsers</h3>
          <RankedBars rows={error.browsers.map((b) => ({ label: b.name, value: b.times }))} metric="Times" />
        </>
      )}
    </Panel>
  );
}
