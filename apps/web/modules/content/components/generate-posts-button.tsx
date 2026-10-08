import { LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@repo/ui/components/button";

/** The page header's button: drafts another batch on top of what is there. */
export function GeneratePostsButton({ onClick, isPending, total }: { onClick: () => void; isPending: boolean; total: number }) {
  return (
    <Button onClick={onClick} disabled={isPending}>
      {isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
      {isPending ? `Drafting ${total} posts` : `Draft ${total} more posts`}
    </Button>
  );
}
