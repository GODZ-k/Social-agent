import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";

/** ADM-4/5: starts the full onboarding flow for this client, same as a client onboarding themselves. */
export function AddBrandLink({ clientId, personName, size = "default" }: { clientId: string; personName: string; size?: "default" | "sm" }) {
  return (
    <Button size={size} asChild>
      <Link href={`/admin/c/${clientId}/brand/new`}>
        <Plus /> Add a brand for {personName}
      </Link>
    </Button>
  );
}
