import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ErrorState } from "@repo/ui/components/states";

export default function WorkspaceNotFound() {
  return (
    <main className="px-4">
      <ErrorState error={new Error("This client doesn't exist, or you don't have access to it.")} />
      <div className="flex justify-center">
        <Button asChild variant="ghost">
          <Link href="/">Back to all clients</Link>
        </Button>
      </div>
    </main>
  );
}
