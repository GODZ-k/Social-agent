"use client";

import { usePathname } from "next/navigation";
import { ADMIN_CLIENTS_PATH, ADMIN_NAV_ITEMS } from "@/modules/shell/utils/admin-nav-items";
import { RailFrame } from "./frames";
import { RailLink } from "./rail-link";
import { AdminTabBarFrame } from "./frames";
import { TabLink } from "./tab-content";
import { routes } from "@/config/routes";

/** The admin area's places: Clients and Observability, as a rail on desktop and a tab bar below 1024px. */
export function AdminNav({
  // Mock until the admin layout can pass how many clients the agency has.
  clientsCount = 4,
}: {
  clientsCount?: number;
}) {
  const pathname = usePathname();
  const items = ADMIN_NAV_ITEMS.map((item) => ({
    ...item,
    active: pathname.startsWith(item.href),
    count: item.href === ADMIN_CLIENTS_PATH ? clientsCount : 0,
  }));
  // Observability's own pages drop the tab bar; only Clients keeps it below 1024px.
  const showTabBar = !pathname.startsWith(routes.admin.observability.overview);

  return (
    <>
      <RailFrame label="Admin">
        {items.map((item) => (
          <RailLink key={item.href} {...item} />
        ))}
      </RailFrame>
      {showTabBar && (
        <AdminTabBarFrame label="Admin">
          {items.map((item) => (
            <TabLink key={item.href} {...item} />
          ))}
        </AdminTabBarFrame>
      )}
    </>
  );
}
