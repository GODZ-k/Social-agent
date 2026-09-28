import "server-only";
import { subDays, subHours } from "date-fns";
import { NOT_SURE, REQUIRED_QUESTIONNAIRE_KEYS } from "@social-agent/shared";
import type {
  BusinessType,
  Language,
  Questionnaire,
  QuestionnaireGoal,
  QuestionnaireQuestion,
  QuestionnaireSession,
  QuestionnaireState,
} from "@social-agent/shared";
import type { Client, QuestionAnswer, QuestionnaireView } from "@/lib/types";

/**
 * A mock of the Account Manager's guided questionnaire. Pure functions over one
 * brand's record; the actions pass the record in. Questions come in the chosen
 * chat language, and the first review always asks one follow-up so that screen has data.
 */

export interface QuestionnaireRecord {
  state: QuestionnaireState;
  /** The facts read from the answers once approved. */
  facts: Questionnaire | null;
  /** How many times the answers were reviewed; the first review asks a follow-up. */
  reviews: number;
  /** Who gave each answer, keyed by question id (2026-09-28: an admin can answer for the client). */
  answeredBy: Record<string, "agency" | "client">;
}

type Words = Record<Language, string>;

const w = (en: string, hi: string, hinglish: string): Words => ({ en, hi, hinglish });

const OTHER = "other:";

const REPLACED = "These questions were replaced. Reload to see the new ones.";

const withoutOther = (raw: string) => (raw.startsWith(OTHER) ? raw.slice(OTHER.length) : raw);

const option = (value: string, label: Words, lang: Language, min?: number, max?: number) => ({
  value,
  label: label[lang],
  ...(min === undefined ? {} : { min }),
  ...(max === undefined ? {} : { max }),
});

