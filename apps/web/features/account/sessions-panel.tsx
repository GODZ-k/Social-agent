import { formatDistanceToNow } from "date-fns";
import { Monitor, Smartphone } from "lucide-react";
import type { DeviceSession } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";
import { SignOutDevicesButton } from "./sign-out-devices-button";

function activityLine(session: DeviceSession): string {
  if (session.current) return `${session.location}. Active now.`;
  return `${session.location}. Last active ${formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}.`;
}

/** BA-2: where the person is signed in, mocked against a session list (Clerk and Better Auth both expose one). */
export function SessionsPanel({ sessions }: { sessions: DeviceSession[] }) {
  const others = sessions.filter((s) => !s.current).length;
  return (
    <Panel>
      <div className="mb-4">
        <h2 className="type-heading">Where you&rsquo;re signed in</h2>
        <p className="type-label mt-1 text-muted-foreground">Sign out anywhere you don&rsquo;t recognise, then change your password.</p>
      </div>
      <ul className="divide-y divide-border">
        {sessions.map((session) => {
          const Icon = session.device === "iPhone" ? Smartphone : Monitor;
          return (
            <li key={session.id} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-[0.875rem] bg-secondary text-muted-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {session.device}, {session.browser}
                  {session.current && <Badge variant="success">This device</Badge>}
                </p>
                <p className="type-label text-muted-foreground">{activityLine(session)}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex justify-end border-t border-border pt-4">
        <SignOutDevicesButton otherCount={others} />
      </div>
    </Panel>
  );
}
