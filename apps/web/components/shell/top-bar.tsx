"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus, Sparkles, Users } from "lucide-react";
import { clientsQuery } from "@/lib/api/queries";
import type { Client } from "@/lib/types";
import { APP_NAME } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientAvatar } from "./client-avatar";

// The chat panel pulls in the AI client; load it only when someone opens it.
const AgentChat = dynamic(() => import("@/components/agent/agent-chat").then((m) => m.AgentChat), {
  ssr: false,
});

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-full pr-1 font-display text-[1.0625rem] font-semibold tracking-tight">
      {/* Three bars at a posting rhythm: short, long, medium. */}
      <svg viewBox="0 0 24 24" className="size-6 text-primary" aria-hidden>
        <rect x="3" y="9" width="4.5" height="10" rx="2.25" fill="currentColor" opacity=".55" />
        <rect x="9.75" y="4" width="4.5" height="15" rx="2.25" fill="currentColor" />
        <rect x="16.5" y="7" width="4.5" height="12" rx="2.25" fill="currentColor" opacity=".8" />
      </svg>
      {APP_NAME}
    </Link>
  );
}

export function TopBar({ client }: { client?: Client }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pt-3 md:px-5">
        <div className="material mx-auto flex h-14 max-w-[88rem] items-center gap-2 rounded-full pr-2 pl-4 md:gap-3">
          <Logo />
          {client && (
            <>
              <span className="h-5 w-px bg-border" aria-hidden />
              <ClientSwitcher current={client} />
            </>
          )}
          <div className="ml-auto flex items-center gap-1.5">
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
          </div>
        </div>
      </header>
      {chatMounted && <AgentChat open={chatOpen} onOpenChange={setChatOpen} client={client} />}
    </>
  );
}

function ClientSwitcher({ current }: { current: Client }) {
  const router = useRouter();
  const { data: clients } = useQuery(clientsQuery());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="pressable flex min-w-0 items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm font-medium hover:bg-accent data-[state=open]:bg-accent">
        <ClientAvatar client={current} className="size-7 text-xs" />
        <span className="truncate">{current.name}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Switch client</DropdownMenuLabel>
        {clients?.map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => router.push(`/c/${c.id}`)}>
            <ClientAvatar client={c} className="size-6 text-[0.6875rem]" />
            <span className="flex-1 truncate">{c.name}</span>
            {c.id === current.id && <Check className="text-foreground!" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/")}>
          <Users /> All clients
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/onboarding")}>
          <Plus /> Add a client
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
