"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import type { AdminClientRow } from "@/lib/types";
import { EmptyState } from "@repo/ui/components/states";
import { Segmented } from "@repo/ui/components/segmented";
import { ClientsTable } from "./clients-table";

type Filter = "all" | "needs-you" | "invited";

/** Filters and searches the client list, then hands the visible rows to the table and cards. */
export function ClientsView({ clients, defaultFilter = "all" }: { clients: AdminClientRow[]; defaultFilter?: Filter }) {
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [search, setSearch] = useState("");

  const needsYouCount = clients.filter((c) => c.needsYou).length;
  const invitedCount = clients.filter((c) => c.status === "invited").length;

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter === "needs-you" && !c.needsYou) return false;
      if (filter === "invited" && c.status !== "invited") return false;
      if (!term) return true;
      const haystack = [c.name ?? "", c.email, ...c.brands.map((b) => b.name)].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [clients, filter, search]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented<Filter>
          label="Filter clients"
          value={filter}
          onValueChange={setFilter}
          className="max-sm:w-full max-sm:[&>button]:flex-1"
          options={[
            { value: "all", label: "All", count: clients.length },
            { value: "needs-you", label: "Needs you", count: needsYouCount },
            { value: "invited", label: "Invited", count: invitedCount },
          ]}
        />
        <label className="relative w-full min-[900px]:ml-auto min-[900px]:w-64">
          <span className="sr-only">Search clients or brands</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients or brands"
            className="h-10 w-full rounded-full bg-card pr-4 pl-10 text-sm ring-1 ring-border outline-none placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<Users />} title="No clients match" description="Try a different filter or clear the search." />
      ) : (
        <>
          <ClientsTable clients={visible} />
          <p className="type-label mt-4">Clients who need you come first, then the most recently active.</p>
        </>
      )}
    </>
  );
}
