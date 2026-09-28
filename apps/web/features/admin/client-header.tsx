import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ArrowLeft, Check, Mail } from "lucide-react";
import type { AdminClientRow } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { PersonAvatar } from "./person-avatar";

/** ADM-4: who this client is, whether they've signed in, and the admin's way to add a brand for them. */
export function ClientHeader({ client, action }: { client: AdminClientRow; action?: React.ReactNode }) {
  const active = client.status === "active";
  const subtitle =
    client.status === "invited"
      ? "Hasn't signed in yet."
      : `${client.brandCount === 1 ? "1 brand" : `${client.brandCount} brands`}. ${
          client.lastActivity.at ? `Last active ${formatDistanceToNow(parseISO(client.lastActivity.at), { addSuffix: true })}.` : ""
        }`;

  return (
    <div className="mb-5">
      <Link href="/admin/clients" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Clients
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <PersonAvatar name={client.name} email={client.email} invited={client.status === "invited"} className="size-12 text-base" />
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="type-title">{client.name ?? client.email}</h1>
              <Badge variant={active ? "success" : "neutral"}>
                {active ? <Check /> : <Mail />} {active ? "Active" : "Invited"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}
