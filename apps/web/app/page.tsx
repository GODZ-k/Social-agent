import { redirect } from "next/navigation";
import { listClients } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { TopBar } from "@/components/shell/top-bar";
import { ClientsHero } from "@/features/clients/clients-hero";
import { ClientList } from "@/features/clients/client-list";


// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ClientsPage() {
  const [viewer, clients] = await Promise.all([getViewer(), listClients()]);

  // The agency's own area now lives at /admin/clients; this page is the client view only.
  if (viewer.role === "admin") redirect("/admin/clients");

  // Someone with a single brand has nothing to choose between: take them straight to it.
  if (clients.length === 1) redirect(`/c/${clients[0]!.id}`);

  return (
    <div className="min-h-dvh">
      <TopBar viewer={viewer} />
      <main className="mx-auto max-w-5xl px-4 pt-14 pb-24 md:px-6 md:pt-24">
        <ClientsHero isAdmin={false} />
        {/* A new account has no brands yet, so there is no empty list to show: the URL field is the page. */}
        {clients.length > 0 && <ClientList clients={clients} isAdmin={false} />}
      </main>
    </div>
  );
}
