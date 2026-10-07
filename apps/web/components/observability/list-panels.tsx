import { format, formatDistanceToNow, parseISO } from "date-fns";
import type { FailedActionRow, FrontendErrorDetail, JobQueueRow, ServerErrorGroup, ServiceRow, SlowRequest } from "@/lib/types";
import { FailedCount } from "@repo/ui/components/failed-count";
import { RateBar } from "@repo/ui/components/rate-bar";
import { formatNumber } from "@/lib/utils";
import { ListPanel, type RowListColumn } from "./row-list";
import { BrandBadge } from "./badges";
import { SignozTraceLink } from "./signoz";
import { formatMs, formatTokens, formatUsd } from "./format";

/**
 * Every observability panel whose body is just one table. They live together because each is now
 * only its columns and its headline number — `ListPanel` holds the shape they share. The four
 * panels that put a filter, a footer or a link beside their table keep their own files.
 */

type BrandHit = FrontendErrorDetail["brands"][number];

const WHO_HIT_IT_COLUMNS: RowListColumn<BrandHit>[] = [
  { header: "Brand", render: (c) => <span className="font-medium">{c.name}</span> },
  { header: "Hit it", align: "right", render: (c) => `${c.times} times` },
  { header: "Last", align: "right", render: (c) => formatDistanceToNow(parseISO(c.lastAt), { addSuffix: true }) },
];

export function WhoHitItPanel({ brands }: { brands: FrontendErrorDetail["brands"] }) {
  return (
    <ListPanel
      title="Who hit it"
      description="Clients whose people saw this error."
      columns={WHO_HIT_IT_COLUMNS}
      rows={brands}
      rowKey={(c) => c.brandId}
    />
  );
}

const SLOW_REQUEST_COLUMNS: RowListColumn<SlowRequest>[] = [
  {
    header: "Request",
    main: true,
    render: (r) => (
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.6875rem] font-medium uppercase">{r.method}</span>
          <span className="min-w-0 break-all font-mono text-[0.8125rem]">{r.path}</span>
        </span>
        <span className="type-label block">{r.waitedOn}</span>
      </span>
    ),
  },
  { header: "Took", align: "right", width: "4.5rem", render: (r) => <span className="font-medium">{formatMs(r.tookMs)}</span> },
  { header: "Client", width: "9rem", render: (r) => <BrandBadge name={r.brandName} /> },
  { header: "When", align: "right", width: "4.5rem", render: (r) => format(parseISO(r.at), "h:mm a") },
  { header: "", align: "right", width: "5rem", render: (r) => <SignozTraceLink traceId={r.traceId} /> },
];

export function SlowRequestsPanel({ requests }: { requests: SlowRequest[] }) {
  return (
    <ListPanel
      title="Slowest requests"
      description="The three longest requests, and what they waited on."
      columns={SLOW_REQUEST_COLUMNS}
      rows={requests}
      rowKey={(r) => r.traceId}
    />
  );
}

const SERVER_ERROR_COLUMNS: RowListColumn<ServerErrorGroup>[] = [
  {
    header: "Error",
    main: true,
    render: (e) => (
      <span className="min-w-0">
        <span className="block font-mono text-[0.8125rem]">{e.message}</span>
        <span className="type-label block font-mono">{e.route}</span>
      </span>
    ),
  },
  { header: "Times", align: "right", width: "4rem", render: (e) => <span className="font-medium">{e.times}</span> },
  { header: "Clients", align: "right", width: "4.5rem", render: (e) => e.brands },
  { header: "Last seen", align: "right", width: "7rem", render: (e) => format(parseISO(e.lastSeenAt), "d MMM, h:mm a") },
  { header: "", align: "right", width: "5rem", render: (e) => <SignozTraceLink traceId={e.traceId} /> },
];

export function ServerErrorsPanel({ errors }: { errors: ServerErrorGroup[] }) {
  return (
    <ListPanel
      title="Server errors"
      description="Requests that ended in a 5xx, grouped by cause. Most frequent first."
      stat={{ value: errors.length, caption: "Causes" }}
      columns={SERVER_ERROR_COLUMNS}
      rows={errors}
      rowKey={(e) => e.id}
    />
  );
}

const FAILED_ACTION_COLUMNS: RowListColumn<FailedActionRow>[] = [
  {
    header: "Action and most common reason",
    main: true,
    render: (a) => (
      <span className="min-w-0">
        <span className="block font-medium">{a.action}</span>
        <span className="type-label block">{a.reason ?? "No failures"}</span>
      </span>
    ),
  },
  { header: "Tried", align: "right", render: (a) => a.tried },
  { header: "Failed", align: "right", render: (a) => <FailedCount count={a.failed} /> },
  { header: "Failure rate", align: "right", render: (a) => <RateBar pct={Math.round((a.failed / a.tried) * 100)} /> },
];

