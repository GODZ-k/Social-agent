"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Switch } from "@repo/ui/components/switch";

const REFRESH_MS = 30_000;

/** "Updated 1 min ago", with a switch that re-fetches this route on an interval. */
export function AutoRefreshToggle({ checkedAt }: { checkedAt: string }) {
  const router = useRouter();
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    const timer = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [on, router]);

  return (
    <div className="flex items-center gap-3 text-[0.8125rem] text-muted-foreground">
      <span>Updated {formatDistanceToNow(parseISO(checkedAt), { addSuffix: true })}</span>
      <label className="flex items-center gap-2">
        <Switch checked={on} onCheckedChange={setOn} aria-label="Auto refresh" />
        Auto refresh
      </label>
    </div>
  );
}
