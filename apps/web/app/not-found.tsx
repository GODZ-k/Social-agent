import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ErrorState } from "@repo/ui/components/states";
import { Logo } from "@/components/shell/logo";

/**
 * Catches notFound() thrown above a segment's own boundary, such as the
 * workspace layout rejecting an unknown or inaccessible client id.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-4 pt-10 md:pt-16">
      <Logo />
      <ErrorState error={new Error("This page doesn't exist, or you don't have access to it.")} />
      <Button asChild variant="ghost">
        <Link href="/">Back to all clients</Link>
      </Button>
    </main>
  );
}
