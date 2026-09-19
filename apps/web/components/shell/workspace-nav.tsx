"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CalendarDays, ChartNoAxesCombined, CircleCheckBig, Compass, LayoutGrid, House } from "lucide-react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Ordered the way work moves through the agent: plan, make, approve, publish, learn.
const items = [
  { segment: "", label: "Overview", icon: House },
  { segment: "strategy", label: "Strategy", icon: Compass },
  { segment: "content", label: "Content", icon: LayoutGrid },
  { segment: "approvals", label: "Approvals", icon: CircleCheckBig },
  { segment: "calendar", label: "Calendar", icon: CalendarDays },
  { segment: "analytics", label: "Analytics", icon: ChartNoAxesCombined },
] as const;

/**
 * One nav, two postures: a floating rail beside the content on wide screens,
 * a tab bar within thumb reach on phones. Both are translucent so content
 * scrolls underneath rather than being cut off by a bar.
 */
export function WorkspaceNav({ clientId, pendingApprovals }: { clientId: string; pendingApprovals: number }) {
  const pathname = usePathname();
  const base = `/c/${clientId}`;
  const active = pathname === base ? "" : (pathname.slice(base.length + 1).split("/")[0] ?? "");

  return (
    <nav
      aria-label="Workspace"
      className={cn(
        "material fixed z-40 flex",
        "inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] justify-between rounded-[1.75rem] p-1.5",
        "lg:inset-x-auto lg:top-24 lg:bottom-auto lg:left-5 lg:w-52 lg:flex-col lg:justify-start lg:gap-0.5 lg:rounded-xl lg:p-2",
      )}
    >
      {items.map(({ segment, label, icon: Icon }) => {
        const isActive = segment === active;
        const badge = segment === "approvals" && pendingApprovals > 0 ? pendingApprovals : null;
        return (
          <Link
            key={segment}
            href={segment ? `${base}/${segment}` : base}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "pressable relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[1.375rem] px-1 py-1.5 text-[0.65rem] font-medium",
              "lg:flex-none lg:flex-row lg:gap-3 lg:rounded-md lg:px-3 lg:py-2.5 lg:text-sm",
              isActive ? "text-tint-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="workspace-nav-pill"
                className="absolute inset-0 rounded-[inherit] bg-tint-strong"
                transition={spring.snappy}
              />
            )}
            <span className="relative">
              <Icon className="size-5 lg:size-[1.125rem]" strokeWidth={isActive ? 2.2 : 1.8} />
              {badge && (
                <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold text-primary-foreground tabular-nums lg:hidden">
                  {badge}
                </span>
              )}
            </span>
            <span className="relative truncate">{label}</span>
            {badge && (
              <span className="relative ml-auto hidden h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[0.6875rem] font-semibold text-primary-foreground tabular-nums lg:grid">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
