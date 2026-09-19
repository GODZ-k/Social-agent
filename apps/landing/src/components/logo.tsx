import Link from "next/link";
import { LogoMark } from "@repo/ui/components/logo-mark";
import { APP_NAME } from "@/lib/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-full pr-1 font-display text-[1.0625rem] font-semibold tracking-tight">
      <LogoMark />
      {APP_NAME}
    </Link>
  );
}
