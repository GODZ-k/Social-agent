"use server";

import { revalidatePath } from "next/cache";
import { addDays, addHours, startOfDay } from "date-fns";
import { inviteClientSchema } from "@social-agent/shared";
import type { InviteClientInput, Language, Platform, QuestionnaireSubmitResponse } from "@social-agent/shared";
import { getViewer } from "@/lib/auth/viewer";
import { addBrand, getDb, recounted, removeClient } from "./mock/db";
import * as account from "./mock/account";
import * as admin from "./mock/admin";
import { newClient, settleResearch } from "./mock/brand-flow";
import * as posts from "./mock/posts";
import * as questionnaire from "./mock/questionnaire";
import * as research from "./mock/research";
import * as scans from "./mock/scan";
import { handleFor } from "./mock/seed";
import * as settings from "./mock/settings";
import * as strategies from "./mock/strategy";
import { fail, ok, type ActionResult } from "./result";
import type {
  AccountDetails,
  AdminClientRow,
  AlertChannelKind,
  AlertKind,
  AlertRow,
  BrandCard,
  Client,
  ClientPatch,
  ConnectableChannelKind,
  NewClientInput,
  NotificationChannel,
  OnboardingState,
  Post,
  PostPatch,
  PostView,
  Preferences,
  QuestionAnswer,
  QuestionnaireView,
  ResearchView,
  ReviewResult,
  Scan,
  Strategy,
  TeamMember,
} from "@/lib/types";

/**
 * Writes, called from client components as Server Actions.
 *
 * Every action authenticates first, changes the mock, revalidates the routes
 * that show the changed data, and returns an ActionResult. Against the real
 * API each body becomes one HTTP call; the revalidation stays.
 */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clone = <T,>(v: T): T => structuredClone(v);

const NOT_FOUND = "This client doesn't exist, or you don't have access to it.";
const NO_POST = "This post no longer exists.";

/** Same answer for "missing" and "not yours", so ids can't be probed. */
async function requireClient(id: string): Promise<Client> {
  const viewer = await getViewer();
  const client = getDb().clients.find((c) => c.id === id);
  if (!client || (viewer.role !== "admin" && client.ownerId !== viewer.id)) throw new Error(NOT_FOUND);
  return client;
}

async function requirePost(postId: string): Promise<{ post: Post; client: Client }> {
  const post = getDb().posts.find((p) => p.id === postId);
  if (!post) throw new Error(NO_POST);
  const client = await requireClient(post.clientId);
  return { post, client };
}

async function requireAdmin() {
  const viewer = await getViewer();
  if (viewer.role !== "admin") throw new Error("Only the agency can do this.");
  return viewer;
}

function requirePerson(clientId: string) {
  const person = getDb().people.find((p) => p.id === clientId);
  if (!person) throw new Error("This client no longer exists.");
  return person;
}

function revalidateClient(clientId: string) {
  revalidatePath("/");
  revalidatePath(`/c/${clientId}`, "layout");
  revalidatePath(`/admin/c/${clientId}`, "layout");
  revalidatePath("/onboarding", "layout");
}

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

function revalidateAgencySettings() {
  revalidatePath("/admin/settings", "layout");
}

/** Runs an action body and turns any thrown error into a result. */
async function attempt<T>(body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await body();
    return ok(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Something went wrong.");
  }
}

/* Account (BA-2) */

export async function updateAccountDetails(input: AccountDetails): Promise<ActionResult<AccountDetails>> {
  return attempt(async () => {
    await getViewer();
    await wait(500);
    const saved = account.saveDetails(input);
    revalidatePath("/account");
    return saved;
  });
}

export async function signOutOtherDevices(): Promise<ActionResult<null>> {
  return attempt(async () => {
    await getViewer();
    await wait(500);
    account.signOutOthers();
    revalidatePath("/account");
    return null;
  });
}

/* Scan and brand */

export async function startScan(url: string): Promise<ActionResult<{ scanId: string }>> {
  return attempt(async () => {
    const viewer = await getViewer();
    return { scanId: scans.start(url, viewer.id) };
  });
}

