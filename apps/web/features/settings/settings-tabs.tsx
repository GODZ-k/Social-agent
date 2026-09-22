"use client";

import { usePathname, useRouter } from "next/navigation";
import { TABS, type Tab } from "@/features/settings/tabs";
import { Segmented } from "@repo/ui/components/segmented";

export function SettingsTabs({ tab, needsConnection }: { tab: Tab; needsConnection: number }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Segmented
      label="Settings section"
      className="mb-6"
      value={tab}
      onValueChange={(next) => router.replace(`${pathname}?tab=${next}`, { scroll: false })}
      options={TABS.map((t) => (t.value === "accounts" && needsConnection > 0 ? { ...t, count: needsConnection } : t))}
    />
  );
}
