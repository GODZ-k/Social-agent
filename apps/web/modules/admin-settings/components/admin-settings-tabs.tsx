"use client";

import { usePathname, useRouter } from "next/navigation";
import { ADMIN_SETTINGS_TABS } from "@/modules/admin-settings/utils/tabs";
import type { AgencySettingsTab } from "@/config/routes";
import { Segmented } from "@repo/ui/components/segmented";

export function AdminSettingsTabs({ tab }: { tab: AgencySettingsTab }) {
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
