import { Button } from "@repo/ui/components/button";

/** The empty state's button: the very first batch for a client with no posts. */
export function GenerateFirstPostsButton({ onClick, isPending, total }: { onClick: () => void; isPending: boolean; total: number }) {
  return (
    <Button onClick={onClick} disabled={isPending}>
      {isPending ? `Drafting ${total} posts` : `Draft the first ${total} posts`}
    </Button>
  );
}
