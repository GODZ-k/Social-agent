"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import type { Client } from "@/lib/types";
import { Button } from "@repo/ui/components/button";

// The chat panel pulls in the AI client; load it only when someone opens it.
const AgentChat = dynamic(() => import("@/features/agent/agent-chat").then((m) => m.AgentChat), {
  ssr: false,
});

export function AgentChatButton({ client }: { client?: Client }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);

  return (
    <>
      <Button
        variant="tint"
        size="sm"
        onClick={() => {
          setChatMounted(true);
          setChatOpen(true);
        }}
        className="max-sm:size-8.5 max-sm:px-0"
      >
        <Sparkles />
        <span className="max-sm:sr-only">Ask the agent</span>
      </Button>
      {chatMounted && <AgentChat open={chatOpen} onOpenChange={setChatOpen} client={client} />}
    </>
  );
}
