import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Notice } from "@/components/auth/notice";
import { StatusIcon } from "@/components/auth/status-icon";

export function RecoverySent() {
  return (
    <>
      <AuthHeading icon={<StatusIcon icon={CircleCheck} tone="success" />} title="Recovery request sent">
        We&apos;ll email you within 1 working day to book a short video call. Keep your ID handy.
      </AuthHeading>
      <Notice tone="info">Your account stays locked until then. Posts that were already approved still go out on schedule.</Notice>
      <Button asChild size="lg" variant="outline" className="mt-6 w-full">
        <Link href="/sign-in">Back to sign in</Link>
      </Button>
    </>
  );
}
