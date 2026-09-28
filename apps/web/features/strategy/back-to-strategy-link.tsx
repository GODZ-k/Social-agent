import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";

export function BackToStrategyLink({ clientId, basePath = "/c" }: { clientId: string; basePath?: WorkspaceBasePath }) {
  return (
    <Link
      href={workspaceHref(basePath, clientId, "/strategy")}
      className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Strategy
    </Link>
  );
}
