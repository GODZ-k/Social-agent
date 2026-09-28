import "server-only";
import type { AlertRow } from "@/lib/types";
import type { SeedData } from "./seed";

/**
 * Every alert with a toggle for each currently connected channel (ADM-7). A channel
 * that isn't connected drops off, even if it was toggled before it was disconnected;
 * one newly connected gets a toggle here, defaulted off, without touching storage.
 */
export function alertsOf(db: SeedData): AlertRow[] {
  const connected = db.channels.filter((c) => c.connected).map((c) => c.kind);
  return db.alerts.map((alert) => ({
    ...alert,
    routing: Object.fromEntries(connected.map((kind) => [kind, alert.routing[kind] ?? false])) as AlertRow["routing"],
  }));
}
