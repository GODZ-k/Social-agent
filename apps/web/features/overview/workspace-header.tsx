import { ArrowUpRight } from "lucide-react";
import type { Client } from "@/lib/types";
import { prettyUrl } from "@/lib/utils";

export function WorkspaceHeader({ client }: { client: Client }) {
  return (
    <header className="mb-2">
      <h1 className="type-title">{client.name}</h1>
      <p className="mt-1.5 text-muted-foreground">
        {client.brand.tagline}
        <a href={client.url} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-0.5 font-medium text-tint-foreground hover:underline">
          {prettyUrl(client.url)}
          <ArrowUpRight className="size-3.5" />
        </a>
      </p>
    </header>
  );
}
