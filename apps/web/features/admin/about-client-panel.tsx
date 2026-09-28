import { format, parseISO } from "date-fns";
import type { AdminClientRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";

/** From the invite and their account: email, phone, when they joined and were last seen. */
export function AboutClientPanel({ client, archivedCount = 0 }: { client: AdminClientRow; archivedCount?: number }) {
  return (
    <Panel>
      <h2 className="type-heading">About</h2>
      <p className="type-label mt-1 mb-4">From the invite and their account.</p>
      <dl className="grid gap-3">
        <Row label="Email">
          <a href={`mailto:${client.email}`} className="text-tint-foreground hover:underline">
            {client.email}
          </a>
        </Row>
        <Row label="Phone">{client.phone ?? <span className="text-muted-foreground">Not given</span>}</Row>
        <Row label={client.status === "invited" ? "Invited" : "Client since"}>
          {format(parseISO(client.status === "invited" ? client.invitedAt! : client.createdAt), "d MMM")}, by you
        </Row>
        <Row label="Last signed in">
          {client.lastSignedInAt ? format(parseISO(client.lastSignedInAt), "d MMM, h:mm a") : <span className="text-muted-foreground">Never</span>}
        </Row>
        <Row label="Brands">
          {client.brandCount}
          {archivedCount > 0 ? `, and ${archivedCount} archived` : ""}
        </Row>
      </dl>
    </Panel>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0">
      <dt className="type-label">{label}</dt>
      <dd className="text-right text-[0.9375rem]">{children}</dd>
    </div>
  );
}
