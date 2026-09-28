import { format } from "date-fns";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";

/**
 * BA-2: password age, with a link into the same reset flow sign-in uses to change it.
 * No dedicated "change password while signed in" screen exists yet, so this reuses it.
 */
export function PasswordPanel({ changedAt }: { changedAt: string }) {
  return (
    <Panel>
      <div className="mb-4">
        <h2 className="type-heading">Password</h2>
        <p className="type-label mt-1 text-muted-foreground">At least 10 characters, not common or leaked.</p>
      </div>
      <div className="flex items-center gap-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-[0.875rem] bg-secondary text-muted-foreground">
          <Lock className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Password</p>
          <p className="type-label text-muted-foreground">Changed {format(new Date(changedAt), "d MMM yyyy")}.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/forgot-password">Change password</Link>
        </Button>
      </div>
    </Panel>
  );
}
