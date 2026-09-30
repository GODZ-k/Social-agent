import CalendarPage from "@/app/c/[brandId]/calendar/page";

/** Same calendar body as `/c/[brandId]/calendar`, composed with the admin's own basePath. */
export default function AdminCalendarPage(props: { params: Promise<{ brandId: string }> }) {
  return <CalendarPage {...props} basePath="/admin/c" />;
}
