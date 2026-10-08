"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { ErrorReference, StateMark } from "@repo/ui/components/states";
import { Logo } from "@/components/common/logo";

/** Catches a fault outside a brand (home, onboarding); the workspace has its own boundary (ST-1 "app"). */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-4 pt-10 text-center md:pt-16" role="alert">
      <Logo />
      <div className="mt-8">
        <StateMark kind="error" />
        <h1 className="type-title">This page didn&apos;t load</h1>
        <p className="mt-3.5 text-muted-foreground">Something went wrong on our side, not yours. Try again in a moment.</p>
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
    </main>
  );
}