export async function readScan(scanId: string): Promise<ActionResult<Scan>> {
  return attempt(async () => {
    const viewer = await getViewer();
    const scan = scans.read(scanId, viewer.id);
    if (!scan) throw new Error("That scan has expired. Start again.");
    return scan;
  });
}

/** Saves the checked brand kit and chosen platforms as a new brand (S17a). */
export async function createClient(input: NewClientInput): Promise<ActionResult<Client>> {
  return attempt(async () => {
    await wait(700);
    const viewer = await getViewer();
    const db = getDb();
    const client = newClient(db, input, viewer.id);
    addBrand(client);
    revalidatePath("/");
    return clone(client);
  });
}

/** Settings: brand kit (per card), business details, planned platforms and preferences. */
export async function updateClient(id: string, patch: ClientPatch): Promise<ActionResult<Client>> {
  return attempt(async () => {
    await wait(600);
    const client = await requireClient(id);
    Object.assign(client, patch);
    // The workspace accent always follows the first brand colour.
    if (patch.brand) client.accent = patch.brand.colors[0]?.hex ?? client.accent;
    // The kit's "last edited" date only moves when a kit field (not preferences) changed.
    if (patch.name || patch.industry || patch.brand || patch.business || patch.platforms) {
      client.kitEditedAt = new Date().toISOString();
    }
    revalidateClient(id);
    return clone(client);
  });
}

async function setBrandStatus(id: string, status: Client["status"]): Promise<BrandCard> {
  const client = await requireClient(id);
  client.status = status;
  revalidateClient(id);
  revalidateAdmin();
  const db = getDb();
  return admin.brandCardOf(db, client);
}

/** Archive instead of delete (S16). The brand leaves every list; its data stays. */
export async function archiveBrand(id: string): Promise<ActionResult<BrandCard>> {
  return attempt(async () => {
    await wait(600);
    return setBrandStatus(id, "archived");
  });
}

export async function restoreBrand(id: string): Promise<ActionResult<BrandCard>> {
  return attempt(async () => {
    await wait(500);
    return setBrandStatus(id, "active");
  });
}

export async function deleteClient(id: string): Promise<ActionResult<null>> {
  return attempt(async () => {
    await wait(700);
    await requireClient(id);
    removeClient(id);
    revalidateClient(id);
    return null;
  });
}

/* Accounts */

/**
 * Connect a social profile.
 *
 * Against the real API this is a redirect, not a request: the API returns the
 * network's OAuth consent URL, the browser goes there, and the network sends the
 * person back to Settings with the account connected. The mock skips the trip
 * and connects a handle derived from the client's name.
 */
export async function connectAccount(clientId: string, platform: Platform): Promise<ActionResult<Client>> {
  return attempt(async () => {
    await wait(1400);
    const client = await requireClient(clientId);
    const extras = getDb().extras[clientId];
    const connectedAt = new Date();
    client.accounts = [
      ...client.accounts.filter((a) => a.platform !== platform),
      { platform, handle: handleFor(client.name), status: "connected", connectedAt: connectedAt.toISOString() },
    ];
    if (extras) {
      delete extras.connectErrors[platform];
      extras.accessExpiresAt[platform] = addDays(connectedAt, 60).toISOString();
    }
    revalidateClient(clientId);
    return clone(client);
  });
}

export async function disconnectAccount(clientId: string, platform: Platform): Promise<ActionResult<Client>> {
  return attempt(async () => {
    await wait(500);
    const client = await requireClient(clientId);
    client.accounts = client.accounts.filter((a) => a.platform !== platform);
    delete getDb().extras[clientId]?.accessExpiresAt[platform];
    revalidateClient(clientId);
    return clone(client);
  });
}

/** "Skip, connect later" in onboarding (S17b). Approved posts wait for the connection. */
export async function skipConnecting(clientId: string): Promise<ActionResult<OnboardingState>> {
  return attempt(async () => {
    const client = await requireClient(clientId);
    const db = getDb();
    db.extras[clientId]!.connectSkipped = true;
    revalidateClient(clientId);
    const state = settings.onboardingOf(db, client);
    return state;
  });
}

