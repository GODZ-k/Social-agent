"use client";

import { Button } from "@repo/ui/components/button";
import { useGeneratePosts } from "./use-generate-posts";

/** The empty state's button: the very first batch for a client with no posts. */
export function GenerateFirstPostsButton({ clientId }: { clientId: string }) {
  const { generate, isPending } = useGeneratePosts(clientId);
  return (
    <Button onClick={generate} disabled={isPending}>
      Draft the first 6 posts
    </Button>
  );
}
