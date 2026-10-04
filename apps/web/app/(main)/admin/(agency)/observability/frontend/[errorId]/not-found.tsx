import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ErrorState } from "@repo/ui/components/states";

export default function FrontendErrorNotFound() {
  return (
    <main className="px-4">
      <ErrorState error={new Error("This error doesn't exist, or it aged out.")} />
      <div className="flex justify-center">
        <Button asChild variant="ghost">
          <Link href="/admin/observability/frontend">Back to Frontend</Link>
        </Button>
      </div>
    </main>
  );
}
