import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AuthHeading } from "@/components/auth/auth-heading";
import { StatusIcon } from "@/components/auth/status-icon";

/** Shown when a step is opened with nothing in progress, e.g. a bookmarked code page or another browser. */
export function FlowEnded() {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={Clock} tone="warning" />} title="This step has ended">
        It was started in another tab or browser, or it is too old to finish. Start again from sign in.
      </AuthHeading>
      <Button asChild size="lg" className="mt-6 w-full">
        <Link href="/sign-in">Back to sign in</Link>
      </Button>
    </>
  );
}
