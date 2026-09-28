import { Check, KeyRound, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthPanel } from "./auth-panel";

const STEPS = [
  { icon: Check, title: "Password", note: "Something you know", state: "done" },
  { icon: KeyRound, title: "Code from your phone or a passkey", note: "Something you have", state: "now" },
  { icon: Lock, title: "Admin area", note: "Every client and brand", state: "next" },
] as const;

/** Sign-in is two steps; the panel shows that the second one is where the person is now. */
export function TwoFactorPanel({ heading, body }: { heading: string; body: string }) {
  return (
    <AuthPanel label="About two-factor sign-in" heading={heading} body={body}>
      <ol aria-hidden className="grid gap-1 rounded-[1.5rem] bg-card p-3 shadow-floating">
        {STEPS.map(({ icon: Icon, title, note, state }) => (
          <li key={title} className={cn("flex items-center gap-3 rounded-lg p-3 text-[0.9375rem]", state === "now" && "bg-tint")}>
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground",
                state === "done" && "bg-success/12 text-success",
                state === "now" && "bg-primary text-primary-foreground",
              )}
            >
              <Icon className="size-4.5" />
            </span>
            <span>
              {title}
              <small className="block text-[0.8125rem] text-muted-foreground">{note}</small>
            </span>
          </li>
        ))}
      </ol>
    </AuthPanel>
  );
}
