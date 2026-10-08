import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ErrorState } from "@repo/ui/components/states";
import { routes } from "@/config/routes";

export default function AdminClientNotFound() {
  return (
    <main className="px-4">
      <ErrorState error={new Error("This client doesn't exist.")} />
      <div className="flex justify-center">
        <Button asChild variant="ghost">
          <Link href={routes.admin.clients.list}>Back to Clients</Link>
        </Button>
      </div>
    </main>
  );
}
