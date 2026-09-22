"use client";

import { useEffect, useState } from "react";
import { readScan, startScan } from "@/lib/api/actions";
import type { ScanResult } from "@/lib/types";

const POLL_MS = 700;

type ScanStatus = "idle" | "scanning" | "done" | "error";

interface Job {
  /** Which url and attempt this progress belongs to, so a stale job never shows. */
  key: string;
  step: number;
  result: ScanResult | null;
  error: string | null;
}

const EMPTY_JOB = { step: 0, result: null, error: null };

/**
 * Runs a brand scan the way the real API does: one start call, then a poll
 * until the job reports done. Progress is keyed to the url and the attempt,
 * so a new url or a restart begins from step 0 without touching state in the
 * effect body.
 */
export function useScan(url: string | null): {
  status: ScanStatus;
  step: number;
  result: ScanResult | null;
  error: string | null;
  restart: () => void;
} {
  const [attempt, setAttempt] = useState(0);
  const [job, setJob] = useState<Job | null>(null);
  const key = `${url}#${attempt}`;

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function report(patch: Partial<Job>) {
      if (cancelled) return;
      setJob((current) => ({ ...EMPTY_JOB, ...(current?.key === key ? current : {}), key, ...patch }));
    }

    async function poll(scanId: string) {
      const read = await readScan(scanId);
      if (cancelled) return;
      if (!read.ok) return report({ error: read.message });
      const scan = read.data;
      if (scan.status === "done" && scan.result) return report({ step: scan.step, result: scan.result });
      report({ step: scan.step });
      timer = setTimeout(() => void poll(scanId), POLL_MS);
    }

    void startScan(url).then((started) => {
      if (cancelled) return;
      if (!started.ok) return report({ error: started.message });
      void poll(started.data.scanId);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [url, key]);

  const current = job?.key === key ? job : null;
  return {
    status: statusOf(url, current),
    step: current?.step ?? 0,
    result: current?.result ?? null,
    error: current?.error ?? null,
    restart: () => setAttempt((n) => n + 1),
  };
}

function statusOf(url: string | null, job: Job | null): ScanStatus {
  if (!url) return "idle";
  if (job?.error) return "error";
  if (job?.result) return "done";
  return "scanning";
}
