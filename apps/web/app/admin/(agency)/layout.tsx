import { AdminHeader } from "@/components/shell/admin-header";
import { AdminNav } from "@/components/shell/admin-nav";
import { getViewer } from "@/lib/auth/viewer";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** The agency's own area: Clients and Observability. Role gate lives in the admin layout above this group. */
export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  return (
    <>
      <AdminHeader viewer={viewer} />
      <AdminNav />
      <main className="mx-auto max-w-[88rem] px-4 pt-7 pb-32 md:px-6 lg:pr-8 lg:pb-16 lg:pl-64">{children}</main>
    </>
  );
}
