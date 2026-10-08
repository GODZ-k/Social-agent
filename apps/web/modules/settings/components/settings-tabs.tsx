"use client";

import { usePathname, useRouter } from "next/navigation";
import { TABS } from "@/modules/settings/utils/tabs";
import type { BrandSettingsTab } from "@/config/routes";
import { Segmented } from "@repo/ui/components/segmented";

export function SettingsTabs({ tab, needsConnection }: { tab: BrandSettingsTab; needsConnection: number }) {
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