/** An admin's alternative to connecting now: the client gets a link and connects themselves (S17b in admin context). */
export async function sendConnectLink(clientId: string): Promise<ActionResult<{ email: string }>> {
  return attempt(async () => {
    await requireAdmin();
    const client = await requireClient(clientId);
    const person = requirePerson(client.ownerId);
    const extras = getDb().extras[clientId];
    if (extras) extras.connectLinkSentAt = new Date().toISOString();
    return { email: person.email };
  });
}

export async function updatePreferences(clientId: string, preferences: Preferences): Promise<ActionResult<Preferences>> {
  return attempt(async () => {
    await wait(500);
    const client = await requireClient(clientId);
    const db = getDb();
    if (preferences.timezone !== client.preferences.timezone) {
      settings.keepClockTimes(db, client, client.preferences.timezone, preferences.timezone);
    }
    client.preferences = {
      timezone: preferences.timezone,
      approvalEmails: preferences.approvalEmails,
      chatLanguage: preferences.chatLanguage,
    };
    db.extras[clientId]!.postLanguage = preferences.postLanguage;
    revalidateClient(clientId);
    const saved = settings.preferencesOf(db, client);
    return saved;
  });
}

/* Questionnaire and research */

async function requireQuestionnaire(clientId: string) {
  const client = await requireClient(clientId);
  const record = getDb().questionnaires[clientId];
  if (!record) throw new Error(NOT_FOUND);
  return { client, record };
}

/** Writes the questions in the chosen chat language (S18a). */
export async function startQuestionnaire(clientId: string, chatLanguage: Language): Promise<ActionResult<QuestionnaireView>> {
  return attempt(async () => {
    await wait(1800);
    const { client, record } = await requireQuestionnaire(clientId);
    questionnaire.start(record, client, chatLanguage);
    client.preferences.chatLanguage = chatLanguage;
    revalidateClient(clientId);
    const view = questionnaire.viewOf(record);
    return view;
  });
}

/** Saves one answer, first time or edited later (S18b-d, S18f). Later answers are never reset. */
export async function answerQuestion(
  clientId: string,
  sessionId: string,
  questionId: string,
  answer: QuestionAnswer,
): Promise<ActionResult<QuestionnaireView>> {
  return attempt(async () => {
    await wait(250);
    const viewer = await getViewer();
    const { record } = await requireQuestionnaire(clientId);
    const answeredBy = viewer.role === "admin" ? "agency" : "client";
    questionnaire.answer(record, sessionId, questionId, answer, answeredBy);
    revalidateClient(clientId);
    const view = questionnaire.viewOf(record);
    return view;
  });
}

/** The summary's "Looks right" (S18e): follow-ups the first time, then approval starts research. */
export async function submitQuestionnaire(clientId: string, sessionId?: string): Promise<ActionResult<QuestionnaireSubmitResponse>> {
  return attempt(async () => {
    await wait(1500);
    const { record } = await requireQuestionnaire(clientId);
    const db = getDb();
    const review = questionnaire.review(record, sessionId);
    revalidateClient(clientId);
    if (!review.approved) return { ...review, final: false, reopen: [] };
    db.extras[clientId]!.postLanguage = record.facts!.postLanguage;
    const researchRecord = db.research[clientId]!;
    research.run(researchRecord);
    const view = clone(researchRecord.view);
    return { approved: true, research: view };
  });
}

/** Runs research, first time, after a failure, or again (S19c, S21b). The current version stays readable. */
export async function runResearch(clientId: string): Promise<ActionResult<ResearchView>> {
  return attempt(async () => {
    await requireClient(clientId);
    const db = getDb();
    if (!questionnaire.isApproved(db.questionnaires[clientId])) throw new Error("Finish the questionnaire before research can start.");
    const record = db.research[clientId]!;
    research.run(record);
    revalidateClient(clientId);
    return clone(record.view);
  });
}

/** Polled by the research screens while a run is going. */
export async function readResearch(clientId: string): Promise<ActionResult<ResearchView>> {
  return attempt(async () => {
    const client = await requireClient(clientId);
    const db = getDb();
    const view = settleResearch(db, client);
    if (!view) throw new Error(NOT_FOUND);
    return clone(view);
  });
}

/* Strategy */

