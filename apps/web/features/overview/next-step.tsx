import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowRight, CircleAlert } from "lucide-react";
import type { Client, PostView } from "@/lib/types";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { Button } from "@repo/ui/components/button";
import { FailedNextStep } from "./failed-next-step";

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

interface Action {
  href: string;
  label: string;
  variant: "outline" | "default";
  icon?: React.ReactNode;
}

interface Step {
  title: string;
  body: string;
  warning?: string;
  actions: Action[];
}

/** The single most useful thing to do for this client right now. */
export function NextStep({
  client,
  reviewPosts,
  failedPosts = [],
  basePath = "/c",
}: {
  client: Client;
  reviewPosts: PostView[];
  /** Posts the network refused (FL-2): these come before every other next step. */
  failedPosts?: PostView[];
  basePath?: WorkspaceBasePath;
}) {
  if (failedPosts.length > 0) return <FailedNextStep posts={failedPosts} client={client} basePath={basePath} />;

  const step = nextStep(client, reviewPosts, basePath);

  return (
    <section className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 rounded-xl bg-tint p-5 md:p-6">
      <div className="min-w-0">
        <h2 className="type-heading text-tint-foreground">{step.title}</h2>
        <p className="mt-1 text-tint-foreground/80">{step.body}</p>
        {step.warning && (
          <p className="mt-2 flex items-center gap-2 text-[0.8125rem] text-warning">
            <CircleAlert className="size-3.5 shrink-0" />
            {step.warning}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2.5 max-[560px]:w-full max-[560px]:flex-col">
        {step.actions.map((action) => (
          <Button key={action.href + action.label} asChild variant={action.variant} size="lg" className="max-[560px]:w-full">
            <Link href={action.href}>
              {action.icon}
              {action.label}
              {action.variant === "default" && <ArrowRight />}
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}

/** Ordered by what blocks the loop first: approvals, then unconnected accounts, then the stage. */
function nextStep(client: Client, reviewPosts: PostView[], basePath: WorkspaceBasePath): Step {
  const base = workspaceHref(basePath, client.id);
  const unconnected = client.platforms.filter((p) => client.accounts.find((a) => a.platform === p)?.status !== "connected");
  const pending = reviewPosts.length;

  if (pending > 0) {
    const first = reviewPosts[0]!;
    const when = first.scheduledFor ? parseISO(first.scheduledFor) : null;
    const actions: Action[] = [];
    if (unconnected.length === 1) {
      actions.push({
        href: `${base}/settings?tab=accounts`,
        label: `Connect ${PLATFORM_LABEL[unconnected[0]!]}`,
        variant: "outline",
        icon: <PlatformIcon platform={unconnected[0]!} />,
      });
    } else if (unconnected.length > 1) {
      actions.push({ href: `${base}/settings?tab=accounts`, label: "Connect accounts", variant: "outline" });
    }
    actions.push({ href: `${base}/approvals`, label: `Review ${pending} ${pending === 1 ? "post" : "posts"}`, variant: "default" });

    return {
      title: `${pending} ${pending === 1 ? "post is" : "posts are"} waiting for you`,
      body: when
        ? `${pending === 1 ? "It" : "The first one"} goes out ${format(when, "EEEE d MMMM")} at ${format(when, "h:mm a")} if you approve it.`
        : "Nothing is published until you approve it.",
      warning: unconnected.length
        ? `${listFormat.format(unconnected.map((p) => PLATFORM_LABEL[p]))} ${unconnected.length === 1 ? "isn't" : "aren't"} connected yet, so approved posts can't publish.`
        : undefined,
      actions,
    };
  }

  if (unconnected.length > 0) {
    return {
      title: `Connect ${listFormat.format(unconnected.map((p) => PLATFORM_LABEL[p]))} so posts can go out`,
      body: "The agent can plan and draft without it, but approved posts have nowhere to publish until the account is connected.",
      actions: [{ href: `${base}/settings?tab=accounts`, label: "Connect accounts", variant: "default" }],
    };
  }

  if (client.stage === "strategy") {
    return {
      title: "The strategy is ready to read",
      body: "Check the pillars and posting rhythm, then let the agent start drafting.",
      actions: [{ href: `${base}/strategy`, label: "Read the strategy", variant: "default" }],
    };
  }

  if (client.stage === "learning") {
    return {
      title: "The agent has learned something",
      body: "Last month's results changed what it plans to post. See what and why.",
      actions: [{ href: `${base}/analytics`, label: "See what changed", variant: "default" }],
    };
  }

  return {
    title: "Everything is on schedule",
    body: "Posts are approved and queued. Check the calendar to see what goes out when.",
    actions: [{ href: `${base}/calendar`, label: "Open calendar", variant: "default" }],
  };
}
