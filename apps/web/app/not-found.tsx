import Link from "next/link";
import { House } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { GoBackButton, StateMark } from "@repo/ui/components/states";
import { Logo } from "@/components/common/logo";
import { routes } from "@/config/routes";

/** An address that matches nothing (ST-2 "page"). */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-4 pt-10 text-center md:pt-16">
      <Logo />
      <div className="mt-8">
        <StateMark kind="missing" />
        <h1 className="type-title">We can&apos;t find that page</h1>
        <p className="mt-3.5 text-muted-foreground">The link may be old or have a typo. Check the address, or go back to where you were.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5 max-[560px]:flex-col-reverse">
          <GoBackButton />
          <Button asChild>
            <Link href={routes.home}>
              <House /> Go to your brands
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
