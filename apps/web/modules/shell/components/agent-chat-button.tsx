"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import type { Brand } from "@/lib/types";
import { Button } from "@repo/ui/components/button";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

// The chat panel pulls in the AI client; load it only when someone opens it.
const AgentChat = dynamic(() => import("@/modules/agent/components/agent-chat").then((m) => m.AgentChat), {
  ssr: false,
});

export function AgentChatButton({ brand, basePath = routes.brand.base }: { brand?: Brand; basePath?: WorkspaceBase }) {
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
