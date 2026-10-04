"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { ErrorReference, StateMark } from "@repo/ui/components/states";

/**
 * Catches a fault on one workspace page (ST-1 "workspace"); the layout's rail and tab bar
 * are outside this boundary, so the rest of the workspace still works from the menu. Any
 * page under /c/:brandId can throw here, so the title stays as generic as the app-level one.
 */
export default function WorkspaceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-lg px-4 pt-4 text-center md:pt-8" role="alert">
      <StateMark kind="error" />
      <h1 className="type-title">This page didn&apos;t load</h1>
      <p className="mt-3.5 text-muted-foreground">
        Something went wrong on our side, not yours. The rest of this workspace still works from the menu. Try again in a moment.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2.5 max-[560px]:flex-col-reverse">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft /> Go back
        </Button>
        <Button onClick={reset}>
          <RefreshCw /> Try again
        </Button>
      </div>
      <ErrorReference error={error} />
    </div>
  );
}
