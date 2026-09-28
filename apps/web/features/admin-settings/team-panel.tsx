import type { TeamMember } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { TeamRow } from "./team-row";

/** Everyone at the agency who can sign in as an admin. */
export function TeamPanel({ team, viewerEmail }: { team: TeamMember[]; viewerEmail: string }) {
  const active = team.filter((m) => m.status === "active");
  return (
    <Panel>
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Your team</h2>
          <p className="type-label mt-1">Everyone at The Scale Agency who can sign in as an admin. Admins see every client.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{active.length}</p>
          <p className="type-label mt-0.5">admins</p>
        </div>
      </div>
      <ul>
        {team.map((member) => (
          <TeamRow key={member.id} member={member} isYou={member.email === viewerEmail} />
        ))}
      </ul>
    </Panel>
  );
}
