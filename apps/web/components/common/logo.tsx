import Link from "next/link";
import { APP_NAME } from "@/lib/utils";
import { LogoMark } from "@repo/ui/components/logo-mark";
import { routes } from "@/config/routes";

export function Logo({ wordmark = false }: { wordmark?: boolean }) {
  return (
    <Link href={routes.home} className="flex items-center gap-2 rounded-full pr-1 font-display text-[1.0625rem] font-semibold tracking-tight">
      <LogoMark />
      {/* Icon only once the bar is tight, so the brand switcher keeps room for its name; onboarding has no switcher to protect. */}
      <span className={wordmark ? undefined : "max-[560px]:hidden"}>{APP_NAME}</span>
    </Link>
  );
}
