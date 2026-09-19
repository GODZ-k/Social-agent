export interface QA {
  q: string;
  a: string;
}

export const FAQ: QA[] = [
  {
    q: "Will it post anything without asking me?",
    a: "No. Every post waits in your approvals queue until you approve it. If you approve nothing, nothing goes out.",
  },
  {
    q: "What does it need from me to start?",
    a: "Your website address. The agent reads the site to learn your colours, your tone and what you offer. You can correct anything it gets wrong in the brand kit before it writes a single post.",
  },
  {
    q: "Which networks does it post to?",
    a: "Instagram, Facebook, LinkedIn and TikTok. You connect the accounts you want and leave out the ones you don't.",
  },
  {
    q: "Can I edit a post before it goes out?",
    a: "Yes. Open any post to change the caption, the hashtags, the image or the publish time. You can also reject it, and the agent takes that into account next time.",
  },
  {
    q: "How does it know what works?",
    a: "It measures reach, saves, comments and clicks for every post it publishes. Each month it tells you what it learned, shows the posts behind each finding, and rewrites the strategy from them.",
  },
  {
    q: "I don't have a website. Can I still use it?",
    a: "A website gives the best start, but a public page that describes your business works too, such as a booking page or a shop listing. You can also fill in the brand kit by hand.",
  },
  {
    q: "Can I stop at any time?",
    a: "Yes. Disconnect your accounts or cancel from settings. Posts that are already scheduled stop with it.",
  },
];