async function requireStrategy(clientId: string) {
  await requireClient(clientId);
  const strategy = getDb().strategies.find((s) => s.clientId === clientId);
  if (!strategy) throw new Error("No strategy has been drafted for this brand yet.");
  return strategies.settle(strategy);
}

/** "Start now" on a draft (S20a). Sets `approvedBy`; starting never publishes. */
export async function startStrategyNow(clientId: string): Promise<ActionResult<Strategy>> {
  return attempt(async () => {
    await wait(600);
    const strategy = await requireStrategy(clientId);
    const viewer = await getViewer();
    strategies.startNow(strategy, viewer.id);
    revalidateClient(clientId);
    return clone(strategy);
  });
}

/** "Ask for changes" (S20b): the next version, as a draft with a fresh 30 minutes. */
export async function askForStrategyChanges(clientId: string, request: string): Promise<ActionResult<Strategy>> {
  return attempt(async () => {
    const note = request.trim();
    if (!note) throw new Error("Say what you would like changed.");
    await wait(2400);
    const strategy = await requireStrategy(clientId);
    const db = getDb();
    strategies.draftNext(db, strategy, note);
    revalidateClient(clientId);
    return clone(strategy);
  });
}

/** The "AI learns, new strategy" step of the loop: a rewrite from learnings, as a new draft. */
export async function regenerateStrategy(clientId: string): Promise<ActionResult<Strategy>> {
  return attempt(async () => {
    await wait(2400);
    const strategy = await requireStrategy(clientId);
    const db = getDb();
    strategies.draftNext(db, strategy, null);
    strategies.shiftMixTowardLeader(strategy);
    revalidateClient(clientId);
    return clone(strategy);
  });
}

/* Posts */

/** The strategy new posts are drafted from, and how many posts the brand already has. */
function draftingContext(clientId: string): { strategy: Strategy; existing: number } {
  const db = getDb();
  const strategy = db.strategies.find((s) => s.clientId === clientId);
  if (!strategy) throw new Error("Generate a strategy before creating content.");
  const existing = db.posts.filter((p) => p.clientId === clientId).length;
  return { strategy, existing };
}

export async function generatePosts(clientId: string, count: number): Promise<ActionResult<Post[]>> {
  return attempt(async () => {
    await wait(2200);
    const client = await requireClient(clientId);
    const db = getDb();
    const { strategy, existing } = draftingContext(clientId);
    const created = Array.from({ length: count }, (_, i) => {
      const day = startOfDay(addDays(new Date(), 3 + i * 2));
      const when = addHours(day, 9 + (i % 3) * 4);
      return draftPost(client, strategy, existing + i, i, client.platforms[i % client.platforms.length]!, when);
    });
    db.posts.push(...created);
    recounted(db);
    revalidateClient(clientId);
    return clone(created);
  });
}

function draftPost(client: Client, strategy: Strategy, serial: number, offset: number, platform: Platform, when: Date): Post {
  const pillar = strategy.pillars[offset % strategy.pillars.length]!;
  const format = (["reel", "carousel", "image"] as const)[offset % 3]!;
  return {
    id: `${client.id}-g${Date.now().toString(36)}${offset}`,
    clientId: client.id,
    platform,
    format,
    pillarId: pillar.id,
    hook: `${pillar.name}, take ${serial + 1}`,
    caption: `${pillar.description} Drafted from strategy v${strategy.version}. Edit anything that doesn't sound like ${client.name}.`,
    hashtags: [`#${pillar.id}`, "#smallbusiness"],
    status: "in_review",
    scheduledFor: when.toISOString(),
    publishedAt: null,
    art: { variant: serial % 4, colorIndex: offset % client.brand.colors.length },
    durationSec: format === "reel" ? 10 : undefined,
    slides: format === "carousel" ? 5 : undefined,
    aiNote: `Fits "${pillar.name}" (${pillar.share}% of the mix) and fills an empty slot in the next two weeks.`,
    approval: null,
  };
}

