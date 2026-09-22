"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ErrorState } from "@repo/ui/components/states";
import { Logo } from "@/components/shell/logo";

/** Catches faults on the home and onboarding routes; the workspace has its own boundary. */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-4 pt-10 md:pt-16">
      <Logo />
      <ErrorState error={error} onRetry={reset} />
      <Button asChild variant="ghost">
        <Link href="/">Back to all clients</Link>
      </Button>
    </main>
  );
}
