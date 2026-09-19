"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@tanstack/ai-react";
import { motion } from "motion/react";
import { ArrowUp, Square } from "lucide-react";
import { mockAgentConnection, setAgentContext } from "@/lib/api/agent-connection";
import type { Client } from "@/lib/types";
import { spring } from "@repo/ui/lib/motion";
import { cn } from "@/lib/utils";
import { Sheet } from "@repo/ui/components/sheet";

const SUGGESTIONS = ["What's working best?", "What needs my approval?", "When are we posting?", "Give me a post idea"];

export function AgentChat({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}) {
  useEffect(() => setAgentContext(client), [client]);

  const { messages, sendMessage, isLoading, stop, error } = useChat({
    connection: mockAgentConnection,
    // A new thread per client, so one client's conversation never shows under another.
    threadId: client?.id ?? "all-clients",
  });

  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isLoading]);

  function send(text: string) {
    const value = text.trim();
    if (!value || isLoading) return;
    void sendMessage(value);
    setDraft("");
  }

  const last = messages[messages.length - 1];
  const waiting = isLoading && last?.role === "user";

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Ask the agent"
      description={client ? `About ${client.name}` : "About any of your clients"}
      footer={
        <form
          className="flex w-full items-end gap-2"
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
            placeholder="Ask about results, schedule or ideas"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-[1.375rem] bg-secondary px-4 py-2.5 text-[0.9375rem] outline-none [field-sizing:content] placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-primary"
          />
          {isLoading ? (
            <button type="button" onClick={stop} aria-label="Stop" className="pressable grid size-11 shrink-0 place-items-center rounded-full bg-secondary">
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button type="submit" disabled={!draft.trim()} aria-label="Send" className="pressable grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
              <ArrowUp className="size-4.5" strokeWidth={2.4} />
            </button>
          )}
        </form>
      }
    >
      <div className="flex min-h-[40dvh] flex-col gap-3 pt-1" aria-live="polite">
        {messages.length === 0 && (
          <div className="my-auto grid gap-4 py-6">
            <p className="max-w-[34ch] text-muted-foreground">
              Ask about {client ? `${client.name}'s` : "a client's"} results, what&apos;s scheduled, or what to post next.
            </p>
            <ul className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => send(s)} className="pressable rounded-full bg-tint px-3.5 py-2 text-sm font-medium text-tint-foreground hover:bg-tint-strong">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((message) => {
          const text = message.parts.map((p) => (p.type === "text" ? p.content : "")).join("");
          if (!text) return null;
          const mine = message.role === "user";
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={spring.snappy}
              style={{ transformOrigin: mine ? "100% 100%" : "0% 100%" }}
              className={cn(
                "max-w-[86%] rounded-[1.25rem] px-4 py-2.5 leading-relaxed whitespace-pre-wrap",
                mine ? "self-end rounded-br-md bg-primary text-primary-foreground" : "self-start rounded-bl-md bg-secondary",
              )}
            >
              {text}
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
