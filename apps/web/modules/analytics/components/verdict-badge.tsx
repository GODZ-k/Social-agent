import type { Verdict } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";

type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>["variant"]>;

const VERDICT_META: Record<Verdict, { label: string; variant: BadgeVariant }> = {
  very_good: { label: "Very good", variant: "success" },
  good: { label: "Good", variant: "success" },
  usual: { label: "About usual", variant: "neutral" },
  below: { label: "Below usual", variant: "warning" },
  too_early: { label: "Too early", variant: "tint" },
};

/** How a number compares with small shops like this one, in one word. */
export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const meta = VERDICT_META[verdict];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
