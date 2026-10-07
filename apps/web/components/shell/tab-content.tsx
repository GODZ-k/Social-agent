"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { spring } from "@repo/ui/lib/motion";
import { cn } from "@/lib/utils";

const tabClass = "pressable relative flex min-w-0 flex-col items-center gap-0.5 rounded-[1.375rem] px-1 py-1.5 text-[0.65rem] font-medium";

/** The icon, label and count of a tab, shared by links and the More button. */
export function TabContent({ label, icon: Icon, active, count = 0 }: { label: string; icon: LucideIcon; active: boolean; count?: number }) {
  return (
    <>
      {active && (
        <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-[inherit] bg-tint-strong" transition={spring.snappy} />
      )}
      <span className="relative">
        <Icon aria-hidden className="size-5" strokeWidth={active ? 2.2 : 1.8} />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold text-primary-foreground tabular-nums">
            {count}
            <span className="sr-only"> waiting</span>
          </span>
        )}
      </span>
      <span className="relative truncate">{label}</span>
    </>
  );
}

export function tabClassName(active: boolean) {
  return cn(tabClass, active ? "text-tint-foreground" : "text-muted-foreground hover:text-foreground");
}

/** One place in the phone and tablet tab bar. */
export function TabLink({ href, label, icon, active, count }: { href: string; label: string; icon: LucideIcon; active: boolean; count?: number }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={tabClassName(active)}>
      <TabContent label={label} icon={icon} active={active} count={count} />
    </Link>
  );
}
