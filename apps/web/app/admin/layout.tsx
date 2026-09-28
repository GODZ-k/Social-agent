import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/**
 * Every admin route, agency chrome and brand workspace mirror alike: a non-admin
 * gets the plain not-found page, never a sign that this area exists. The two
 * chromes below this (`(agency)`, `(brand)/c`) each carry their own header and nav.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (viewer.role !== "admin") notFound();

  return <div className="min-h-dvh">{children}</div>;
}
