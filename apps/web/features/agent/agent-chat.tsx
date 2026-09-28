"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChat, type UIMessage } from "@tanstack/ai-react";
import { motion } from "motion/react";
import { Send, Square } from "lucide-react";
import { APPROVAL_INTENT, mockAgentConnection, setAgentContext } from "./agent-connection";
import { getReviewQueuePosts } from "@/lib/api/actions";
import type { Client, PostView } from "@/lib/types";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { spring } from "@repo/ui/lib/motion";
import { cn } from "@/lib/utils";
import { Sheet } from "@repo/ui/components/sheet";
import { Button } from "@repo/ui/components/button";
import { PostChip } from "@/features/overview/post-chip";

const SUGGESTIONS = ["What needs my approval?", "What's working best?", "When are we posting?", "Give me a post idea"];
const OPENING_QUESTION = "What needs my approval this week?";
const textOf = (message: UIMessage) => message.parts.map((p) => (p.type === "text" ? p.content : "")).join("");

export function AgentChat({
  open,
  onOpenChange,
  client,
  basePath = "/c",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  basePath?: WorkspaceBasePath;
}) {
  const pathname = usePathname();
  const [reviewPosts, setReviewPosts] = useState<PostView[]>([]);

  useEffect(() => {
    if (!client) return;
    let active = true;
    // A read, but the chat is a client component, so it goes through an action like a write does.
    getReviewQueuePosts(client.id).then((result) => {
      if (active && result.ok) setReviewPosts(result.data);
    });
    return () => {
      active = false;
    };
  }, [client]);

  useEffect(() => setAgentContext(client, reviewPosts), [client, reviewPosts]);

  const { messages, sendMessage, isLoading, stop, error } = useChat({
    connection: mockAgentConnection,
    // A new thread per client, so one client's conversation never shows under another.
    threadId: client?.id ?? "all-clients",
  });

  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Posts to show under the assistant's next reply, matched by message id once it appears.
  const pendingPosts = useRef<PostView[] | null>(null);
  const [postsByMessage, setPostsByMessage] = useState<Record<string, PostView[]>>({});

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant" || !pendingPosts.current) return;
    if (lastMessage.id in postsByMessage) return;
    setPostsByMessage((current) => ({ ...current, [lastMessage.id]: pendingPosts.current! }));
    pendingPosts.current = null;
  }, [messages, postsByMessage]);

  function send(text: string) {
    const value = text.trim();
    if (!value || isLoading) return;
    if (APPROVAL_INTENT.test(value) && reviewPosts.length > 0) pendingPosts.current = reviewPosts.slice(0, 2);
    void sendMessage(value);
    setDraft("");
  }

  // Opens with a proactive question already asked, once, so the sheet never shows empty
  // when there's something waiting on the owner (matches S04's seeded opening exchange).
  const greeted = useRef(false);
  useEffect(() => {
    if (greeted.current || !open || !client || messages.length > 0 || reviewPosts.length === 0) return;
    greeted.current = true;
    send(OPENING_QUESTION);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- send() closes over reviewPosts/isLoading; the ref guard makes this fire once
  }, [open, client, messages.length, reviewPosts]);

  const last = messages[messages.length - 1];
  const waiting = isLoading && last?.role === "user";
  const unconnected = client?.platforms.filter((p) => client.accounts.find((a) => a.platform === p)?.status !== "connected") ?? [];
  const askedTexts = new Set(messages.filter((m) => m.role === "user").map(textOf));
  const chips = SUGGESTIONS.filter((s) => !askedTexts.has(s)).slice(0, 2);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Ask the agent"
      description={
        client ? `About ${client.name}. It can read, plan and draft; it never publishes.` : "About any of your clients"
      }
      className="max-md:inset-0 max-md:max-h-none max-md:rounded-none [&>div:first-child]:hidden [&_footer]:border-t-0"
      footer={
        <div className="grid w-full gap-2.5">
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="pressable rounded-full bg-card px-3.5 py-1.5 text-sm font-medium text-foreground ring-1 ring-border hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <label className="sr-only" htmlFor="agent-input">Message</label>
            <textarea
              id="agent-input"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Ask about results or ideas"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-[1.375rem] bg-secondary px-4 py-2.5 text-[0.9375rem] outline-none [field-sizing:content] placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-primary"
            />
            {isLoading ? (
              <button type="button" onClick={stop} aria-label="Stop" className="pressable grid size-11 shrink-0 place-items-center rounded-full bg-secondary">
                <Square className="size-3.5 fill-current" />
              </button>
            ) : (
              <button type="submit" disabled={!draft.trim()} aria-label="Send" className="pressable grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
                <Send className="size-4" strokeWidth={2.2} />
              </button>
            )}
          </form>
        </div>
      }
    >
      <div className="flex min-h-[40dvh] flex-col gap-3 pt-1" aria-live="polite">
        {messages.length === 0 && (
          <p className="my-auto max-w-[34ch] text-muted-foreground">
            Ask about {client ? `${client.name}'s` : "a client's"} results, what&apos;s scheduled, or what to post next.
          </p>
        )}

        {messages.map((message) => {
          const text = textOf(message);
          if (!text) return null;
          const mine = message.role === "user";
          const posts = postsByMessage[message.id];
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={spring.snappy}
              style={{ transformOrigin: mine ? "100% 100%" : "0% 100%" }}
              className={cn("flex max-w-[86%] flex-col gap-2", mine ? "self-end items-end" : "self-start items-start")}
            >
              <div
                className={cn(
                  "rounded-[1.25rem] px-4 py-2.5 leading-relaxed whitespace-pre-wrap",
                  mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-secondary",
                )}
              >
                {text}
              </div>
              {client && posts?.map((post) => (
                <PostChip key={post.id} post={post} brand={client.brand} href={`${pathname}?post=${post.id}`} className="w-full max-w-80" />
              ))}
              {client && posts && posts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link href={workspaceHref(basePath, client.id, "/approvals")}>
                      Review {reviewPosts.length} {reviewPosts.length === 1 ? "post" : "posts"}
                    </Link>
                  </Button>
                  {unconnected.length > 0 && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={workspaceHref(basePath, client.id, "/settings?tab=accounts")}>Connect accounts</Link>
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}

        {waiting && (
          <div className="flex gap-1 self-start rounded-[1.25rem] rounded-bl-md bg-secondary px-4 py-3.5" role="status" aria-label="The agent is thinking">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}

        {error && <p role="alert" className="text-sm text-destructive">The agent couldn&apos;t reply. {error.message}</p>}
        <div ref={endRef} />
      </div>
    </Sheet>
  );
}
