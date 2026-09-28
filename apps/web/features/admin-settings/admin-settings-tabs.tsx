"use client";

import { usePathname, useRouter } from "next/navigation";
import { ADMIN_SETTINGS_TABS, type AdminSettingsTab } from "./tabs";
import { Segmented } from "@repo/ui/components/segmented";

export function AdminSettingsTabs({ tab }: { tab: AdminSettingsTab }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Segmented
      label="Settings section"
      className="mb-6"
      value={tab}
      onValueChange={(next) => router.replace(`${pathname}?tab=${next}`, { scroll: false })}
      options={[...ADMIN_SETTINGS_TABS]}
    />
  );
}
