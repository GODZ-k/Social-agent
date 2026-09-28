import { AlertTriangle } from "lucide-react";
import type { Platform } from "@social-agent/shared";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";

/** Proactive, before the owner approves: what happens if they do while the account isn't connected. */
export function NotConnectedNote({ platform }: { platform: Platform }) {
  return (
    <p className="flex gap-2 rounded-md bg-warning/12 p-3 text-[0.8125rem] leading-snug text-warning">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      {PLATFORM_LABEL[platform]} isn&rsquo;t connected. If you approve, the post waits and goes out as soon as you connect.
    </p>
  );
}
