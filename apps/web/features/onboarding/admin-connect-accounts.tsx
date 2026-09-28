"use client";

import { useState } from "react";
import { Check, LoaderCircle, Mail, X } from "lucide-react";
import type { Platform, SocialAccount } from "@social-agent/shared";
import { sendConnectLink, skipConnecting } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { ConnectAccountRow } from "@/features/onboarding/connect-account-row";
import { APP_NAME } from "@/lib/utils";

const PROMISES = [
  { ok: true, text: "Publish the posts you approve, at the times you approve." },
  { ok: true, text: "Read likes, saves and reach so the plan gets better." },
  { ok: true, text: "The client can disconnect any time in Settings." },
  { ok: false, text: "It never messages the client's followers or changes their profile." },
];

/**
 * Connect where to post, for an admin building a brand on a client's behalf (S17b in admin
 * context, 2026-09-28). The client can connect later themselves instead, with or without a link.
 */
export function AdminConnectAccounts({
  clientId,
  personName,
  platforms,
  initialAccounts,
  onContinue,
}: {
  clientId: string;
  personName: string;
  platforms: Platform[];
  initialAccounts: SocialAccount[];
  onContinue: () => void;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [lastConnected, setLastConnected] = useState<Platform | null>(null);
  const skip = useServerAction(skipConnecting, { onSuccess: onContinue });
  const sendLink = useServerAction(sendConnectLink, {
    success: (sent) => `Link sent to ${sent.email}`,
    failure: "Couldn't send the link.",
  });

  const connectedCount = accounts.filter((a) => a.status === "connected").length;
  const remaining = platforms.filter((p) => accounts.find((a) => a.platform === p)?.status !== "connected");

  function connected(account: SocialAccount) {
    setAccounts((prev) => [...prev.filter((a) => a.platform !== account.platform), account]);
    setLastConnected(account.platform);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="type-title">
        {lastConnected ? `${PLATFORM_LABEL[lastConnected]} is connected` : `Connect where ${personName} wants to post`}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {connectedCount > 0
          ? remaining.length > 0
            ? `Approved posts will go out at their times. Connect ${remaining.map((p) => PLATFORM_LABEL[p]).join(" and ")} too, or carry on.`
            : "Approved posts will go out on their own, at their times."
          : `Connecting lets approved posts go out on their own. ${personName} can connect later instead; nothing is posted without approval either way.`}
      </p>

      <div className="mt-7 grid gap-3">
        {platforms.map((platform) => (
          <ConnectAccountRow
            key={platform}
            clientId={clientId}
            platform={platform}
            account={accounts.find((a) => a.platform === platform) ?? null}
            primary={remaining[0] === platform}
            onConnected={connected}
          />
        ))}
      </div>

      <Panel className="mt-4 bg-tint shadow-none">
        <p className="font-medium">What {APP_NAME} can do once connected</p>
        <ul className="mt-3 grid gap-2">
          {PROMISES.map((p) => (
            <li key={p.text} className={p.ok ? "flex items-start gap-2" : "flex items-start gap-2 text-muted-foreground"}>
              {p.ok ? <Check className="mt-0.5 size-4 shrink-0 text-success" /> : <X className="mt-0.5 size-4 shrink-0" />}
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {connectedCount === 0 ? (
          <div className="flex w-full flex-wrap items-center gap-2">
            <Button variant="outline" className="max-[560px]:w-full" disabled={skip.isPending} onClick={() => skip.run(clientId)}>
              {skip.isPending && <LoaderCircle className="animate-spin" />}
              Skip, the client connects later
            </Button>
            <Button variant="ghost" className="max-[560px]:w-full" disabled={sendLink.isPending} onClick={() => sendLink.run(clientId)}>
              {sendLink.isPending ? <LoaderCircle className="animate-spin" /> : <Mail />}
              Send {personName} a link to connect
            </Button>
          </div>
        ) : (
          <>
            {remaining.length > 0 && (
              <Button variant="ghost" className="text-muted-foreground" onClick={onContinue}>
                Connect {remaining.map((p) => PLATFORM_LABEL[p]).join(" and ")} later
              </Button>
            )}
            <Button size="lg" className="ml-auto" onClick={onContinue}>
              Continue
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