export function questionsFor(client: Pick<Client, "brand" | "name">, lang: Language): QuestionnaireQuestion[] {
  const offer = client.brand.summary.split(". ")[0]!.replace(/\.$/, "") + ".";
  return [
    {
      id: "offer",
      covers: ["offer"],
      why: "The website says what is sold; the owner confirms it is still right.",
      kind: "confirm",
      text: w("Is this right?", "क्या यह सही है?", "Kya yeh sahi hai?")[lang],
      prefill: offer,
      required: true,
    },
    {
      id: "type",
      covers: ["businessType"],
      why: "The website does not say whether services are sold too.",
      kind: "choice",
      text: w("Do you sell products, services, or both?", "आप सामान बेचते हैं, सेवा देते हैं, या दोनों?", "Aap products bechte ho, services dete ho, ya dono?")[lang],
      options: [
        option("product", w("Products", "सामान", "Products"), lang),
        option("service", w("Services", "सेवाएँ", "Services"), lang),
        option("both", w("Both", "दोनों", "Dono"), lang),
      ],
      required: true,
    },
    {
      id: "goal",
      covers: ["goal"],
      why: "Only the owner knows what matters most this quarter.",
      kind: "choice",
      text: w("What should social media do for you first?", "सोशल मीडिया सबसे पहले आपके लिए क्या करे?", "Social media sabse pehle aapke liye kya kare?")[lang],
      options: [
        option("more_customers", w("Bring new customers", "नए ग्राहक लाए", "Naye customers laaye"), lang),
        option("repeat_customers", w("Bring customers back", "ग्राहक दोबारा आएँ", "Customers wapas aayein"), lang),
        option("bigger_orders", w("Bigger orders", "बड़े ऑर्डर", "Bade orders"), lang),
        option("launch", w("Launch something new", "कुछ नया लॉन्च करना", "Kuch naya launch karna"), lang),
        option("awareness", w("Get known nearby", "आस-पास पहचान बने", "Aas-paas pehchaan bane"), lang),
      ],
      required: true,
    },
    {
      id: "lang",
      covers: ["postLanguage"],
      why: "Posts can go out in a different language from this chat.",
      kind: "choice",
      text: w("Which language should your posts be in?", "आपकी पोस्ट किस भाषा में हों?", "Aapke posts kis language mein hon?")[lang],
      options: [
        option("en", w("English", "अंग्रेज़ी", "English"), lang),
        option("hi", w("Hindi", "हिंदी", "Hindi"), lang),
        option("hinglish", w("Hinglish", "हिंग्लिश", "Hinglish"), lang),
      ],
      required: true,
    },
    {
      id: "customer",
      covers: ["idealCustomer"],
      why: "The website describes everyone; the owner knows who buys most.",
      kind: "text",
      text: w("Who is your best customer?", "आपका सबसे अच्छा ग्राहक कौन है?", "Aapka best customer kaun hai?")[lang],
      example: client.brand.audience,
      required: true,
    },
    {
      id: "order",
      covers: ["orderValue"],
      why: "Prices vary; a typical order tells the strategy what to push.",
      kind: "range",
      text: w("How much is a typical order?", "एक आम ऑर्डर कितने का होता है?", "Ek normal order kitne ka hota hai?")[lang],
      currency: "USD",
      options: [
        option("u25", w("Under $25", "$25 से कम", "$25 se kam"), lang, 0, 25),
        option("25to50", w("$25 to $50", "$25 से $50", "$25 se $50"), lang, 25, 50),
        option("50to100", w("$50 to $100", "$50 से $100", "$50 se $100"), lang, 50, 100),
        option("o100", w("Over $100", "$100 से ज़्यादा", "$100 se zyada"), lang, 100),
      ],
      required: false,
    },
    {
      id: "sellers",
      covers: ["bestSellers"],
      why: "The shop lists everything; best sellers deserve more posts.",
      kind: "text",
      text: w("What sells best right now?", "अभी सबसे ज़्यादा क्या बिकता है?", "Abhi sabse zyada kya bikta hai?")[lang],
      example: `For ${client.name}: the one item people come back for.`,
      required: false,
    },
    {
      id: "asks",
      covers: [],
      why: "Written for this brand: customer questions make good posts.",
      kind: "text",
      text: w("What do customers ask you most?", "ग्राहक आपसे सबसे ज़्यादा क्या पूछते हैं?", "Customers aapse sabse zyada kya poochte hain?")[lang],
      required: false,
    },
  ];
}

function followUpFor(lang: Language): QuestionnaireQuestion {
  return {
    id: "capacity",
    covers: ["capacity"],
    why: "More customers only helps if the business can serve them.",
    kind: "choice",
    text: w("How many new orders a week can you handle?", "आप हफ़्ते में कितने नए ऑर्डर संभाल सकते हैं?", "Aap hafte mein kitne naye orders sambhaal sakte ho?")[lang],
    options: [
      option("20", w("Up to 20", "20 तक", "20 tak"), lang),
      option("50", w("20 to 50", "20 से 50", "20 se 50"), lang),
      option("100", w("50 to 100", "50 से 100", "50 se 100"), lang),
      option("more", w("More than 100", "100 से ज़्यादा", "100 se zyada"), lang),
    ],
    required: true,
  };
}

const FOLLOW_UP_REASON: Words = w(
  "One thing the website does not say: how many orders you can take a week.",
  "एक बात वेबसाइट नहीं बताती: आप हफ़्ते में कितने ऑर्डर ले सकते हैं।",
  "Ek baat website nahi batati: aap hafte mein kitne orders le sakte ho.",
);

function newSession(client: Pick<Client, "brand" | "name">, lang: Language, updatedAt: string): QuestionnaireSession {
  return {
    sessionId: crypto.randomUUID(),
    chatLanguage: lang,
    questions: questionsFor(client, lang),
    answers: {},
    followUps: [],
    updatedAt,
  };
}

const allQuestions = (session: QuestionnaireSession) => [...session.questions, ...session.followUps];

