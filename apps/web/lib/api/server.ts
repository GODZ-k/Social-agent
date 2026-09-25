import "server-only";
import { cache } from "react";
import { getViewer } from "@/lib/auth/viewer";
import { getDb } from "./mock/db";
import type { Analytics, Client, Post, Strategy } from "@/lib/types";

/**
 * Reads, called from server components. Every function is deduplicated per
 * request with React.cache, so a layout and a page asking for the same client
 * share one lookup.
 *
 * Swapping the mock for the real API means replacing a function body with
 * `return api<Client[]>("/brands")` and nothing above this layer changes.
 * A missing or inaccessible record is `null`, never a thrown error, so pages
 * can decide between notFound() and an empty state.
 */

const clone = <T,>(v: T): T => structuredClone(v);

/*
 * Access rules, mirrored from what the API enforces:
 * admins reach every client, everyone else only the clients they own.
 */
const canAccess = cache(async (client: Client) => {
  const viewer = await getViewer();
  return viewer.role === "admin" || client.ownerId === viewer.id;
});

const findClient = cache(async (id: string): Promise<Client | null> => {
  const client = getDb().clients.find((c) => c.id === id);
  if (!client || !(await canAccess(client))) return null;
  return client;
});

export const listClients = cache(async (): Promise<Client[]> => {
  const viewer = await getViewer();
  const mine = getDb().clients.filter((c) => viewer.role === "admin" || c.ownerId === viewer.id);
  return clone(mine);
});

export const getClient = cache(async (id: string): Promise<Client | null> => {
  const client = await findClient(id);
  return client && clone(client);
});

export const getStrategy = cache(async (clientId: string): Promise<Strategy | null> => {
  if (!(await findClient(clientId))) return null;
  const strategy = getDb().strategies.find((s) => s.clientId === clientId);
  return strategy ? clone(strategy) : null;
});

export const listPosts = cache(async (clientId: string): Promise<Post[]> => {
  if (!(await findClient(clientId))) return [];
  const posts = getDb().posts.filter((p) => p.clientId === clientId);
  return clone(posts);
});

export const getAnalytics = cache(async (clientId: string): Promise<Analytics | null> => {
  if (!(await findClient(clientId))) return null;
  const analytics = getDb().analytics.find((a) => a.clientId === clientId);
  return analytics ? clone(analytics) : null;
});
