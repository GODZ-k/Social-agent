import { format, parseISO } from "date-fns";
import { formatCompact } from "@/lib/utils";
import type { ObsRange } from "@/lib/types";

export const hourLabel = (iso: string) => format(parseISO(iso), "HH:00");

const RANGE_PHRASE: Record<ObsRange, string> = { "24h": "the last 24 hours", "7d": "the last 7 days", "30d": "the last 30 days" };
const RANGE_COMPARE: Record<ObsRange, string> = { "24h": "previous 24 hours", "7d": "previous 7 days", "30d": "previous 30 days" };

/** "the last 7 days", for copy that names the toolbar's chosen window. */
export const rangePhrase = (range: ObsRange) => RANGE_PHRASE[range];

/** "vs previous 7 days", for a trend delta's label. */
export const compareLabel = (range: ObsRange) => `vs ${RANGE_COMPARE[range]}`;

const usd = new Intl.NumberFormat("en", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export const formatUsd = (n: number) => usd.format(n);

/** One duration formatter for every observability screen: ms, seconds, or minutes and seconds. */
export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes} min ${seconds} s`;
}

export const formatTokens = (n: number) => formatCompact(n);

const AVATAR_COLORS = ["#8a4b2a", "#c2410c", "#0f766e", "#9f1239", "#2f6fde", "#b45309", "#0e7490"];

/** A stable colour for a client's initials avatar, picked from its name so the same client always matches. */
export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]!;
}