/** The summary and answers-panel rows show these instead of the full question text. */
const SHORT_LABEL: Record<string, string> = {
  offer: "You sell",
  type: "Selling as",
  goal: "Posts should",
  lang: "Posts in",
  customer: "Best customers",
  order: "Typical order",
  sellers: "Best sellers",
  asks: "Customers ask",
  capacity: "Weekly capacity",
};

/** The API stores every answer as text; "Something else" and a fixed confirm carry an `other:` prefix. */
export function encodeAnswer(answer: QuestionAnswer): string {
  if (answer.kind === "option") return answer.value;
  if (answer.kind === "confirm") return "yes";
  if (answer.kind === "not_sure") return NOT_SURE;
  if (answer.kind === "other") return `${OTHER}${answer.text.trim()}`;
  return answer.text.trim();
}

function readable(question: QuestionnaireQuestion, raw: string): string {
  if (raw === NOT_SURE) return "Not sure";
  if (raw.startsWith(OTHER)) return raw.slice(OTHER.length);
  if (question.kind === "confirm" && raw === "yes") return question.prefill ?? "Yes";
  return question.options?.find((o) => o.value === raw)?.label ?? raw;
}

export function viewOf(record: QuestionnaireRecord): QuestionnaireView {
  const session = record.state.session;
  if (!session) return { ...structuredClone(record.state), summary: [], labels: {}, unanswered: [] };
  const followUpIds = new Set(session.followUps.map((q) => q.id));
  const questions = allQuestions(session);
  const summary = questions.flatMap((q) => {
    const raw = session.answers[q.id];
    if (raw === undefined) return [];
    // Records made before this field existed have none; they count as the client's.
    const answeredBy = record.answeredBy?.[q.id] ?? "client";
    return [{ questionId: q.id, question: q.text, answer: readable(q, raw), followUp: followUpIds.has(q.id), answeredBy }];
  });
  const labels = Object.fromEntries(questions.map((q) => [q.id, SHORT_LABEL[q.id] ?? q.text]));
  const unanswered = questions.filter((q) => q.required && !session.answers[q.id]).map((q) => q.id);
  return { ...structuredClone(record.state), summary, labels, unanswered };
}

/** Writes a fresh question list in the chosen language. Answers from an older list are dropped. */
export function start(record: QuestionnaireRecord, client: Client, lang: Language) {
  record.state = { status: "in_progress", session: newSession(client, lang, new Date().toISOString()), approvedAt: null };
  record.reviews = 0;
  record.answeredBy = {};
}

/** Saves one answer. Changing an earlier answer never resets the later ones. */
export function answer(
  record: QuestionnaireRecord,
  sessionId: string,
  questionId: string,
  value: QuestionAnswer,
  answeredBy: "agency" | "client" = "client",
) {
  const session = record.state.session;
  if (!session || session.sessionId !== sessionId) throw new Error(REPLACED);
  if (!allQuestions(session).some((q) => q.id === questionId)) throw new Error("That question is not in this questionnaire.");
  const text = encodeAnswer(value);
  if (!text || text === OTHER) throw new Error("Type an answer first.");
  session.answers[questionId] = text;
  session.updatedAt = new Date().toISOString();
  record.answeredBy ??= {};
  record.answeredBy[questionId] = answeredBy;
  if (record.state.status === "approved") record.state = { ...record.state, status: "in_progress", approvedAt: null };
}

type Review = { approved: true } | { approved: false; reason: string; followUps: QuestionnaireQuestion[] };

/** The Account Manager's review: one follow-up the first time, then approval. */
export function review(record: QuestionnaireRecord, sessionId: string | undefined): Review {
  const session = record.state.session;
  if (!session || (sessionId && session.sessionId !== sessionId)) throw new Error(REPLACED);
  const missing = viewOf(record).unanswered;
  if (missing.length > 0) throw new Error("Answer the required questions first.");
  record.reviews += 1;
  if (record.reviews === 1 && session.followUps.length === 0) {
    const followUp = followUpFor(session.chatLanguage);
    session.followUps.push(followUp);
    return { approved: false, reason: FOLLOW_UP_REASON[session.chatLanguage], followUps: [followUp] };
  }
  const approvedAt = new Date().toISOString();
  record.state = { ...record.state, status: "approved", approvedAt };
  record.facts = factsFrom(session);
  return { approved: true };
}

