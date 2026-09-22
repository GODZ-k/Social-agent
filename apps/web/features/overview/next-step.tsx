import Link from "next/link";
import type { Client } from "@/lib/types";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { Button } from "@repo/ui/components/button";

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

interface Step {
  title: string;
  body: string;
  href: string;
  cta: string;
}

/** The single most useful thing to do for this client right now. */
export function NextStep({ client }: { client: Client }) {
  const step = nextStep(client);

  return (
    <section className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-xl bg-tint p-5 md:p-6">
      <div className="min-w-0">
        <h2 className="type-heading text-tint-foreground">{step.title}</h2>
        <p className="mt-1 text-tint-foreground/80">{step.body}</p>
      </div>
      <Button asChild size="lg">
        <Link href={step.href}>{step.cta}</Link>
      </Button>
    </section>
  );
}

/** Ordered by what blocks the loop first: publishing, then approvals, then the stage. */
function nextStep(client: Client): Step {
  const base = `/c/${client.id}`;
  // Planned networks that can't publish yet: never connected, or access has lapsed.
  const unconnected = client.platforms.filter((p) => client.accounts.find((a) => a.platform === p)?.status !== "connected");

  // Nothing can be published without an account, so this outranks everything else.
  if (unconnected.length > 0) {
    return {
      title: `Connect ${listFormat.format(unconnected.map((p) => PLATFORM_LABEL[p]))} so posts can go out`,
      body: "The agent can plan and draft without it, but approved posts have nowhere to publish until the account is connected.",
      href: `${base}/settings?tab=accounts`,
      cta: "Connect accounts",
    };
  }

  const pending = client.stats.pendingApprovals;
  if (pending > 0) {
    return {
      title: `${pending} ${pending === 1 ? "post is" : "posts are"} waiting for your approval`,
      body: "Swipe through them. Nothing is published until you say so.",
      href: `${base}/approvals`,
      cta: "Review posts",
    };
  }

  if (client.stage === "strategy") {
    return {
      title: "The strategy is ready to read",
      body: "Check the pillars and posting rhythm, then let the agent start drafting.",
      href: `${base}/strategy`,
      cta: "Read the strategy",
    };
  }

  if (client.stage === "learning") {
    return {
      title: "The agent has learned something",
      body: "Last month's results changed what it plans to post. See what and why.",
      href: `${base}/analytics`,
      cta: "See what changed",
    };
  }

  return {
    title: "Everything is on schedule",
    body: "Posts are approved and queued. Check the calendar to see what goes out when.",
    href: `${base}/calendar`,
    cta: "Open calendar",
  };
}
