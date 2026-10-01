"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import type { Brand } from "@/lib/types";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { Button } from "@repo/ui/components/button";

// The chat panel pulls in the AI client; load it only when someone opens it.
const AgentChat = dynamic(() => import("@/features/agent/agent-chat").then((m) => m.AgentChat), {
  ssr: false,
});

export function AgentChatButton({ brand, basePath = "/c" }: { brand?: Brand; basePath?: WorkspaceBasePath }) {
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
        className="max-[560px]:size-9 max-[560px]:px-0"
      >
        <Sparkles />
        <span className="max-[560px]:sr-only">Ask the agent</span>
      </Button>
      {chatMounted && <AgentChat open={chatOpen} onOpenChange={setChatOpen} brand={brand} basePath={basePath} />}
    </>
  );
}
