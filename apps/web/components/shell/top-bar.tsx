import Link from "next/link";
import { Settings } from "lucide-react";
import type { Client, Viewer } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";
import { ThemeMenu } from "@repo/ui/components/theme-menu";
import { TopBarFrame } from "./top-bar-frame";
import { ClientSwitcher, type SwitchableClient } from "./client-switcher";
import { AgentChatButton } from "./agent-chat-button";
import { UserMenu } from "./user-menu";
import { InstallButton } from "@/components/pwa/install-button";

/** The switcher only needs these three fields, so only these three cross to the browser. */
function switchable({ id, name, accent }: Client): SwitchableClient {
  return { id, name, accent };
}

export function TopBar({ viewer, client, clients = [] }: { viewer: Viewer; client?: Client; clients?: Client[] }) {
  const isAdmin = viewer.role === "admin";

  return (
    <TopBarFrame>
        {client && (
          <>
            <span className="h-5 w-px bg-border" aria-hidden />
            <ClientSwitcher current={switchable(client)} clients={clients.map(switchable)} isAdmin={isAdmin} />
          </>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <AgentChatButton client={client} />
          {/* Settings lives in the rail on wide screens; the phone tab bar is already full. */}
          {client && (
            <Link
              href={`/c/${client.id}/settings`}
              aria-label="Settings"
              className="pressable grid size-8.5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            >
              <Settings className="size-4" />
            </Link>
          )}
          <InstallButton />
          <ThemeMenu />
          {isAdmin && <Badge variant="outline" className="max-md:hidden">Admin</Badge>}
          <UserMenu />
        </div>
    </TopBarFrame>
  );
}
