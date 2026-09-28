import Link from "next/link";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Check, ChevronRight, Mail } from "lucide-react";
import type { AdminClientRow } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { PersonAvatar } from "./person-avatar";
import { ClientNeedsCell } from "./client-needs-cell";

/**
 * The client list: one panel with a divider between rows. Below 900px each
 * row reflows into a stacked card (avatar and status on top, everything else
 * indented under the name) instead of a second, separately maintained list.
 */
export function ClientsTable({ clients }: { clients: AdminClientRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-raised">
      <table className="w-full border-collapse text-sm">
        <thead className="hidden min-[900px]:table-header-group">
          <tr className="border-b">
            <th scope="col" className="px-5 py-3 text-left font-medium text-muted-foreground">Client</th>
            <th scope="col" className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th scope="col" className="px-5 py-3 text-left font-medium text-muted-foreground">Brands</th>
            <th scope="col" className="px-5 py-3 text-left font-medium text-muted-foreground">Needs you</th>
            <th scope="col" className="px-5 py-3 text-left font-medium text-muted-foreground">Last activity</th>
            <th scope="col" className="px-5 py-3"><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody className="block min-[900px]:table-row-group">
          {clients.map((client) => (
            <tr
              key={client.id}
              className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 border-b p-4 transition-colors last:border-0 hover:bg-tint/60 min-[900px]:table-row min-[900px]:items-center min-[900px]:gap-0 min-[900px]:p-0"
            >
              <td className="min-w-0 min-[900px]:table-cell min-[900px]:px-5 min-[900px]:py-3">
                {/* `after:` stretches this link over the whole row, so any cell opens the client. */}
                <Link href={`/admin/clients/${client.id}`} className="flex min-w-0 items-center gap-3 after:absolute after:inset-0">
                  <PersonAvatar name={client.name} email={client.email} invited={client.status === "invited"} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{client.name ?? client.email}</span>
                    {client.name && <span className="type-label block truncate">{client.email}</span>}
                  </span>
                </Link>
              </td>
              <td className="self-center min-[900px]:table-cell min-[900px]:px-5 min-[900px]:py-3">
                <Badge variant={client.status === "active" ? "success" : "neutral"}>
                  {client.status === "active" ? <Check /> : <Mail />} {client.status === "active" ? "Active" : "Invited"}
                </Badge>
              </td>
              <td className="col-span-2 pl-[3.25rem] min-[900px]:table-cell min-[900px]:col-span-1 min-[900px]:pl-0 min-[900px]:px-5 min-[900px]:py-3">
                {client.brands.length === 0 ? (
                  <span className="type-label">No brand yet</span>
                ) : (
                  <span className="flex flex-wrap gap-x-3 gap-y-1">
                    {client.brands.map((brand) => (
                      <span key={brand.id} className="flex items-center gap-1.5 whitespace-nowrap">
                        <span aria-hidden className="grid size-4.5 place-items-center rounded-[30%] text-[0.625rem] font-semibold text-white" style={{ background: brand.accent }}>
                          {brand.name.charAt(0)}
                        </span>
                        {brand.name}
                      </span>
                    ))}
                  </span>
                )}
              </td>
              <td className="col-span-2 pl-[3.25rem] min-[900px]:table-cell min-[900px]:pl-0 min-[900px]:px-5 min-[900px]:py-3">
                <ClientNeedsCell client={client} />
              </td>
              <td className="col-span-2 flex flex-wrap items-baseline gap-2 pl-[3.25rem] min-[900px]:table-cell min-[900px]:block min-[900px]:pl-0 min-[900px]:px-5 min-[900px]:py-3 min-[900px]:whitespace-nowrap">
                {client.status === "invited" && !client.lastSignedInAt ? (
                  <>
                    <span className="block">Never signed in</span>
                    <span className="type-label">Invited {format(parseISO(client.invitedAt!), "d MMM")}</span>
                  </>
                ) : client.lastActivity.at ? (
                  <>
                    <span className="block">{formatDistanceToNow(parseISO(client.lastActivity.at), { addSuffix: true })}</span>
                    <span className="type-label">{client.lastActivity.what}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">No activity yet</span>
                )}
              </td>
              <td className="hidden text-muted-foreground min-[900px]:table-cell min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-right">
                <ChevronRight aria-hidden />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
