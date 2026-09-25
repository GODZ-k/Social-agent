/**
 * Chat transport for the "Ask the agent" panel.
 *
 * Until the API exposes a chat route, replies are produced here, in the
 * browser, as the same AG-UI event stream a real server sends. Going live is
 * a one-line change in `agent-chat.tsx`:
 *
 *   connection: fetchServerSentEvents(`${API_URL}/chat`)
 */
import { generateMessageId, type ConnectConnectionAdapter, type UIMessage } from "@tanstack/ai-react";
import { EventType, type StreamChunk } from "@tanstack/ai/client";
import type { Client } from "@/lib/types";

/** What the mock knows about the open workspace. Set by the chat panel. */
let context: Client | undefined;
export const setAgentContext = (client: Client | undefined) => {
  context = client;
};

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(timer); resolve(); }, { once: true });
  });
}

function lastUserText(messages: readonly unknown[]): string {
  const last = [...messages].reverse().find((m) => (m as UIMessage).role === "user") as UIMessage | undefined;
  if (!last) return "";
  if (Array.isArray(last.parts)) {
    return last.parts.map((p) => (p.type === "text" ? p.content : "")).join(" ");
  }
  const content = (last as unknown as { content?: unknown }).content;
  return typeof content === "string" ? content : "";
}

function reply(question: string): string {
  const q = question.toLowerCase();
  const name = context?.name ?? "your clients";
  if (!context) {
    return "Open a client and I can answer with their numbers. From here I can tell you how the loop works: I read a website, draft a brand kit, plan a strategy, write posts for your approval, publish on schedule, then rewrite the strategy from the results.";
  }
  if (/(best|top|work|perform)/.test(q)) {
    return `For ${name}, short reels are doing the most work: they finish at roughly twice the rate of longer cuts, and carousels earn about three times the saves of single images. Weekend product posts are the weak spot, so I've moved those to weekdays in the next plan.`;
  }
  if (/(when|time|schedule|often|cadence)/.test(q)) {
    return `${name} has ${context.stats.scheduled} posts queued. I'm posting when their followers have been most active over the last four weeks, which is weekday mornings and Thursday evenings. You can move any post from the calendar.`;
  }
  if (/(approve|review|waiting|pending)/.test(q)) {
    const n = context.stats.pendingApprovals;
    return n > 0
      ? `${n} ${n === 1 ? "post is" : "posts are"} waiting for you in Approvals. Each one says why I made it. Nothing is published until you approve it.`
      : `Nothing is waiting on you for ${name} right now. I'll send the next batch for approval before anything new is scheduled.`;
  }
  if (/(idea|write|draft|caption|post about)/.test(q)) {
    return `Here's one in ${name}'s voice (${context.brand.voice.slice(0, 2).join(", ").toLowerCase()}): open on a close-up with no intro, put the one-line hook on screen for the first two seconds, and end the caption with a question. If you like the direction, use "Draft 6 more posts" in Content and I'll write them up properly.`;
  }
  return `I'm working on ${name} (${context.industry.toLowerCase()}). Engagement is at ${context.stats.engagementRate}% with ${context.stats.followers.toLocaleString("en")} followers. Ask me what's working, what's scheduled, what needs approval, or for post ideas.`;
}

async function* run(text: string, threadId: string, runId: string, signal?: AbortSignal): AsyncGenerator<StreamChunk> {
  const messageId = generateMessageId();
  yield { type: EventType.RUN_STARTED, threadId, runId, timestamp: Date.now() };
  await delay(450, signal); // thinking time, so the typing indicator is visible
  yield { type: EventType.TEXT_MESSAGE_START, messageId, role: "assistant", timestamp: Date.now() };
  for (const word of text.split(/(?<=\s)/)) {
    if (signal?.aborted) break;
    await delay(28, signal);
    yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: word, timestamp: Date.now() };
  }
  yield { type: EventType.TEXT_MESSAGE_END, messageId, timestamp: Date.now() };
  yield { type: EventType.RUN_FINISHED, threadId, runId, finishReason: "stop", timestamp: Date.now() };
}

// Module scope: useChat captures its connection once, on first render.
export const mockAgentConnection: ConnectConnectionAdapter = {
  connect(messages, _data, abortSignal, runContext) {
    const question = lastUserText(messages);
    const text = reply(question);
    return run(text, runContext?.threadId ?? "local", runContext?.runId ?? "local", abortSignal);
  },
};
