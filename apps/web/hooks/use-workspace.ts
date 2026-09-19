"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { clientQuery } from "@/lib/api/queries";

/** The client whose workspace is open. Shares the layout's cached query. */
export function useWorkspace() {
  const { clientId } = useParams<{ clientId: string }>();
  const { data: client } = useQuery(clientQuery(clientId));
  return { clientId, client };
}
