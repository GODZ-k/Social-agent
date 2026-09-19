"use client";

import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./client";
import type { Client, ClientPatch, NewClientInput, Platform, Post } from "@/lib/types";

/** One place for every cache key, so invalidation can't drift from fetching. */
export const keys = {
  clients: ["clients"] as const,
  client: (id: string) => ["clients", id] as const,
  strategy: (id: string) => ["clients", id, "strategy"] as const,
  posts: (id: string) => ["clients", id, "posts"] as const,
  analytics: (id: string) => ["clients", id, "analytics"] as const,
};

export const clientsQuery = () =>
  queryOptions({ queryKey: keys.clients, queryFn: api.listClients });

export const clientQuery = (id: string) =>
  queryOptions({ queryKey: keys.client(id), queryFn: () => api.getClient(id) });

export const strategyQuery = (id: string) =>
  queryOptions({ queryKey: keys.strategy(id), queryFn: () => api.getStrategy(id) });

export const postsQuery = (id: string) =>
  queryOptions({ queryKey: keys.posts(id), queryFn: () => api.listPosts(id) });

export const analyticsQuery = (id: string) =>
  queryOptions({ queryKey: keys.analytics(id), queryFn: () => api.getAnalytics(id) });

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewClientInput) => api.createClient(input),
    onSuccess: (client) => {
      qc.setQueryData(keys.client(client.id), client);
      qc.setQueryData<Client[]>(keys.clients, (old) => (old ? [client, ...old] : old));
    },
  });
}

/** Writes a changed client into both caches it lives in: its own entry and the list. */
function useClientCacheWriter() {
  const qc = useQueryClient();
  return (client: Client) => {
    qc.setQueryData(keys.client(client.id), client);
    qc.setQueryData<Client[]>(keys.clients, (old) => old?.map((c) => (c.id === client.id ? client : c)));
  };
}

export function useUpdateClient(clientId: string) {
  const write = useClientCacheWriter();
  return useMutation({
    mutationFn: (patch: ClientPatch) => api.updateClient(clientId, patch),
    onSuccess: (client) => {
      write(client);
      toast.success("Changes saved");
    },
    onError: (error) => toast.error(`Couldn't save those changes. ${error.message}`),
  });
}

export function useConnectAccount(clientId: string) {
  const write = useClientCacheWriter();
  return useMutation({
    mutationFn: (platform: Platform) => api.connectAccount(clientId, platform),
    onSuccess: write,
    onError: (error) => toast.error(`Couldn't connect that account. ${error.message}`),
  });
}

export function useDisconnectAccount(clientId: string) {
  const write = useClientCacheWriter();
  return useMutation({
    mutationFn: (platform: Platform) => api.disconnectAccount(clientId, platform),
    onSuccess: write,
    onError: (error) => toast.error(`Couldn't disconnect that account. ${error.message}`),
  });
}

export function useDeleteClient(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.deleteClient(clientId),
    onSuccess: () => {
      qc.setQueryData<Client[]>(keys.clients, (old) => old?.filter((c) => c.id !== clientId));
      qc.removeQueries({ queryKey: keys.client(clientId) });
    },
    onError: (error) => toast.error(`Couldn't delete this. ${error.message}`),
  });
}

export function useRegenerateStrategy(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.regenerateStrategy(clientId),
    onSuccess: (strategy) => {
      qc.setQueryData(keys.strategy(clientId), strategy);
      toast.success(`Strategy updated to version ${strategy.version}`);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useGeneratePosts(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (count: number) => api.generatePosts(clientId, count),
    onSuccess: (created) => {
      toast.success(`${created.length} posts drafted and sent for approval`);
      return Promise.all([
        qc.invalidateQueries({ queryKey: keys.posts(clientId) }),
        qc.invalidateQueries({ queryKey: keys.client(clientId) }),
        qc.invalidateQueries({ queryKey: keys.clients, exact: true }),
      ]);
    },
    onError: (error) => toast.error(error.message),
  });
}

/**
 * Optimistic: the post changes on screen the moment the user acts, and rolls
 * back if the server disagrees. Approvals are a swipe, so waiting on the
 * network before moving the card would break the gesture.
 */
export function useUpdatePost(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, patch }: { postId: string; patch: api.PostPatch }) =>
      api.updatePost(postId, patch),
    onMutate: async ({ postId, patch }) => {
      await qc.cancelQueries({ queryKey: keys.posts(clientId) });
      const previous = qc.getQueryData<Post[]>(keys.posts(clientId));
      qc.setQueryData<Post[]>(keys.posts(clientId), (old) =>
        old?.map((p) => (p.id === postId ? { ...p, ...patch } : p)),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) qc.setQueryData(keys.posts(clientId), context.previous);
      toast.error(`Couldn't save that change. ${error.message}`);
    },
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: keys.posts(clientId) }),
        qc.invalidateQueries({ queryKey: keys.client(clientId) }),
        qc.invalidateQueries({ queryKey: keys.clients, exact: true }),
      ]),
  });
}
