"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Strategy } from "@/lib/types";
import { StrategyDraftBanner } from "./strategy-draft-banner";
import { StrategyStartedBanner } from "./strategy-started-banner";
import { AskForChangesDialog } from "./ask-for-changes-dialog";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/**
 * Picks the draft (S20a) or started (S20c) banner and owns the ask-for-changes
 * dialog, which either one can open. `askOpen` opens it from the overview
 * page's `?ask=1` link, which always lands here as a fresh navigation, so the
 * initial state alone is enough. Closing it clears that query.
 */
export function StrategyBanner({
  strategy,
  askOpen,
  basePath = routes.brand.base,
}: {
  strategy: Strategy;
  askOpen: boolean;
  basePath?: WorkspaceBase;
}) {
  const [open, setOpen] = useState(askOpen);
  const router = useRouter();
  const pathname = usePathname();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && askOpen) router.replace(pathname);
  }

  return (
    <>
      {strategy.status === "draft" ? (
        <StrategyDraftBanner strategy={strategy} onAskForChanges={() => handleOpenChange(true)} />
      ) : (
        <StrategyStartedBanner strategy={strategy} onAskForChanges={() => handleOpenChange(true)} basePath={basePath} />
      )}
      <AskForChangesDialog brandId={strategy.brandId} open={open} onOpenChange={handleOpenChange} />
    </>
  );
}
