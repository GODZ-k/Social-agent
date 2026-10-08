import CalendarPage from "@/modules/calendar/templates/calendar-page";
import { routes } from "@/config/routes";

/** Same calendar body as `/c/[brandId]/calendar`, composed with the admin's own basePath. */
export default function AdminCalendarPage(props: { params: Promise<{ brandId: string }> }) {
  return <CalendarPage {...props} basePath={routes.admin.brand.base} />;
}
