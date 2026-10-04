import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ErrorState } from "@repo/ui/components/states";

export default function RunNotFound() {
  return (
    <main className="px-4">
      <ErrorState error={new Error("This run doesn't exist, or has aged out.")} />
      <div className="flex justify-center">
        <Button asChild variant="ghost">
          <Link href="/admin/observability/agents">Back to Agents</Link>
        </Button>
      </div>
    </main>
  );
}
