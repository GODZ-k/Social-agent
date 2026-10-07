"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, LoaderCircle, Mail, X } from "lucide-react";
import type { Platform, SocialAccount } from "@social-agent/shared";
import { sendConnectLink, skipConnecting } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { ConnectAccountRow } from "@/components/onboarding/connect-account-row";
import { APP_NAME } from "@/lib/utils";

/**
 * Connecting where to post (S17b), updating in place as accounts connect (S17c). Always optional.
 *
 * The brand connecting their own accounts and an admin connecting on their behalf (2026-09-28) are
 * the same screen with different words and a different second button, so one body serves both and
 * the two exports at the bottom carry only what differs.
 */

interface ConnectCopy {
  heading: string;
  /** Shown before anything is connected; afterwards the step speaks for itself. */
  intro: string;
  canDisconnect: string;
  neverDoes: string;
  skipLabel: string;
}

interface Props {
  brandId: string;
  platforms: Platform[];
  initialAccounts: SocialAccount[];
  onContinue: () => void;
  /** Set when reached by stepping back into this step; see `QuestionnaireChat`. */
  onBack?: () => void;
}

function ConnectStep({
  brandId,
  platforms,
  initialAccounts,
  onContinue,
  onBack,
  copy,
  skipAside,
  continueArrow,
}: Props & {
  copy: ConnectCopy;
  /** What sits beside Skip while nothing is connected: a reassurance, or another way to connect. */
  skipAside: React.ReactNode;
  continueArrow: boolean;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [lastConnected, setLastConnected] = useState<Platform | null>(null);
  const skip = useServerAction(skipConnecting, { onSuccess: onContinue });

  const connectedCount = accounts.filter((a) => a.status === "connected").length;
  const remaining = platforms.filter((p) => accounts.find((a) => a.platform === p)?.status !== "connected");
  const remainingLabels = remaining.map((p) => PLATFORM_LABEL[p]).join(" and ");

  const promises = [
    { ok: true, text: "Publish the posts you approve, at the times you approve." },
    { ok: true, text: "Read likes, saves and reach so the plan gets better." },
    { ok: true, text: copy.canDisconnect },
    { ok: false, text: copy.neverDoes },
  ];

  function connected(account: SocialAccount) {
    setAccounts((prev) => [...prev.filter((a) => a.platform !== account.platform), account]);
    setLastConnected(account.platform);
  }

  return (
    <div className="mx-auto max-w-2xl">
      {onBack && (
        <Button type="button" variant="ghost" size="sm" className="-ml-2 mb-2" onClick={onBack}>
          <ArrowLeft aria-hidden />
          Back
        </Button>
      )}
      <h1 className="type-title">{lastConnected ? `${PLATFORM_LABEL[lastConnected]} is connected` : copy.heading}</h1>
      <p className="mt-2 text-muted-foreground">
        {connectedCount > 0
          ? remaining.length > 0
            ? `Approved posts will go out at their times. Connect ${remainingLabels} too, or carry on.`
            : "Approved posts will go out on their own, at their times."
          : copy.intro}
      </p>

      <div className="mt-7 grid gap-3">
        {platforms.map((platform) => (
          <ConnectAccountRow
            key={platform}
            brandId={brandId}
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
          {promises.map((p) => (
            <li key={p.text} className={p.ok ? "flex items-start gap-2" : "flex items-start gap-2 text-muted-foreground"}>
              {p.ok ? <Check className="mt-0.5 size-4 shrink-0 text-success" /> : <X className="mt-0.5 size-4 shrink-0" />}
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {connectedCount === 0 ? (
          <div className="flex w-full flex-wrap items-center gap-3">
            <Button variant="outline" className="max-[560px]:w-full" disabled={skip.isPending} onClick={() => skip.run(brandId)}>
              {skip.isPending && <LoaderCircle className="animate-spin" />}
              {copy.skipLabel}
            </Button>
            {skipAside}
          </div>
        ) : (
          <>
            {remaining.length > 0 && (
              <Button variant="ghost" className="text-muted-foreground" onClick={onContinue}>
                Connect {remainingLabels} later
              </Button>
            )}
            <Button size="lg" className="ml-auto" onClick={onContinue}>
              Continue
              {continueArrow && <ArrowRight />}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

const BRAND_COPY: ConnectCopy = {
  heading: "Connect where you want to post",
  intro: "Connecting lets approved posts go out on their own. You can do it now or later; nothing is posted without your approval either way.",
  canDisconnect: "You can disconnect any time in Settings.",
  neverDoes: "It never messages your followers or changes your profile.",
  skipLabel: "Skip, connect later",
};

/** The brand connecting their own accounts. */
export function ConnectAccounts(props: Props) {
  return (
    <ConnectStep
      {...props}
      copy={BRAND_COPY}
      continueArrow
      skipAside={
        <p className="type-label flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" />
          You can still approve posts. They wait, and go out once you connect.
        </p>
      }
    />
  );
}

/**
 * An admin connecting on a brand's behalf. Instead of the brand's reassurance it offers the other
 * way out: email them a link so they can connect the accounts themselves.
 */
export function AdminConnectAccounts({ personName, ...props }: Props & { personName: string }) {
  const sendLink = useServerAction(sendConnectLink, {
    success: (sent) => `Link sent to ${sent.email}`,
    failure: "Couldn't send the link.",
  });

  return (
    <ConnectStep
      {...props}
      continueArrow={false}
      copy={{
        heading: `Connect where ${personName} wants to post`,
        intro: `Connecting lets approved posts go out on their own. ${personName} can connect later instead; nothing is posted without approval either way.`,
        canDisconnect: "The brand can disconnect any time in Settings.",
        neverDoes: "It never messages the brand's followers or changes their profile.",
        skipLabel: "Skip, the brand connects later",
      }}
      skipAside={
        <Button variant="ghost" className="max-[560px]:w-full" disabled={sendLink.isPending} onClick={() => sendLink.run(props.brandId)}>
          {sendLink.isPending ? <LoaderCircle className="animate-spin" /> : <Mail />}
          Send {personName} a link to connect
        </Button>
      }
    />
  );
}
