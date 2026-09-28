"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { spring } from "@repo/ui/lib/motion";
import { cn } from "@/lib/utils";

/** One place in the desktop rail. The active pill slides between links instead of blinking. */
export function RailLink({
  href,
  label,
  icon: Icon,
  active,
  count = 0,
  className,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  count?: number;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "pressable relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium",
        active ? "text-tint-foreground" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {active && (
        <motion.span layoutId="rail-pill" className="absolute inset-0 rounded-[inherit] bg-tint-strong" transition={spring.snappy} />
      )}
      <Icon aria-hidden className="relative size-[1.125rem]" strokeWidth={active ? 2.2 : 1.8} />
      <span className="relative truncate">{label}</span>
      {count > 0 && (
        <span className="relative ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[0.6875rem] font-semibold text-primary-foreground tabular-nums">
          {count}
          <span className="sr-only"> waiting</span>
        </span>
      )}
    </Link>
  );
}
