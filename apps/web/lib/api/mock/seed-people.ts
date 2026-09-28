/**
 * The agency's clients as people, for the admin screens. Only `seed.ts` imports this file.
 * Seeded brands belong to these people, so a signed-in client never sees them; admins see all.
 */
import { subDays, subHours, subMinutes } from "date-fns";
import type { AdminClient } from "@social-agent/shared";

export const OWNERS = {
  priya: "user_priya",
  hannah: "user_hannah",
  marco: "user_marco",
  sam: "user_sam",
  lucy: "user_lucy",
  rahul: "user_rahul",
  aisha: "user_aisha",
} as const;

/** A client as the mock stores them. `brandCount` is recounted on every read. */
export interface MockPerson extends AdminClient {
  invitedAt: string | null;
  lastSignedInAt: string | null;
  lastActivity: { at: string | null; what: string };
}

/** A website scan that failed before a brand existed, counted as a failed run. */
export interface FailedScan {
  ownerId: string;
  brandName: string;
  at: string;
}

const now = new Date();

function person(
  id: string,
  name: string,
  email: string,
  phone: string | null,
  daysSinceInvite: number,
  lastSignedIn: Date | null,
  lastActivity: { at: Date | null; what: string },
): MockPerson {
  const invitedAt = subDays(now, daysSinceInvite).toISOString();
  return {
    id,
    email,
    name,
    imageUrl: null,
    phone,
    status: lastSignedIn ? "active" : "invited",
    brandCount: 0,
    createdAt: invitedAt,
    invitedAt,
    lastSignedInAt: lastSignedIn?.toISOString() ?? null,
    lastActivity: { at: lastActivity.at?.toISOString() ?? null, what: lastActivity.what },
  };
}

export function buildPeople(): MockPerson[] {
  return [
    person(OWNERS.priya, "Priya Raman", "priya@meowmeowtweet.com", "+1 718 555 0142", 70, subMinutes(now, 40), { at: subMinutes(now, 12), what: "Approved 2 posts" }),
    person(OWNERS.hannah, "Hannah Lee", "hannah@tartinebakery.com", null, 2, subHours(now, 20), { at: subHours(now, 20), what: "Finished the questionnaire" }),
    person(OWNERS.marco, "Marco Bellini", "marco@donangie.com", "+1 212 555 0178", 4, subHours(now, 2), { at: subHours(now, 2), what: "Asked to run research again" }),
    person(OWNERS.rahul, "Rahul Mehta", "rahul@mehtasweets.in", "+91 98200 55501", 3, null, { at: null, what: "Never signed in" }),
    person(OWNERS.aisha, "Aisha Khan", "aisha@khanchai.com", null, 4, null, { at: null, what: "Invite not opened" }),
    person(OWNERS.sam, "Sam Okafor", "sam@northbound.coffee", null, 125, subHours(now, 5), { at: subHours(now, 5), what: "Connected Instagram" }),
    person(OWNERS.lucy, "Lucy Park", "lucy@harbourdental.clinic", "+44 117 496 0000", 210, subDays(now, 6), { at: subDays(now, 6), what: "Approved 4 posts" }),
  ];
}

export const failedScans: FailedScan[] = [
  { ownerId: OWNERS.rahul, brandName: "Mehta Sweets", at: subDays(now, 2).toISOString() },
];
