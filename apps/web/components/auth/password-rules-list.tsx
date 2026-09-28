import { Check, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_POLICY, type PasswordRules, type RuleState } from "@/lib/auth/rules";

const MARKS = { pending: Circle, met: Check, fail: X } as const;
const SPOKEN: Record<RuleState, string> = { pending: "", met: " (done)", fail: " (not met)" };

const LABELS: Record<keyof PasswordRules, string> = {
  length: `At least ${AUTH_POLICY.minPasswordLength} characters`,
  notLeaked: "Not a common or leaked password",
  notEmail: "Not your email address",
};

/** The password rules, ticked live as the person types. */
export function PasswordRulesList({ rules }: { rules: PasswordRules }) {
  const entries = Object.entries(rules) as [keyof PasswordRules, RuleState][];
  return (
    <ul aria-label="Password rules" className="grid gap-1">
      {entries.map(([rule, state]) => {
        const Mark = MARKS[state];
        return (
          <li
            key={rule}
            className={cn("flex items-center gap-2 text-[0.8125rem] text-muted-foreground", state === "met" && "text-success", state === "fail" && "text-destructive")}
          >
            <Mark className="size-3.5 shrink-0" aria-hidden />
            <span>
              {LABELS[rule]}
              <span className="sr-only">{SPOKEN[state]}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
