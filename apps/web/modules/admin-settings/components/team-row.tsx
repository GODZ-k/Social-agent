"use client";

import { format } from "date-fns";
import { Clock, LoaderCircle, Mail, Trash2 } from "lucide-react";
import { removeTeammate } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { TeamMember } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { PersonAvatar } from "@/modules/admin/components/person-avatar";

/** The owner outranks an invite: an owner row never shows as invited. */
function standingOf(member: TeamMember): "owner" | "invited" | "admin" {
  if (member.role === "owner") return "owner";
  if (member.status === "invited") return "invited";
  return "admin";
}

/** One teammate: avatar, name and email, a role badge, then the one action that fits. */
export function TeamRow({ member, isYou }: { member: TeamMember; isYou: boolean }) {
  const remove = useServerAction(removeTeammate, { success: `${member.name} removed` });
  const invited = member.status === "invited";
  const standing = standingOf(member);

  return (
    <li className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b py-3.5 last:border-b-0">
      <PersonAvatar name={member.name} email={member.email} invited={invited} className="size-9 text-[0.8125rem]" />
      <div className="min-w-0 flex-1 basis-40">
        <p className="font-medium">
          {member.name}
          {isYou && " (you)"}
        </p>
        <p className="type-label">{member.email}</p>
      </div>
      {standing === "owner" && <Badge variant="tint">Owner</Badge>}
      {standing === "invited" && (
        <Badge variant="neutral">
          <Mail className="size-3" />
          Invited
        </Badge>
      )}
      {standing === "admin" && <Badge variant="neutral">Admin</Badge>}
      <div className="ml-auto">
        {standing === "invited" && (
          <span className="type-label flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Invited {format(new Date(member.invitedAt), "d MMM")}
          </span>
        )}
        {standing === "admin" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={remove.isPending}
            onClick={() => remove.run(member.id)}
            aria-label={`Remove ${member.name}`}
          >
            {remove.isPending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
            Remove
          </Button>
        )}
      </div>
    </li>
  );
}
