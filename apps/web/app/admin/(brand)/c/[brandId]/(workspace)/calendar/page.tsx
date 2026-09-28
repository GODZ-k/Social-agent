import CalendarPage from "@/app/c/[brandId]/calendar/page";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** Same calendar body as `/c/[brandId]/calendar`, composed with the admin's own basePath. */
export default function AdminCalendarPage(props: { params: Promise<{ brandId: string }> }) {
  return <CalendarPage {...props} basePath="/admin/c" />;
}
