"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Calendar, LoaderCircle, Lock, RefreshCw, TriangleAlert } from "lucide-react";
import { connectAccount, disconnectAccount } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { SocialAccountRow } from "@/lib/types";
import type { ConnectError } from "@social-agent/shared";
import { APP_NAME, cn } from "@/lib/utils";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

const CONNECT_ERROR_MESSAGE: Record<ConnectError, string> = {
  denied: "didn't give permission to publish. Leave every permission ticked, then try again.",
  invalid_state: "connection expired before it finished. Try connecting again.",
  account_in_use: "that account is already connected to another brand.",
  account_mismatch: "the account picked doesn't match. Reconnect with the right one.",
  missing_scopes: `didn't grant every permission ${APP_NAME} needs. Leave them all ticked, then try again.`,
  failed: "couldn't connect right now. Try again in a moment.",
};

function connectLabel(state: SocialAccountRow["state"], name: string): string {
  if (state === "expired") return `Reconnect ${name}`;
  if (state === "connect_failed") return "Try again";
  return `Connect ${name}`;
}

function outlineClass(failed: boolean, attention: boolean): string | undefined {
  if (failed) return "shadow-[0_0_0_2px_var(--destructive),var(--elevation-raised)]";
  if (attention) return "shadow-[0_0_0_2px_var(--warning),var(--elevation-raised)]";
  return undefined;
}

/** Each row owns its own actions, so a pending state never leaks onto another network's button. */
export function AccountRow({ brandId, account }: { brandId: string; account: SocialAccountRow }) {
  const name = PLATFORM_LABEL[account.platform];
  const connect = useServerAction(connectAccount, { success: `${name} connected` });
  const disconnect = useServerAction(disconnectAccount, { success: `${name} disconnected` });
  const attention = account.state === "expired" || (account.state === "not_connected" && account.postsWaiting > 0);
  const failed = account.state === "connect_failed";

  if (!account.inPlan) {
    return (
      <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-card p-4 shadow-raised md:p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground">
          <PlatformIcon platform={account.platform} className="size-5" />
        </span>
        <div className="min-w-0 flex-1 basis-48">
          <p className="font-medium">{name}</p>
          <p className="type-label mt-0.5">Not in your posting plan. Tick it in Brand kit, then connect it here.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="?tab=brand" scroll={false}>Add to plan</Link>
        </Button>
      </li>
    );
  }

  return (
    <li className={cn("grid gap-3 rounded-xl bg-card p-4 shadow-raised md:p-5", outlineClass(failed, attention))}>
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-md",
            account.state === "connected" ? "bg-tint text-tint-foreground" : "bg-secondary text-muted-foreground",
          )}
        >
          <PlatformIcon platform={account.platform} className="size-5" />
        </span>

        <div className="min-w-0 flex-1 basis-48">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            {name}
            {account.state === "connected" && <Badge variant="success">Connected</Badge>}
            {account.state === "expired" && <Badge variant="warning">Access expired</Badge>}
            {failed && <Badge variant="danger">Couldn&apos;t connect</Badge>}
            {account.state === "not_connected" && <Badge variant="neutral">Not connected</Badge>}
          </p>
          {account.handle && <p className="type-label mt-0.5">{account.handle}</p>}
          <ul className="type-label mt-2 grid gap-1">
            {account.connectedAt && (
              <li className="flex items-start gap-1.5">
                <Calendar className="mt-0.5 size-3.5 shrink-0" />
                Connected by you on {format(new Date(account.connectedAt), "d MMM yyyy")}
              </li>
            )}
            {account.state === "connected" && account.expiresAt && (
              <li className="flex items-start gap-1.5">
                <Lock className="mt-0.5 size-3.5 shrink-0" />
                Access lasts until {format(new Date(account.expiresAt), "d MMM")}. {APP_NAME} renews it on its own.
              </li>
            )}
            {account.postsWaiting > 0 && (
              <li className="flex items-start gap-1.5 text-warning">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                {account.postsWaiting} approved {account.postsWaiting === 1 ? "post is" : "posts are"} waiting for it.
              </li>
            )}
            {account.state === "expired" && (
              <li className="flex items-start gap-1.5">
                <RefreshCw className="mt-0.5 size-3.5 shrink-0" />
                Reconnect with the same {name} login and pick it again.
              </li>
            )}
          </ul>
        </div>

        <div className="flex shrink-0 gap-2">
          {account.state === "connected" ? (
            <Button variant="ghost" size="sm" disabled={disconnect.isPending} onClick={() => disconnect.run(brandId, account.platform)}>
              {disconnect.isPending && <LoaderCircle className="animate-spin" />}
              Disconnect
            </Button>
          ) : (
            <Button
              variant={attention || failed ? "default" : "outline"}
              size="sm"
              disabled={connect.isPending}
              onClick={() => connect.run(brandId, account.platform)}
            >
              {connect.isPending && <LoaderCircle className="animate-spin" />}
              {connect.isPending ? `Opening ${name}` : connectLabel(account.state, name)}
            </Button>
          )}
        </div>
      </div>

      {failed && account.connectError && (
        <div className="flex items-start gap-2.5 rounded-lg bg-destructive/8 p-3 text-[0.8125rem] text-destructive">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>
            <b className="font-semibold">{name} {CONNECT_ERROR_MESSAGE[account.connectError]}</b>
          </span>
        </div>
      )}
    </li>
  );
}