/** Tapping a free best time in the calendar: the agent drafts a post for it, which still needs approval. */
export async function draftPostForSlot(clientId: string, platform: Platform, when: string): Promise<ActionResult<PostView>> {
  return attempt(async () => {
    await wait(1800);
    const client = await requireClient(clientId);
    const db = getDb();
    const { strategy, existing } = draftingContext(clientId);
    const post = draftPost(client, strategy, existing, existing, platform, new Date(when));
    db.posts.push(post);
    recounted(db);
    revalidateClient(clientId);
    const view = posts.viewOf(db, post);
    return view;
  });
}

/**
 * Posts waiting for approval, soonest first, for the agent chat's inline post chips.
 * A read, but the chat calls it from the client, so it goes through an action like a write does.
 */
export async function getReviewQueuePosts(clientId: string): Promise<ActionResult<PostView[]>> {
  return attempt(async () => {
    const client = await requireClient(clientId);
    return posts.content(getDb(), client.id, { state: "needs_approval" });
  });
}

export async function updatePost(postId: string, patch: PostPatch): Promise<ActionResult<Post>> {
  return attempt(async () => {
    await wait(300);
    const db = getDb();
    const { post } = await requirePost(postId);
    Object.assign(post, patch);
    // An approved post with a slot goes straight onto the schedule.
    if (patch.status === "approved" && post.scheduledFor) post.status = "scheduled";
    recounted(db);
    revalidateClient(post.clientId);
    return clone(post);
  });
}

/** Keeps the state before a decision so Undo can put it back. */
function remember(post: Post) {
  getDb().decisions[post.id] = {
    status: post.status,
    approval: post.approval ?? null,
    rejectReason: post.rejectReason ?? null,
    changeRequest: post.changeRequest ?? null,
  };
}

function reviewed(post: Post): ReviewResult {
  const db = getDb();
  recounted(db);
  revalidateClient(post.clientId);
  const view = posts.viewOf(db, post);
  const nextPostId = posts.nextWaiting(db, post.clientId, post.id);
  return { post: view, nextPostId };
}

/**
 * "Approve" and "Approve, next post" (S08, S09). Allowed without a connected account:
 * the post then waits as "Approved, waiting for <network>".
 */
export async function approvePost(postId: string): Promise<ActionResult<ReviewResult>> {
  return attempt(async () => {
    await wait(300);
    const { post } = await requirePost(postId);
    const viewer = await getViewer();
    remember(post);
    post.status = post.scheduledFor ? "scheduled" : "approved";
    post.approval = { at: new Date().toISOString(), byAgency: viewer.role === "admin" };
    return reviewed(post);
  });
}

/** Reject, with an optional reason that feeds the learnings (S09d). */
export async function rejectPost(postId: string, reason?: string): Promise<ActionResult<ReviewResult>> {
  return attempt(async () => {
    await wait(300);
    const { post } = await requirePost(postId);
    remember(post);
    post.status = "rejected";
    post.rejectReason = reason?.trim() || null;
    return reviewed(post);
  });
}

/** Adds or changes the reason after the reject, from the Undo toast's reason chips. */
export async function setRejectReason(postId: string, reason: string): Promise<ActionResult<PostView>> {
  return attempt(async () => {
    const { post } = await requirePost(postId);
    if (post.status !== "rejected") throw new Error("Only a rejected post has a reason.");
    post.rejectReason = reason.trim() || null;
    revalidateClient(post.clientId);
    const db = getDb();
    const view = posts.viewOf(db, post);
    return view;
  });
}

/** "Ask for changes" on a post: the agent rewrites it and it comes back for approval. */
export async function askForPostChanges(postId: string, request: string): Promise<ActionResult<ReviewResult>> {
  return attempt(async () => {
    const note = request.trim();
    if (!note) throw new Error("Say what you would like changed.");
    await wait(1600);
    const { post } = await requirePost(postId);
    remember(post);
    post.status = "in_review";
    post.approval = null;
    post.changeRequest = note;
    post.aiNote = `Rewritten after your note: "${note}".`;
    return reviewed(post);
  });
}

/** Puts a post back to how it was before the last approve, reject or change request. */
export async function undoPostDecision(postId: string): Promise<ActionResult<PostView>> {
  return attempt(async () => {
    const { post } = await requirePost(postId);
    const db = getDb();
    const before = db.decisions[postId];
    if (!before) throw new Error("There is nothing to undo on this post.");
    Object.assign(post, before);
    delete db.decisions[postId];
    recounted(db);
    revalidateClient(post.clientId);
    const view = posts.viewOf(db, post);
    return view;
  });
}

