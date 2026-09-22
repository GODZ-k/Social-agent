import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { Logo } from "@/components/shell/logo";
import { Button } from "@repo/ui/components/button";

export const metadata: Metadata = { title: "Offline" };

/** Served by the service worker when a navigation fails. Static, so it is cacheable. */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-4 pt-10 text-center md:pt-16">
      <Logo />
      <WifiOff className="mt-16 size-7 text-muted-foreground" />
      <h1 className="type-heading mt-3">You&apos;re offline</h1>
      <p className="mt-2 max-w-[40ch] text-muted-foreground">
        Nothing is lost. Approvals and edits need a connection, so reconnect and try again.
      </p>
      <Button asChild variant="outline" className="mt-6">
        {/* A full reload is the point: the router cache holds nothing useful once offline. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/">Try again</a>
      </Button>
    </main>
  );
}