export function FailedActionsPanel({ actions }: { actions: FailedActionRow[] }) {
  const total = actions.reduce((sum, a) => sum + a.failed, 0);
  const sorted = [...actions].sort((a, b) => b.failed / b.tried - a.failed / a.tried);
  return (
    <ListPanel
      title="Failed actions"
      description="Things people tried to do that did not work, worst rate first."
      stat={{ value: total, caption: "Failed" }}
      columns={FAILED_ACTION_COLUMNS}
      rows={sorted}
      rowKey={(a) => a.action}
    />
  );
}

interface Model {
  model: string;
  input: number;
  output: number;
  cached: number;
  cost: number;
}

/** A model's dot colour, by its rank in the list: brand, then a lighter tint of it, then neutral. */
const DOT_COLORS = ["var(--brand)", "color-mix(in srgb, var(--brand) 42%, var(--card))", "var(--tint-strong)"];
const dotColor = (index: number) => DOT_COLORS[index % DOT_COLORS.length]!;

function modelColumns(models: Model[]): RowListColumn<Model>[] {
  return [
    {
      header: "Model",
      main: true,
      render: (m) => (
        <span className="flex items-center gap-2 font-medium whitespace-nowrap">
          <i aria-hidden className="inline-block size-2 shrink-0 rounded-full" style={{ background: dotColor(models.indexOf(m)) }} />
          {m.model}
        </span>
      ),
    },
    { header: "Input", align: "right", render: (m) => formatTokens(m.input) },
    { header: "Output", align: "right", render: (m) => formatTokens(m.output) },
    { header: "Cached", align: "right", render: (m) => formatTokens(m.cached) },
    { header: "Cost", align: "right", render: (m) => <span className="font-medium">{formatUsd(m.cost)}</span> },
  ];
}

export function ModelsPanel({ models }: { models: Model[] }) {
  const total = models.reduce((sum, m) => sum + m.cost, 0);
  return (
    <ListPanel
      title="Model usage and cost"
      description="Tokens and cost for each model."
      stat={{ value: formatUsd(total), caption: "Total cost" }}
      columns={modelColumns(models)}
      rows={models}
      rowKey={(m) => m.model}
    />
  );
}

const JOB_COLUMNS: RowListColumn<JobQueueRow>[] = [
  {
    header: "Queue",
    main: true,
    render: (j) => (
      <span className="flex min-w-0 items-start gap-2">
        <span aria-hidden className={j.waiting > 0 ? "mt-1.5 size-2 shrink-0 rounded-full bg-warning" : "mt-1.5 size-2 shrink-0 rounded-full bg-success"} />
        <span className="min-w-0">
          <span className="block font-medium">{j.name}</span>
          <span className="type-label block">{j.note}</span>
        </span>
      </span>
    ),
  },
  { header: "Waiting", align: "right", width: "4.5rem", render: (j) => j.waiting },
  { header: "Running", align: "right", width: "4.5rem", render: (j) => j.running },
  { header: "Longest wait", align: "right", width: "6rem", render: (j) => formatMs(j.longestWaitMs) },
  { header: "Done", align: "right", width: "4rem", render: (j) => j.done },
  { header: "Failed", align: "right", width: "4rem", render: (j) => <FailedCount count={j.failed} /> },
];

export function JobsPanel({ jobs }: { jobs: JobQueueRow[] }) {
  const active = jobs.reduce((sum, j) => sum + j.waiting + j.running, 0);
  return (
    <ListPanel
      title="Background jobs"
      description="Work the API does after it has answered."
      stat={{ value: active, caption: "Waiting or running" }}
      columns={JOB_COLUMNS}
      rows={jobs}
      rowKey={(j) => j.name}
    />
  );
}

/** Warning past any failures, danger once a fifth of calls failed. */
function statusDot(service: ServiceRow) {
  if (service.failed === 0) return "bg-success";
  const rate = service.failed / Math.max(service.calls, 1);
  return rate > 0.2 ? "bg-destructive" : "bg-warning";
}

const SERVICE_COLUMNS: RowListColumn<ServiceRow>[] = [
  {
    header: "Service",
    main: true,
    render: (s) => (
      <span className="flex min-w-0 items-start gap-2">
        <span aria-hidden className={`mt-1.5 size-2 shrink-0 rounded-full ${statusDot(s)}`} />
        <span className="min-w-0">
          <span className="block font-medium">{s.name}</span>
          <span className="type-label block">{s.note}</span>
        </span>
      </span>
    ),
  },
  { header: "Calls", align: "right", render: (s) => formatNumber(s.calls) },
  { header: "Failed", align: "right", render: (s) => <FailedCount count={s.failed} /> },
  { header: "p95", align: "right", render: (s) => formatMs(s.p95Ms) },
];

export function ServicesPanel({ services }: { services: ServiceRow[] }) {
  const failed = services.reduce((sum, s) => sum + s.failed, 0);
  return (
    <ListPanel
      title="Services the API calls"
      description="Outside services, and how they answered."
      stat={{ value: failed, caption: "Failed calls" }}
      columns={SERVICE_COLUMNS}
      rows={services}
      rowKey={(s) => s.name}
    />
  );
}
