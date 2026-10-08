import { ShieldCheck } from "lucide-react";

/** An admin inside a client's brand acts for the client: approvals carry the admin's name. */
export function AdminActingNote() {
  return (
    <p className="mx-auto flex max-w-[88rem] items-center gap-2 px-4 pt-4 text-[0.8125rem] text-muted-foreground md:px-6 lg:pr-8 lg:pl-64">
      <ShieldCheck aria-hidden className="size-4 shrink-0" />
      Posts you approve here are approved in your name
    </p>
  );
}
