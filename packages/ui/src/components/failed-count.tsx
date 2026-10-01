/** A count, in the destructive colour once it's above zero. */
export function FailedCount({ count }: { count: number }) {
  return <span className={count > 0 ? "font-medium text-destructive" : ""}>{count}</span>;
}
