"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ErrorState } from "@repo/ui/components/states";

export default function WorkspaceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="px-4">
      <ErrorState error={error} onRetry={reset} />
      <div className="flex justify-center">
        <Button asChild variant="ghost">
          <Link href="/">Back to all clients</Link>
        </Button>
      </div>
    </main>
  );
}
