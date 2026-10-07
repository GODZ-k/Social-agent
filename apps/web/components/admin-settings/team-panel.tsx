import type { TeamMember } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { TeamRow } from "./team-row";

/** Everyone at the agency who can sign in as an admin. */
export function TeamPanel({ team, viewerEmail }: { team: TeamMember[]; viewerEmail: string }) {
  const active = team.filter((m) => m.status === "active");
  return (
    <Panel>
      <PanelHeader
        className="mb-1"
        title="Your team"
        description="Everyone at The Scale Agency who can sign in as an admin. Admins see every client."
        right={<PanelStat value={active.length} caption="admins" />}
      />
      <ul>
        {team.map((member) => (
          <TeamRow key={member.id} member={member} isYou={member.email === viewerEmail} />
        ))}
      </ul>
    </Panel>
  );
}
