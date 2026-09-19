import type { QA } from "./faq";

// DRAFT: these plans and prices are invented for the first version of the site. Replace them before launch.

export interface Plan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  cta: string;
  /** Where the plan's button leads: sign-up for self-serve, contact for managed. */
  href: "signup" | "contact";
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    cadence: "per month",
    summary: "One brand on two networks. You approve everything yourself.",
    cta: "Get started",
    href: "signup",
  },
  {
    id: "growth",
    name: "Growth",
    price: "$149",
    cadence: "per month",
    summary: "One brand on every network, with more posts and a monthly review.",
    cta: "Get started",
    href: "signup",
  },
  {
    id: "managed",
    name: "Managed",
    price: "From $600",
    cadence: "per month",
    summary: "Our team runs it with you: we review every post and handle replies.",
    cta: "Talk to us",
    href: "contact",
  },
];

/** One value per plan, in the order of PLANS. `true` is included, `false` is not. */
export const PLAN_ROWS: { label: string; values: (string | boolean)[] }[] = [
  { label: "Brands", values: ["1", "1", "As many as you need"] },
  { label: "Networks", values: ["2", "All 4", "All 4"] },
  { label: "Posts each month", values: ["12", "30", "Agreed with you"] },
  { label: "Brand kit from your website", values: [true, true, true] },
  { label: "Approve, edit or reject every post", values: [true, true, true] },
  { label: "Best-time scheduling", values: [true, true, true] },
  { label: "Monthly learnings and a new strategy", values: [false, true, true] },
  { label: "Ask the agent questions", values: [false, true, true] },
  { label: "A person reviews posts before you see them", values: [false, false, true] },
  { label: "Replies to comments and messages", values: [false, false, true] },
];

export const PRICING_FAQ: QA[] = [
  {
    q: "Is there a free trial?",
    a: "Yes. The first 14 days are free on Starter and Growth, and you can approve and publish real posts during them.",
  },
  {
    q: "Can I change plan later?",
    a: "Yes, at any time from settings. A change takes effect from your next billing date.",
  },
  {
    q: "What counts as a post?",
    a: "One piece of content on one network. The same picture sent to Instagram and Facebook counts as two posts.",
  },
  {
    q: "Do you charge for posts I reject?",
    a: "No. Only approved posts count towards your monthly number.",
  },
];
