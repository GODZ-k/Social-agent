"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ExternalLink, Search } from "lucide-react";
import type { LogLevel, LogRow } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@/lib/utils";
import { SignozTraceLink } from "./signoz-link";
import { signozLogsUrl } from "./signoz";

const LEVELS: { key: LogLevel | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "info", label: "Info" },
  { key: "warning", label: "Warnings" },
  { key: "error", label: "Errors" },
];

const LEVEL_BADGE: Record<LogLevel, "neutral" | "warning" | "danger"> = { info: "neutral", warning: "warning", error: "danger" };
const LEVEL_LABEL: Record<LogLevel, string> = { info: "Info", warning: "Warning", error: "Error" };

/** OBS-4: what the server wrote down, filterable by level and text, newest first. */
export function LogsPanel({ logs }: { logs: LogRow[] }) {
  const [level, setLevel] = useState<LogLevel | "all">("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((log) => (level === "all" || log.level === level) && (!q || log.message.toLowerCase().includes(q)));
  }, [logs, level, query]);

  return (
    <Panel>
      <h2 className="type-heading">Logs</h2>
      <p className="type-label mt-1 mb-4">What the server wrote down, newest first.</p>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Log level" className="inline-flex rounded-full bg-secondary p-1">
          {LEVELS.map((l) => (
            <button
              key={l.key}
              type="button"
              role="radio"
              aria-checked={level === l.key}
              onClick={() => setLevel(l.key)}
              className={cn(
                "rounded-full px-3 py-1 text-[0.8125rem] font-medium",
                level === l.key ? "bg-card text-foreground shadow-raised" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <label className="flex w-56 shrink-0 items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground sm:ml-auto">
          <Search className="size-4 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logs"
            className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="grid">
        {rows.map((log) => (
          <div
            key={log.id}
            className="grid gap-1.5 border-b py-2.5 text-sm last:border-0 sm:grid-cols-[6.5rem_5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-3"
          >
            <div className="flex items-center gap-2 sm:contents">
              <span className="text-[0.8125rem] text-muted-foreground">{format(parseISO(log.at), "h:mm:ss a")}</span>
              <Badge variant={LEVEL_BADGE[log.level]}>{LEVEL_LABEL[log.level]}</Badge>
            </div>
            <span className="min-w-0">{log.message}</span>
            <SignozTraceLink traceId={log.traceId} />
          </div>
        ))}
        {rows.length === 0 && <p className="type-label py-4">No logs match.</p>}
      </div>

      <div className="mt-4">
        <a
          href={signozLogsUrl()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-tint-foreground hover:underline"
        >
          Open all logs in SigNoz <ExternalLink className="size-3.5" />
        </a>
      </div>
    </Panel>
  );
}