/** Sets a post's date and time (S08) or moves it in the calendar (S11). Only this post moves. */
export async function reschedulePost(postId: string, when: string): Promise<ActionResult<PostView>> {
  return attempt(async () => {
    await wait(300);
    const { post } = await requirePost(postId);
    if (post.status === "published") throw new Error("This post has already gone out.");
    const at = new Date(when);
    if (Number.isNaN(at.getTime()) || at.getTime() < Date.now()) throw new Error("Pick a time in the future.");
    post.scheduledFor = at.toISOString();
    post.failure = null;
    revalidateClient(post.clientId);
    const db = getDb();
    const view = posts.viewOf(db, post);
    return view;
  });
}

/* Admin */

/** Invites a client by email (ADM-3). An email already in use is refused. */
export async function inviteClient(input: InviteClientInput): Promise<ActionResult<AdminClientRow>> {
  return attempt(async () => {
    await requireAdmin();
    const parsed = inviteClientSchema.safeParse(input);
    if (!parsed.success) throw new Error("Enter a valid email address.");
    await wait(700);
    const db = getDb();
    const { email, name, phone } = parsed.data;
    if (db.people.some((p) => p.email === email)) throw new Error("That email is already in use by a client.");
    const invitedAt = new Date().toISOString();
    const person = {
      id: `user_${Date.now().toString(36)}`,
      email,
      name: name ?? null,
      imageUrl: null,
      phone: phone ?? null,
      status: "invited" as const,
      brandCount: 0,
      createdAt: invitedAt,
      invitedAt,
      lastSignedInAt: null,
      lastActivity: { at: null, what: "Invite sent" },
    };
    db.people.unshift(person);
    revalidateAdmin();
    const row = admin.rowOf(db, person);
    return row;
  });
}

export async function resendInvite(clientId: string): Promise<ActionResult<AdminClientRow>> {
  return attempt(async () => {
    await requireAdmin();
    await wait(500);
    const person = requirePerson(clientId);
    if (person.status !== "invited") throw new Error("This client has already signed in.");
    person.invitedAt = new Date().toISOString();
    person.lastActivity = { at: null, what: "Invite sent again" };
    revalidateAdmin();
    const db = getDb();
    const row = admin.rowOf(db, person);
    return row;
  });
}

/** Cancels an invite that was never accepted. Brands made for them are removed too. */
export async function cancelInvite(clientId: string): Promise<ActionResult<null>> {
  return attempt(async () => {
    await requireAdmin();
    await wait(500);
    const person = requirePerson(clientId);
    if (person.status !== "invited") throw new Error("This client has already signed in.");
    const db = getDb();
    const owned = db.clients.filter((c) => c.ownerId === clientId);
    owned.forEach((brand) => removeClient(brand.id));
    db.people = db.people.filter((p) => p.id !== clientId);
    db.failedScans = db.failedScans.filter((s) => s.ownerId !== clientId);
    revalidateAdmin();
    return null;
  });
}

/** Starts the scan for a client's new brand (ADM-5). Poll it with `readScan`, then `createBrandForClient`. */
export async function addBrandForClient(clientId: string, url: string): Promise<ActionResult<{ scanId: string }>> {
  return attempt(async () => {
    const viewer = await requireAdmin();
    requirePerson(clientId);
    const scanId = scans.start(url, viewer.id);
    return { scanId };
  });
}

/** Saves the brand kit the admin checked (S17a in admin context) as the client's brand. */
export async function createBrandForClient(clientId: string, input: NewClientInput): Promise<ActionResult<Client>> {
  return attempt(async () => {
    await requireAdmin();
    requirePerson(clientId);
    await wait(700);
    const db = getDb();
    const client = newClient(db, input, clientId);
    addBrand(client);
    admin.clearPendingScan(clientId);
    revalidateAdmin();
    return clone(client);
  });
}

/* Observability */

