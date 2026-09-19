import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { SiteHeader } from "@/components/site-header";

// Rendered outside the (site) group, so it brings the header itself.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid min-h-[70dvh] max-w-md place-items-center px-4 text-center">
        <div>
          <h1 className="type-title">That page isn&apos;t here.</h1>
          <p className="mt-3 text-muted-foreground">The address may be mistyped, or the page may have moved.</p>
          <Button asChild className="mt-6">
            <Link href="/">Back to the start</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
