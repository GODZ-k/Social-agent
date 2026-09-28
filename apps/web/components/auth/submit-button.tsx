import { Button } from "@repo/ui/components/button";

/** The full-width primary action. While pending it keeps its place, says what is happening and ignores clicks. */
export function SubmitButton({ pending, pendingLabel, children, ...props }: React.ComponentProps<typeof Button> & { pending?: boolean; pendingLabel?: string }) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending || props.disabled} aria-busy={pending || undefined} {...props}>
      {pending ? (
        <>
          <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground motion-reduce:animate-[spin_2s_linear_infinite]" />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