const GOALS = new Set<QuestionnaireGoal["kind"]>(["more_customers", "repeat_customers", "bigger_orders", "launch", "awareness"]);
const TYPES = new Set<BusinessType>(["product", "service", "both"]);
const LANGUAGES = new Set<Language>(["en", "hi", "hinglish"]);

/** Code reads facts only from tapped options; free text goes to the notes. */
function factsFrom(session: QuestionnaireSession): Questionnaire {
  const byId = (id: string) => session.answers[id] ?? "";
  const plain = (id: string) => withoutOther(byId(id));
  const question = (id: string) => allQuestions(session).find((q) => q.id === id);
  const range = question("order")?.options?.find((o) => o.value === byId("order"));
  const custom = session.questions.filter((q) => q.covers.length === 0 && session.answers[q.id]);
  const goal = byId("goal") as QuestionnaireGoal["kind"];
  const type = byId("type") as BusinessType;
  const lang = byId("lang") as Language;
  return {
    offer: plain("offer") === "yes" ? (question("offer")?.prefill ?? "") : plain("offer"),
    businessType: TYPES.has(type) ? type : "product",
    goal: GOALS.has(goal) ? { kind: goal } : { kind: "more_customers", note: plain("goal") },
    postLanguage: LANGUAGES.has(lang) ? lang : session.chatLanguage,
    idealCustomer: plain("customer"),
    bestSellers: plain("sellers") || undefined,
    capacity: plain("capacity") || undefined,
    orderValue: range ? { min: range.min, max: range.max, currency: "USD" } : undefined,
    notes: custom.map((q) => ({ question: q.text, answer: readable(q, session.answers[q.id]!) })),
  };
}

/** Research may start only on an approved questionnaire (the required keys are all set). */
export const isApproved = (record: QuestionnaireRecord | undefined) =>
  record?.state.status === "approved" && REQUIRED_QUESTIONNAIRE_KEYS.every((key) => record.facts?.[key] !== undefined);

function answeredSession(client: Client, lang: Language, at: Date, complete: boolean): QuestionnaireSession {
  const session = newSession(client, lang, at.toISOString());
  const answers: Record<string, string> = complete
    ? { offer: "yes", type: "product", goal: "more_customers", lang, customer: client.brand.audience, order: "25to50", sellers: "The one people come back for", capacity: "50" }
    : { offer: "yes", type: "product", goal: `${OTHER}Shops ko stock karwana, aur online orders badhana` };
  session.answers = answers;
  if (complete) session.followUps = [followUpFor(lang)];
  return session;
}

/** Established brands are approved; Meow Meow Tweet is half-way, in Hinglish; new brands have not started. */
export function buildQuestionnaires(clients: Client[]): Record<string, QuestionnaireRecord> {
  const now = new Date();
  return Object.fromEntries(
    clients.map((client) => {
      if (client.id === "meow-meow-tweet") {
        const session = answeredSession(client, "hinglish", subHours(now, 1), false);
        return [client.id, { state: { status: "in_progress", session, approvedAt: null }, facts: null, reviews: 0, answeredBy: {} }];
      }
      if (client.status === "archived") return [client.id, notStarted()];
      const at = subDays(new Date(client.createdAt), -1);
      const record: QuestionnaireRecord = {
        state: { status: "in_progress", session: answeredSession(client, "en", at, true), approvedAt: null },
        facts: null,
        reviews: 1,
        answeredBy: {},
      };
      review(record, undefined);
      record.state.approvedAt = at.toISOString();
      return [client.id, record];
    }),
  );
}

export function notStarted(): QuestionnaireRecord {
  return { state: { status: "not_started", session: null, approvedAt: null }, facts: null, reviews: 0, answeredBy: {} };
}
