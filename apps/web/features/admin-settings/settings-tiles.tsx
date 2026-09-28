import { Link as LinkIcon, Mail, UsersRound } from "lucide-react";
import type { NotificationChannel, TeamMember } from "@/lib/types";
import { AttentionTile } from "@/features/admin/attention-tile";
import { summarizeNames } from "@/features/admin/format";
import { CHANNEL_LABEL } from "./channel-meta";

/** Names what's connected, then invites adding whatever isn't. */
function channelsDetail(connected: NotificationChannel[], unconnected: NotificationChannel[]): string {
  const connectedNames = summarizeNames(connected.map((c) => CHANNEL_LABEL[c.kind]));
  const unconnectedNames = summarizeNames(unconnected.map((c) => CHANNEL_LABEL[c.kind]));
  const addMore = `Add ${unconnectedNames} to route alerts there too.`;
  if (connected.length === 0) return addMore;
  if (unconnected.length === 0) return `${connectedNames}.`;
  return `${connectedNames}. ${addMore}`;
}

/** What needs a look before the tabs themselves: admins, pending invites, connected channels. */
export function SettingsTiles({ team, channels }: { team: TeamMember[]; channels: NotificationChannel[] }) {
  const active = team.filter((m) => m.status === "active");
  const pending = team.filter((m) => m.status === "invited");
  const connectable = channels.filter((c) => c.kind !== "email");
  const connected = connectable.filter((c) => c.connected);
  const unconnected = connectable.filter((c) => !c.connected);

  return (
    <section aria-label="Settings at a glance" className="mb-5 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
      <AttentionTile
        icon={UsersRound}
        tone="tint"
        count={active.length}
        label={active.length === 1 ? "admin" : "admins"}
        detail={`${summarizeNames(active.map((m) => m.name))} can sign in as an admin.`}
        href="/admin/settings?tab=team"
        linkLabel="Manage team"
      />
      <AttentionTile
        icon={Mail}
        tone={pending.length > 0 ? "warning" : "clear"}
        count={pending.length}
        label={pending.length === 1 ? "invite pending" : "invites pending"}
        detail={pending.length > 0 ? `${summarizeNames(pending.map((m) => m.name))}, invited most recently.` : "Nothing waiting."}
        href="/admin/settings?tab=team"
        linkLabel="Resend or cancel"
      />
      <AttentionTile
        icon={LinkIcon}
        tone="tint"
        count={connected.length}
        label={connected.length === 1 ? "channel connected" : "channels connected"}
        detail={channelsDetail(connected, unconnected)}
        href="/admin/settings?tab=notifications"
        linkLabel="Manage channels"
      />
    </section>
  );
}
