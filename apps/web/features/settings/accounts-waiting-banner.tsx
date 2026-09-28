import { Clock } from "lucide-react";
import type { SocialAccountRow } from "@/lib/types";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";

function join(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function waitingDetail(waitingNames: string[], stillPublishing: string[]): string {
  if (waitingNames.length > 1) return `Connect ${join(waitingNames)} and they go out.`;
  const reconnect = `They go out once you reconnect ${waitingNames[0]} below.`;
  if (stillPublishing.length === 0) return reconnect;
  return `${reconnect} ${join(stillPublishing)} posts are publishing as planned.`;
}

/** The only reason anyone lands on this tab unprompted: posts stuck behind a disconnected account. */
export function AccountsWaitingBanner({ accounts }: { accounts: SocialAccountRow[] }) {
  const waiting = accounts.filter((a) => a.postsWaiting > 0);
  if (waiting.length === 0) return null;

  const total = waiting.reduce((sum, a) => sum + a.postsWaiting, 0);
  const waitingNames = waiting.map((a) => PLATFORM_LABEL[a.platform]);
  const stillPublishing = accounts
    .filter((a) => a.state === "connected" && a.postsWaiting === 0)
    .map((a) => PLATFORM_LABEL[a.platform]);

  const detail = waitingDetail(waitingNames, stillPublishing);

  return (
    <div className="flex items-start gap-4 rounded-xl bg-warning/10 p-4 md:p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-warning/16 text-warning">
        <Clock className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold">
          {total} approved {total === 1 ? "post is" : "posts are"} waiting for {join(waitingNames)}
        </p>
        <p className="type-label mt-0.5">{detail}</p>
      </div>
    </div>
  );
}
