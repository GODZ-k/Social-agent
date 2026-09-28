"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { TabContent, tabClassName } from "./tab-content";

/** One place in the phone and tablet tab bar. */
export function TabLink({ href, label, icon, active, count }: { href: string; label: string; icon: LucideIcon; active: boolean; count?: number }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={tabClassName(active)}>
      <TabContent label={label} icon={icon} active={active} count={count} />
    </Link>
  );
}
