import type { Client } from "@/lib/types";
import { ClientRow } from "./client-row";

export function ClientList({ clients, isAdmin }: { clients: Client[]; isAdmin: boolean }) {
  return (
    <section className="mt-16 md:mt-24" aria-labelledby="clients-heading">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 id="clients-heading" className="type-heading">
          {isAdmin ? "All clients" : "Your brands"}
        </h2>
        <span className="type-label tabular-nums">{clients.length} in total</span>
      </div>

      <ul className="grid gap-3">
        {clients.map((client) => (
          <li key={client.id}>
            <ClientRow client={client} />
          </li>
        ))}
      </ul>
    </section>
  );
}
