"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useGeneratePosts } from "./use-generate-posts";

/** The page header's button: drafts another batch on top of what is there. */
export function GeneratePostsButton({ clientId }: { clientId: string }) {
  const { generate, isPending } = useGeneratePosts(clientId);
  return (
    <Button onClick={generate} disabled={isPending}>
      {isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
      {isPending ? "Drafting 6 posts" : "Draft 6 more posts"}
    </Button>
  );
}
