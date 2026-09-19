// DRAFT: written to give the pages a realistic shape. This is not legal advice and must be reviewed by a lawyer.

export interface LegalDoc {
  title: string;
  lead: string;
  updated: string;
  draftNotice: string;
  sections: { heading: string; body: string[] }[];
}

const draftNotice = "Draft text. Have a lawyer review it before this site goes live.";

export const PRIVACY: LegalDoc = {
  title: "Privacy",
  lead: "What we collect, why we collect it, and what you can do about it.",
  updated: "20 Sep 2026",
  draftNotice,
  sections: [
    {
      heading: "What we collect",
      body: [
        "Account details you give us: your name, email address and the name of your business.",
        "The website address you ask the agent to read, and the public content of that website.",
        "Access tokens for the social accounts you connect. We never see or store your social media passwords.",
        "The posts the agent drafts for you, your decisions about them, and the results those posts achieve.",
      ],
    },
    {
      heading: "How we use it",
      body: [
        "To build your brand kit, plan your strategy, draft posts, publish the ones you approve and measure how they do.",
        "To improve the service. We do not use your content to train models that serve other customers.",
        "To contact you about your account. We send marketing email only if you ask for it.",
      ],
    },
    {
      heading: "Who we share it with",
      body: [
        "The social networks you connect, so that approved posts can be published to them.",
        "Companies that provide our hosting, sign-in and AI models, under contracts that limit them to providing that service.",
        "Nobody else, unless the law requires it.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        "For as long as you have an account. When you delete a brand, its kit, posts and results are deleted with it. When you close your account, we delete your data within 30 days.",
      ],
    },
    {
      heading: "Your choices",
      body: [
        "You can see, correct or export your data from settings, disconnect any social account at any time, and ask us to delete everything by writing to us.",
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: "Terms",
  lead: "The agreement between you and us when you use the service.",
  updated: "20 Sep 2026",
  draftNotice,
  sections: [
    {
      heading: "The service",
      body: [
        "We provide an AI agent that drafts, schedules and publishes social media posts for the brands you add. The agent publishes only the posts you have approved.",
      ],
    },
    {
      heading: "Your account",
      body: [
        "You are responsible for keeping your sign-in details safe and for everything done through your account. You must have the right to connect the social accounts and the website you add.",
      ],
    },
    {
      heading: "Your content",
      body: [
        "Your brand, your media and the posts made for you belong to you. You give us permission to store, process and publish them so that we can provide the service.",
        "You are responsible for the posts you approve, including that they are accurate, lawful and follow the rules of each network.",
      ],
    },
    {
      heading: "Paying for the service",
      body: [
        "Paid plans are billed monthly in advance. You can cancel at any time, and your plan runs until the end of the period you have paid for.",
      ],
    },
    {
      heading: "What we can't promise",
      body: [
        "AI-written drafts can contain mistakes, which is why every post waits for your approval. We do not guarantee any particular reach, engagement or sales. Social networks can change or withdraw access to their platforms, which may affect the service.",
      ],
    },
    {
      heading: "Ending the agreement",
      body: [
        "You can close your account at any time. We can suspend an account that is used to break the law or the rules of a social network.",
      ],
    },
  ],
};