/** OBS-3: starts the same run again. The mock only simulates the wait; a real run would appear in Recent runs. */
export async function rerunAgentRun(runId: string): Promise<ActionResult<null>> {
  return attempt(async () => {
    await requireAdmin();
    if (!runId) throw new Error("Run not found.");
    await wait(900);
    revalidatePath("/admin/observability/agents", "layout");
    return null;
  });
}

export async function markFrontendErrorFixed(errorId: string): Promise<ActionResult<null>> {
  return attempt(async () => {
    await requireAdmin();
    const fixed = getDb().fixedErrors;
    if (!fixed.includes(errorId)) fixed.push(errorId);
    revalidatePath("/admin/observability", "layout");
    return null;
  });
}

/* Agency settings (ADM-7): the agency's own team and where Cadence sends alerts. */

/** Invites a teammate as an admin. They show up as Invited until they sign in. */
export async function inviteTeammate(input: { name: string; email: string }): Promise<ActionResult<TeamMember>> {
  return attempt(async () => {
    await requireAdmin();
    await wait(700);
    const email = input.email.trim().toLowerCase();
    const db = getDb();
    if (db.team.some((m) => m.email === email)) throw new Error("That email is already on your team.");
    const member: TeamMember = {
      id: `team_${Date.now().toString(36)}`,
      name: input.name.trim(),
      email,
      imageUrl: null,
      role: "admin",
      status: "invited",
      invitedAt: new Date().toISOString(),
    };
    db.team.push(member);
    revalidateAgencySettings();
    return clone(member);
  });
}

/** The owner can't be removed. */
export async function removeTeammate(memberId: string): Promise<ActionResult<null>> {
  return attempt(async () => {
    await requireAdmin();
    await wait(500);
    const db = getDb();
    const member = db.team.find((m) => m.id === memberId);
    if (!member) throw new Error("This teammate no longer exists.");
    if (member.role === "owner") throw new Error("The owner can't be removed.");
    db.team = db.team.filter((m) => m.id !== memberId);
    revalidateAgencySettings();
    return null;
  });
}

function requireChannel(kind: AlertChannelKind): NotificationChannel {
  const channel = getDb().channels.find((c) => c.kind === kind);
  if (!channel) throw new Error("That channel isn't available.");
  return channel;
}

export async function connectSlack(webhookUrl: string): Promise<ActionResult<NotificationChannel>> {
  return attempt(async () => {
    await requireAdmin();
    if (!webhookUrl.trim()) throw new Error("Paste the webhook URL.");
    await wait(900);
    const channel = requireChannel("slack");
    channel.connected = true;
    channel.detail = "Webhook connected.";
    revalidateAgencySettings();
    return clone(channel);
  });
}

export async function connectWhatsApp(phoneNumber: string, apiToken: string): Promise<ActionResult<NotificationChannel>> {
  return attempt(async () => {
    await requireAdmin();
    if (!apiToken.trim()) throw new Error("Enter the API token.");
    await wait(900);
    const channel = requireChannel("whatsapp");
    channel.connected = true;
    channel.detail = `Sends to ${phoneNumber.trim()}`;
    revalidateAgencySettings();
    return clone(channel);
  });
}

/** Email can't be disconnected; the type keeps that out of reach here. */
export async function disconnectChannel(kind: ConnectableChannelKind): Promise<ActionResult<NotificationChannel>> {
  return attempt(async () => {
    await requireAdmin();
    await wait(400);
    const channel = requireChannel(kind);
    channel.connected = false;
    channel.detail = kind === "discord" ? "Not connected. Paste a webhook URL to route alerts to a channel." : "Not connected.";
    revalidateAgencySettings();
    return clone(channel);
  });
}

/** One switch in the Alerts panel: this alert, routed to this channel, on or off. */
export async function setAlertRouting(alertKind: AlertKind, channel: AlertChannelKind, on: boolean): Promise<ActionResult<AlertRow>> {
  return attempt(async () => {
    await requireAdmin();
    await wait(250);
    const db = getDb();
    const alert = db.alerts.find((a) => a.kind === alertKind);
    if (!alert) throw new Error("That alert no longer exists.");
    alert.routing = { ...alert.routing, [channel]: on };
    revalidateAgencySettings();
    return clone(alert);
  });
}
