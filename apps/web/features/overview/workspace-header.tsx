import Link from "next/link";
import { ArrowUpRight, Pencil } from "lucide-react";
import type { Client } from "@/lib/types";
import { prettyUrl } from "@/lib/utils";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { Button } from "@repo/ui/components/button";

/** The header's "Ask for changes" opens the strategy page's ask-for-changes dialog. */
export function WorkspaceHeader({ client, basePath = "/c" }: { client: Client; basePath?: WorkspaceBasePath }) {
  return (
    <header className="mb-2 flex flex-wrap items-start justify-between gap-x-6 gap-y-4 sm:flex-nowrap">
      <div className="min-w-0">
        <h1 className="type-title">{client.name}</h1>
        <p className="mt-1.5 text-muted-foreground">
          {client.brand.tagline}
          <a href={client.url} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-0.5 font-medium text-tint-foreground hover:underline">
            {prettyUrl(client.url)}
            <ArrowUpRight className="size-3.5" />
          </a>
        </p>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link href={workspaceHref(basePath, client.id, "/strategy?ask=1")}>
          <Pencil /> Ask for changes
        </Link>
      </Button>
    </header>
  );
}
