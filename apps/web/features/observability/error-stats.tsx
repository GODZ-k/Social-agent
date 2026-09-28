import { format, formatDistanceToNow, parseISO } from "date-fns";
import type { FrontendErrorDetail } from "@/lib/types";
import { StatTile } from "./stat-tile";

/** People, times, and when it was first and last seen. */
export function ErrorStats({ error }: { error: FrontendErrorDetail }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="People" value={error.people}>
        Across {error.clients.length} clients
      </StatTile>
      <StatTile label="Times" value={error.times}>
        Since it was first seen
      </StatTile>
      <StatTile label="First seen" value={format(parseISO(error.firstSeenAt), "h:mm a")}>
        {format(parseISO(error.firstSeenAt), "d MMM")}
      </StatTile>
      <StatTile label="Last seen" value={formatDistanceToNow(parseISO(error.lastSeenAt), { addSuffix: true })}>
        {error.status === "fixed" ? "Fixed" : "Still happening"}
      </StatTile>
    </div>
  );
}
