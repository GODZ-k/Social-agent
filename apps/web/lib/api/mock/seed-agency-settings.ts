/**
 * Seed for ADM-7: the agency's own team (who can sign in as an admin) and where
 * Cadence sends alerts. Agency-wide, unlike everything else in `seed.ts`, which
 * is per-brand. Only `seed.ts` imports this file.
 */
import { subDays } from "date-fns";
import type { AlertChannelKind, AlertKind, AlertRow, NotificationChannel, TeamMember } from "@/lib/types";

const now = new Date();

export function buildTeam(): TeamMember[] {
  return [
    { id: "team_alex", name: "Alex Morgan", email: "alex@thescaleagency.org", imageUrl: null, role: "owner", status: "active", invitedAt: subDays(now, 420).toISOString() },
    { id: "team_priya", name: "Priya Shah", email: "priya@thescaleagency.org", imageUrl: null, role: "admin", status: "active", invitedAt: subDays(now, 180).toISOString() },
    { id: "team_jordan", name: "Jordan Lee", email: "jordan@thescaleagency.org", imageUrl: null, role: "admin", status: "invited", invitedAt: subDays(now, 2).toISOString() },
  ];
}

export function buildChannels(): NotificationChannel[] {
  return [
    { kind: "email", connected: true, detail: "Sent to every admin's own inbox." },
    { kind: "discord", connected: true, detail: "Webhook to #cadence-alerts" },
    { kind: "slack", connected: false, detail: "Not connected. Paste a webhook URL to route alerts to a channel." },
    { kind: "whatsapp", connected: false, detail: "Not connected. Needs a WhatsApp Business number and API token." },
  ];
}

const ALERT_COPY: Record<AlertKind, Pick<AlertRow, "label" | "description">> = {
  observability: {
    label: "Observability alerts",
    description: "A run fails, a client's connection breaks, or the server needs attention.",
  },
  new_client: {
    label: "A new client is onboarded",
    description: "Their brand kit is drafted and their first week is ready to check.",
  },
  questionnaire_ready: {
    label: "A client's questions are ready to check",
    description: "Before their research starts, in case something needs a fix first.",
  },
  weekly_summary: {
    label: "Weekly summary across every client",
    description: "Monday morning: what shipped, what needs you.",
  },
};

/** Seeded routing, keyed by kind then channel; only for channels seeded as connected (email, discord). */
const ALERT_ROUTING_SEED: Record<AlertKind, Partial<Record<AlertChannelKind, boolean>>> = {
  observability: { email: true, discord: true },
  new_client: { email: true, discord: false },
  questionnaire_ready: { email: true, discord: true },
  weekly_summary: { email: false, discord: true },
};

export function buildAlerts(): AlertRow[] {
  return (Object.keys(ALERT_COPY) as AlertKind[]).map((kind) => ({
    kind,
    ...ALERT_COPY[kind],
    routing: { ...ALERT_ROUTING_SEED[kind] },
  }));
}
