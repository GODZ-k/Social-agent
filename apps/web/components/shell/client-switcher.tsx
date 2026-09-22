"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import type { Client } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { ClientAvatar } from "@repo/ui/components/social/client-avatar";

/** All the switcher shows of a client: its avatar, its name and where it links. */
export type SwitchableClient = Pick<Client, "id" | "name" | "accent">;

export function ClientSwitcher({
  current,
  clients,
  isAdmin,
}: {
  current: SwitchableClient;
  clients: SwitchableClient[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  // An agency has clients. Someone running their own account has brands.
  const noun = isAdmin ? "client" : "brand";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="pressable flex min-w-0 items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm font-medium hover:bg-accent data-[state=open]:bg-accent">
        <ClientAvatar client={current} className="size-7 text-xs" />
        <span className="truncate">{current.name}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Switch {noun}</DropdownMenuLabel>
        {clients.map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => router.push(`/c/${c.id}`)}>
            <ClientAvatar client={c} className="size-6 text-[0.6875rem]" />
            <span className="flex-1 truncate">{c.name}</span>
            {c.id === current.id && <Check className="text-foreground!" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {/* With a single brand the list page just sends you back here, so it isn't offered. */}
        {(isAdmin || clients.length > 1) && (
          <DropdownMenuItem onSelect={() => router.push("/")}>
            <Users /> All {noun}s
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => router.push("/onboarding")}>
          <Plus /> {isAdmin ? "Add a client" : "Add another brand"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
