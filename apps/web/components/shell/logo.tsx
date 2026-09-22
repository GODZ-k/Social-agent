import Link from "next/link";
import { APP_NAME } from "@/lib/utils";
import { LogoMark } from "@repo/ui/components/logo-mark";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-full pr-1 font-display text-[1.0625rem] font-semibold tracking-tight">
      <LogoMark />
      {APP_NAME}
    </Link>
  );
}
