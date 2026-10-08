import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { GoBackButton, StateMark } from "@repo/ui/components/states";
import { ADMIN_CLIENTS_PATH } from "@/modules/shell/utils/admin-nav-items";
import { Logo } from "@/components/common/logo";

/**
 * A brand id under /admin/c that's missing, archived, or unreachable (ST-2 "brand"), told the
 * same way regardless of which so nothing leaks. An admin has no personal "your brands" list —
 * every brand belongs to some brand — so the way back is the brand roster, not a brand switcher.
 */
export default function AdminWorkspaceNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-4 pt-10 text-center md:pt-16">
      <Logo />
      <div className="mt-8">
        <StateMark kind="missing" />
        <h1 className="type-title">This brand isn&apos;t available</h1>
        <p className="mt-3.5 text-muted-foreground">
          It may have been removed, or this account can&apos;t open it. If someone sent you the link, ask them to check it.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5 max-[560px]:flex-col-reverse">
          <GoBackButton />
          <Button asChild>
            <Link href={ADMIN_CLIENTS_PATH}>
              <Users /> Back to all brands
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
