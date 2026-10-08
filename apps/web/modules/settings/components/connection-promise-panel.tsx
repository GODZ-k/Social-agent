import { Check, X } from "lucide-react";
import { APP_NAME } from "@/lib/utils";

/** What a connection is for, said plainly, since the OAuth screen it leads to asks for broad permissions. */
export function ConnectionPromisePanel() {
  return (
    <div className="rounded-xl bg-tint p-5 md:p-6">
      <p className="font-semibold">What {APP_NAME} does with a connection</p>
      <div className="mt-3 grid gap-2 text-sm">
        <p className="flex items-start gap-2">
          <Check className="mt-0.5 size-4 shrink-0" />
          Publishes the posts you approve, at the times you approve.
        </p>
        <p className="flex items-start gap-2">
          <Check className="mt-0.5 size-4 shrink-0" />
          Reads likes, saves and reach so the plan gets better.
        </p>
        <p className="flex items-start gap-2 text-muted-foreground">
          <X className="mt-0.5 size-4 shrink-0" />
          Never messages your followers or changes your profile.
        </p>
      </div>
    </div>
  );
}
